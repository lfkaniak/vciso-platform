// Server-side proxy for Gamma.app API.
// GAMMA_API_KEY is NEVER exposed to the client — all requests proxied here.
//
// API: https://public-api.gamma.app/v1.0/
// Auth: X-API-KEY header (not Bearer)
// Flow: POST /generations → poll GET /generations/{id} → return gammaUrl
//
// Deviation from architecture doc: API is async, not synchronous.
// Source: https://developers.gamma.app/docs/getting-started

import { z } from 'zod';
import { buildGammaPayload } from '@/lib/export/gamma';
import type { GeneratedArtifact } from '@/types/index';

const GAMMA_API_BASE = 'https://public-api.gamma.app/v1.0';
const MAX_POLL_ATTEMPTS = 24; // 24 × 5s = 120s max wait
// Lazily read poll interval to allow test injection via GAMMA_POLL_INTERVAL_MS=0
function getPollIntervalMs(): number {
  return parseInt(process.env.GAMMA_POLL_INTERVAL_MS ?? '5000');
}

const RequestSchema = z.object({
  artifact: z.object({
    type: z.enum([
      'security-posture-report',
      'budget-proposal-rosi',
      'security-program-roadmap',
      'iso27001-audit-checklist',
      'lgpd-adequacy-process',
    ]),
    title: z.string(),
    content: z.string().min(1),
    generatedAt: z.string().transform((s) => new Date(s)),
    context: z.object({
      type: z.enum([
        'security-posture-report',
        'budget-proposal-rosi',
        'security-program-roadmap',
        'iso27001-audit-checklist',
        'lgpd-adequacy-process',
      ]),
      organizationName: z.string(),
      sector: z.string(),
      maturityLevel: z.enum(['initial', 'developing', 'defined', 'managed', 'optimizing']),
      additionalContext: z.record(z.string(), z.string()).optional(),
    }),
  }),
});

function getGammaApiKey(): string | null {
  return process.env.GAMMA_API_KEY ?? null;
}

async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function POST(request: Request) {
  const apiKey = getGammaApiKey();
  if (!apiKey) {
    return Response.json(
      { error: 'GAMMA_NOT_CONFIGURED', message: 'Export para PowerPoint não configurado.' },
      { status: 503 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { error: 'INVALID_INPUT', message: 'Dados do artefato inválidos.' },
      { status: 400 }
    );
  }

  const artifact = parsed.data.artifact as GeneratedArtifact;
  const payload = buildGammaPayload(artifact);

  // Step 1: Start generation
  const startRes = await fetch(`${GAMMA_API_BASE}/generations`, {
    method: 'POST',
    headers: {
      'X-API-KEY': apiKey,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
  }).catch(() => null);

  if (!startRes || !startRes.ok) {
    const status = startRes?.status ?? 0;
    const errorCode = status === 429 ? 'GAMMA_RATE_LIMITED' : 'GAMMA_FAILED';
    return Response.json(
      { error: errorCode, message: 'Export para PowerPoint indisponível. Tente Markdown ou PDF.' },
      { status: 502 }
    );
  }

  const startBody = await startRes.json().catch(() => null) as { generationId?: string } | null;
  if (!startBody?.generationId) {
    return Response.json(
      { error: 'GAMMA_FAILED', message: 'Export para PowerPoint indisponível. Tente Markdown ou PDF.' },
      { status: 502 }
    );
  }
  const { generationId } = startBody;

  // Step 2: Poll for completion
  for (let attempt = 0; attempt < MAX_POLL_ATTEMPTS; attempt++) {
    await sleep(getPollIntervalMs());

    const pollRes = await fetch(`${GAMMA_API_BASE}/generations/${generationId}`, {
      headers: { 'X-API-KEY': apiKey },
    }).catch(() => null);

    if (!pollRes || !pollRes.ok) continue;

    const data = await pollRes.json() as {
      status: 'pending' | 'completed' | 'failed';
      gammaUrl?: string;
    };

    if (data.status === 'completed' && data.gammaUrl) {
      return Response.json({ url: data.gammaUrl });
    }

    if (data.status === 'failed') {
      return Response.json(
        { error: 'GAMMA_FAILED', message: 'Export para PowerPoint indisponível. Tente Markdown ou PDF.' },
        { status: 502 }
      );
    }
  }

  // Timeout
  return Response.json(
    { error: 'GAMMA_TIMEOUT', message: 'Export para PowerPoint demorou muito. Tente Markdown ou PDF.' },
    { status: 504 }
  );
}
