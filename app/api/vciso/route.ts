// Edge runtime — NO fs/path usage allowed.
// Source: docs/architecture/fullstack-architecture.md#adr-01, #62-route-handler
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { anthropic } from '@/lib/ai/client';
import { buildVCISOPrompt } from '@/lib/ai/prompts/vciso';
import { buildTenthManPrompt } from '@/lib/ai/prompts/tenth-man';
import { shouldActivateTenthMan, buildTenthManContext } from '@/lib/tenth-man/engine';
import { SSE_HEADERS, sseChunk, sseTenthChunk, sseError, sseSignal } from '@/lib/ai/streaming';

const RequestSchema = z.object({
  situation: z.string().min(10, 'Situação deve ter no mínimo 10 caracteres'),
  profile: z.enum(['executive', 'it-professional', 'consultant']),
  classification: z.object({
    mode: z.enum(['orient-me-now', 'help-decide', 'help-comply', 'help-operate']),
    relevantDomains: z.array(z.string()).min(1).max(3),
    urgency: z.enum(['high', 'medium', 'low']),
    confidence: z.number().min(0).max(1),
    detectedProfile: z.enum(['executive', 'it-professional', 'consultant']).optional(),
  }),
  domainContext: z.string().default(''),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Input inválido' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    );
  }

  const { situation, profile, classification, domainContext } = parsed.data;
  const prompt = buildVCISOPrompt(situation, profile, classification, domainContext);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    // Coordination flags for parallel streams
    let mainDone = false;
    let tenthDone = false;
    let closed = false;
    let tenthManStarted = false;
    let mainExcerpt = '';
    let tenthManTimeout: ReturnType<typeof setTimeout> | null = null;

    async function tryClose() {
      if (mainDone && tenthDone && !closed) {
        closed = true;
        if (tenthManTimeout) clearTimeout(tenthManTimeout);
        try {
          await writer.write(sseSignal('COMPLETE'));
          await writer.close();
        } catch {
          // writer may already be closed on error path
        }
      }
    }

    function getApiErrorStatus(error: unknown): number {
      return error instanceof Error && 'status' in error
        ? (error as { status: number }).status
        : 0;
    }

    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of stream) {
        if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
          const text = event.delta.text;
          mainExcerpt += text;
          await writer.write(sseChunk(text));

          // Trigger tenth man after ~300 chars — no await (parallel)
          if (!tenthManStarted && shouldActivateTenthMan(mainExcerpt)) {
            tenthManStarted = true;

            // Timeout guard: 10s deadline for tenth man
            tenthManTimeout = setTimeout(async () => {
              if (!tenthDone) {
                tenthDone = true;
                try { await writer.write(sseError('TENTH_MAN_TIMEOUT')); } catch { /* ignore */ }
                await tryClose();
              }
            }, 10000);

            // IIFE: runs in parallel without blocking main stream
            (async () => {
              try {
                const tenthContext = buildTenthManContext(situation, mainExcerpt);
                const tenthPrompt = buildTenthManPrompt(situation, tenthContext);
                const tenthStream = await anthropic.messages.stream({
                  model: 'claude-3-5-sonnet-20241022',
                  max_tokens: 600,
                  messages: [{ role: 'user', content: tenthPrompt }],
                });
                for await (const ev of tenthStream) {
                  if (ev.type === 'content_block_delta' && ev.delta.type === 'text_delta') {
                    await writer.write(sseTenthChunk(ev.delta.text));
                  }
                }
                if (tenthManTimeout) clearTimeout(tenthManTimeout);
                if (!tenthDone) {
                  await writer.write(sseSignal('TENTH_DONE'));
                }
              } catch (err) {
                if (tenthManTimeout) clearTimeout(tenthManTimeout);
                const status = getApiErrorStatus(err);
                if (!tenthDone) {
                  try {
                    await writer.write(
                      status === 529 || status === 503
                        ? sseError('TENTH_MAN_FAILED')
                        : sseError('TENTH_MAN_FAILED')
                    );
                  } catch { /* ignore */ }
                }
              } finally {
                tenthDone = true;
                await tryClose();
              }
            })();
          }
        }
      }

      await writer.write(sseSignal('MAIN_DONE'));
      mainDone = true;

      // If threshold was never reached, no tenth man — mark done immediately
      if (!tenthManStarted) {
        tenthDone = true;
      }
      await tryClose();
    } catch (error: unknown) {
      const status = getApiErrorStatus(error);
      try {
        if (status === 529 || status === 503) {
          await writer.write(sseError('API_UNAVAILABLE'));
        } else {
          await writer.write(sseError('STREAM_INTERRUPTED'));
        }
      } catch { /* ignore */ }

      if (!closed) {
        closed = true;
        try { await writer.close(); } catch { /* ignore */ }
      }
    }
  })();

  return new Response(readable, { headers: SSE_HEADERS });
}
