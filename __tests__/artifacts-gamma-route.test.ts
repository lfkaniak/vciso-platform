/**
 * @jest-environment node
 */
// Task 5.4 — falha do Gamma.app retorna mensagem de fallback sem crash

jest.mock('@/lib/export/gamma', () => ({
  buildGammaPayload: jest.fn().mockReturnValue({
    inputText: 'slide content',
    textMode: 'preserve',
    format: 'presentation',
    cardSplit: 'inputTextBreaks',
    additionalInstructions: '',
    textOptions: { amount: 'detailed', tone: 'professional', audience: 'executive', language: 'pt' },
  }),
  structureArtifactForGamma: jest.fn().mockReturnValue('slide content'),
}));

// Skip polling sleep in tests
process.env.GAMMA_POLL_INTERVAL_MS = '0';

// Mock fetch globally
const mockFetch = jest.fn();
global.fetch = mockFetch;

import { POST } from '@/app/api/export/gamma/route';

const VALID_BODY = {
  artifact: {
    type: 'security-posture-report',
    title: 'Security Posture Report',
    content: '# Test\n\n## Seção\n\nConteúdo.',
    generatedAt: '2026-03-18T12:00:00.000Z',
    context: {
      type: 'security-posture-report',
      organizationName: 'Empresa Teste SA',
      sector: 'Financeiro',
      maturityLevel: 'developing',
    },
  },
};

function makeRequest(body: object) {
  return new Request('http://localhost/api/export/gamma', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

describe('POST /api/export/gamma', () => {
  beforeEach(() => {
    mockFetch.mockReset();
  });

  it('retorna 503 quando GAMMA_API_KEY não está configurada', async () => {
    delete process.env.GAMMA_API_KEY;
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(503);
    const body = await res.json();
    expect(body.error).toBe('GAMMA_NOT_CONFIGURED');
  });

  it('retorna 400 para body inválido', async () => {
    process.env.GAMMA_API_KEY = 'sk-gamma-test';
    const res = await POST(makeRequest({ artifact: { type: 'invalid' } }));
    expect(res.status).toBe(400);
  });

  it('retorna 502 e mensagem de fallback quando Gamma.app falha (Task 5.4)', async () => {
    process.env.GAMMA_API_KEY = 'sk-gamma-test';
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.error).toBe('GAMMA_FAILED');
    expect(body.message).toContain('Tente Markdown ou PDF');
  });

  it('retorna gammaUrl quando Gamma.app completa com sucesso', async () => {
    process.env.GAMMA_API_KEY = 'sk-gamma-test';

    // POST returns generationId
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ generationId: 'gen-123' }),
    });

    // GET poll returns completed
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        status: 'completed',
        gammaUrl: 'https://gamma.app/docs/abc123',
      }),
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.url).toBe('https://gamma.app/docs/abc123');
  });

  it('retorna 502 quando Gamma.app retorna status=failed', async () => {
    process.env.GAMMA_API_KEY = 'sk-gamma-test';

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ generationId: 'gen-456' }),
    });

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ status: 'failed' }),
    });

    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
    const body = await res.json();
    expect(body.message).toContain('Tente Markdown ou PDF');
  });
});
