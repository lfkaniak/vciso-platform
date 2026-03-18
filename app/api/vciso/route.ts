// Edge runtime — NO fs/path usage allowed.
// Source: docs/architecture/fullstack-architecture.md#adr-01, #62-route-handler
export const runtime = 'edge';

import { NextRequest } from 'next/server';
import { z } from 'zod';
import { anthropic } from '@/lib/ai/client';
import { buildVCISOPrompt } from '@/lib/ai/prompts/vciso';
import { SSE_HEADERS, sseChunk, sseError, sseSignal } from '@/lib/ai/streaming';

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
    return new Response(JSON.stringify({ code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Input inválido' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { situation, profile, classification, domainContext } = parsed.data;
  const prompt = buildVCISOPrompt(situation, profile, classification, domainContext);

  const { readable, writable } = new TransformStream<Uint8Array, Uint8Array>();
  const writer = writable.getWriter();

  (async () => {
    try {
      const stream = await anthropic.messages.stream({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: prompt }],
      });

      for await (const event of stream) {
        if (
          event.type === 'content_block_delta' &&
          event.delta.type === 'text_delta'
        ) {
          await writer.write(sseChunk(event.delta.text));
        }
      }

      await writer.write(sseSignal('MAIN_DONE'));
      await writer.write(sseSignal('COMPLETE'));
    } catch (error: unknown) {
      const status =
        error instanceof Error && 'status' in error
          ? (error as { status: number }).status
          : 0;

      if (status === 529 || status === 503) {
        await writer.write(sseError('API_UNAVAILABLE'));
      } else {
        await writer.write(sseError('STREAM_INTERRUPTED'));
      }
    } finally {
      await writer.close();
    }
  })();

  return new Response(readable, { headers: SSE_HEADERS });
}
