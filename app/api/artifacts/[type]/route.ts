// Edge runtime — NO fs/path usage allowed.
// Source: docs/architecture/fullstack-architecture.md#adr-01
export const runtime = 'edge';

import { z } from 'zod';
import { anthropic } from '@/lib/ai/client';
import { buildArtifactPrompt } from '@/lib/ai/prompts/artifacts';
import { SSE_HEADERS, sseArtifactChunk, sseSignal, sseError } from '@/lib/ai/streaming';
import type { ArtifactContext } from '@/types/index';

// --- Zod schemas ---------------------------------------------------------------

const ArtifactTypeSchema = z.enum([
  'security-posture-report',
  'budget-proposal-rosi',
  'security-program-roadmap',
  'iso27001-audit-checklist',
  'lgpd-adequacy-process',
]);

const ArtifactContextSchema = z.object({
  organizationName: z.string().min(1, 'Nome da organização é obrigatório'),
  sector: z.string().min(1, 'Setor é obrigatório'),
  maturityLevel: z.enum(['initial', 'developing', 'defined', 'managed', 'optimizing']),
  additionalContext: z.record(z.string(), z.string()).optional(),
});

// --- Route handler -------------------------------------------------------------

export async function POST(
  request: Request,
  { params }: { params: Promise<{ type: string }> }
) {
  // Validate URL param type
  const { type } = await params;
  const parsedType = ArtifactTypeSchema.safeParse(type);
  if (!parsedType.success) {
    return new Response(
      JSON.stringify({ code: 'INVALID_INPUT', message: `Tipo de artefato inválido: ${type}` }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  // Validate request body
  const body = await request.json().catch(() => null);
  const parsedBody = ArtifactContextSchema.safeParse(body);
  if (!parsedBody.success) {
    return new Response(
      JSON.stringify({
        code: 'INVALID_INPUT',
        message: parsedBody.error.issues[0]?.message ?? 'Dados de contexto inválidos',
      }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const context: ArtifactContext = {
    type: parsedType.data,
    ...parsedBody.data,
  };

  const prompt = buildArtifactPrompt(context);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 3000,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          await writer.write(sseArtifactChunk(event.delta.text));
        }
      }

      await writer.write(sseSignal('ARTIFACT_DONE'));
      await writer.write(sseSignal('COMPLETE'));
    } catch (error: unknown) {
      const status =
        error instanceof Error && 'status' in error
          ? (error as { status: number }).status
          : 0;

      try {
        if (status === 529 || status === 503) {
          await writer.write(sseError('API_UNAVAILABLE'));
        } else {
          await writer.write(sseError('STREAM_INTERRUPTED'));
        }
      } catch {
        // writer may already be closed
      }
    } finally {
      try {
        await writer.close();
      } catch {
        // writer may already be closed
      }
    }
  })();

  return new Response(readable, { headers: SSE_HEADERS });
}
