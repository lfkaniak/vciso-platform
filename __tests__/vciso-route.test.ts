/**
 * @jest-environment node
 */
// Task 8.3 — Integration test for /api/vciso route
// Mocks the Anthropic client to avoid real API calls

jest.mock('@/lib/ai/client', () => ({
  anthropic: {
    messages: {
      stream: jest.fn(),
    },
  },
}));

// Mock server-only to avoid ESM issues in test environment
jest.mock('server-only', () => ({}));

import { POST } from '@/app/api/vciso/route';
import { NextRequest } from 'next/server';
import { anthropic } from '@/lib/ai/client';

const mockedStream = anthropic.messages.stream as jest.Mock;

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/vciso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

const validBody = {
  situation: 'Tivemos um ransomware hoje de manhã na empresa',
  profile: 'it-professional',
  classification: {
    mode: 'orient-me-now',
    relevantDomains: ['cissp-07'],
    urgency: 'high',
    confidence: 0.9,
  },
  domainContext: 'Conteúdo do domínio para teste',
};

describe('POST /api/vciso', () => {
  it('retorna 400 para input inválido', async () => {
    const res = await POST(makeRequest({ situation: 'curto', profile: 'executive' }));
    expect(res.status).toBe(400);
  });

  it('retorna stream SSE com eventos M: e S:COMPLETE', async () => {
    // Mock streaming events
    async function* mockStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '## Orientação Imediata\n\n' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'Isole os sistemas afetados.' } };
      yield { type: 'message_stop' };
    }

    mockedStream.mockReturnValue(mockStream());

    const res = await POST(makeRequest(validBody));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');
    expect(res.headers.get('Cache-Control')).toBe('no-cache, no-transform');
    expect(res.headers.get('X-Accel-Buffering')).toBe('no');

    // Read stream
    const reader = res.body!.getReader();
    const chunks: string[] = [];
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value));
    }

    const fullText = chunks.join('');
    expect(fullText).toContain('data: M:## Orientação Imediata');
    expect(fullText).toContain('data: S:MAIN_DONE');
    expect(fullText).toContain('data: S:COMPLETE');
  });

  it('retorna S:ERROR:API_UNAVAILABLE para erro 529', async () => {
    const err = Object.assign(new Error('Overloaded'), { status: 529 });
    async function* errorStream() {
      throw err;
    }
    mockedStream.mockReturnValue(errorStream());

    const res = await POST(makeRequest(validBody));
    const reader = res.body!.getReader();
    const decoder = new TextDecoder();
    let text = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      text += decoder.decode(value);
    }
    expect(text).toContain('S:ERROR:API_UNAVAILABLE');
  });
});
