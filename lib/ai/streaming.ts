// SSE multiplexed streaming helpers.
// Source: docs/architecture/fullstack-architecture.md#61-protocolo-sse-multiplexado

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache, no-transform',
  'X-Accel-Buffering': 'no',
} as const;

/** Encode a single SSE data line. */
export function encodeSSE(data: string): Uint8Array {
  return new TextEncoder().encode(`data: ${data}\n\n`);
}

/** Prefix helpers for the multiplexed protocol. */
export const sseChunk = (text: string) => encodeSSE(`M:${text}`);
export const sseSignal = (signal: string) => encodeSSE(`S:${signal}`);
export const sseError = (code: string) => encodeSSE(`S:ERROR:${code}`);
