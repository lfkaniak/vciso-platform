/**
 * @jest-environment node
 */
// Task 5.2 — POST /api/artifacts/[type] retorna stream SSE
// Task 5.3 — Zod rejeita type inválido com 400

jest.mock('@/lib/ai/client', () => ({
  anthropic: {
    messages: {
      stream: jest.fn(),
    },
  },
}));

jest.mock('server-only', () => ({}));

import { POST } from '@/app/api/artifacts/[type]/route';
import { anthropic } from '@/lib/ai/client';

const mockedStream = anthropic.messages.stream as jest.Mock;

function makeRequest(body: object) {
  return new Request('http://localhost/api/artifacts/security-posture-report', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function makeParams(type: string) {
  return { params: Promise.resolve({ type }) };
}

const validBody = {
  organizationName: 'Empresa Teste SA',
  sector: 'Financeiro',
  maturityLevel: 'developing',
};

describe('POST /api/artifacts/[type]', () => {
  // Task 5.3 — Zod rejeita type inválido com 400
  it('retorna 400 para type inválido', async () => {
    const res = await POST(makeRequest(validBody), makeParams('invalid-type'));
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('INVALID_INPUT');
  });

  it('retorna 400 quando organizationName está ausente', async () => {
    const res = await POST(
      makeRequest({ sector: 'Financeiro', maturityLevel: 'developing' }),
      makeParams('security-posture-report')
    );
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.code).toBe('INVALID_INPUT');
  });

  it('retorna 400 quando maturityLevel é inválido', async () => {
    const res = await POST(
      makeRequest({ ...validBody, maturityLevel: 'expert' }),
      makeParams('security-posture-report')
    );
    expect(res.status).toBe(400);
  });

  // Task 5.2 — POST retorna stream SSE com prefixo A:
  it('retorna stream SSE com eventos A: e S:ARTIFACT_DONE', async () => {
    async function* mockStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '# Security Posture Report\n\n' } };
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: '## Sumário Executivo\n\n' } };
      yield { type: 'message_stop' };
    }

    mockedStream.mockReturnValue(mockStream());

    const res = await POST(makeRequest(validBody), makeParams('security-posture-report'));
    expect(res.status).toBe(200);
    expect(res.headers.get('Content-Type')).toBe('text/event-stream');

    const reader = res.body!.getReader();
    const chunks: string[] = [];
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      chunks.push(decoder.decode(value));
    }

    const fullText = chunks.join('');
    expect(fullText).toContain('data: A:# Security Posture Report');
    expect(fullText).toContain('data: S:ARTIFACT_DONE');
    expect(fullText).toContain('data: S:COMPLETE');
  });

  it('retorna S:ERROR:API_UNAVAILABLE para erro 529', async () => {
    const err = Object.assign(new Error('Overloaded'), { status: 529 });
    async function* errorStream() {
      throw err;
    }
    mockedStream.mockReturnValue(errorStream());

    const res = await POST(makeRequest(validBody), makeParams('security-posture-report'));
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

  it('aceita todos os 5 tipos de artefato válidos', async () => {
    async function* mockStream() {
      yield { type: 'content_block_delta', delta: { type: 'text_delta', text: 'chunk' } };
      yield { type: 'message_stop' };
    }

    const validTypes = [
      'security-posture-report',
      'budget-proposal-rosi',
      'security-program-roadmap',
      'iso27001-audit-checklist',
      'lgpd-adequacy-process',
    ];

    for (const type of validTypes) {
      mockedStream.mockReturnValue(mockStream());
      const res = await POST(makeRequest(validBody), makeParams(type));
      expect(res.status).toBe(200);
    }
  });
});
