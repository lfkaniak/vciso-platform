/**
 * @jest-environment node
 */
// Task 5.2 — T: chunks appear after M: accumulates > 300 chars
// Task 5.3 — tenth man failure emits S:ERROR:TENTH_MAN_FAILED without interrupting M: stream

jest.mock('@/lib/ai/client', () => ({
  anthropic: {
    messages: {
      stream: jest.fn(),
    },
  },
}));

jest.mock('server-only', () => ({}));

import { POST } from '@/app/api/vciso/route';
import { NextRequest } from 'next/server';
import { anthropic } from '@/lib/ai/client';

const mockedStream = anthropic.messages.stream as jest.Mock;

const validBody = {
  situation: 'Tivemos um ransomware hoje de manhã na empresa e todos os arquivos estão criptografados',
  profile: 'it-professional',
  classification: {
    mode: 'orient-me-now',
    relevantDomains: ['cissp-07'],
    urgency: 'high',
    confidence: 0.9,
  },
  domainContext: '',
};

function makeRequest(body: object) {
  return new NextRequest('http://localhost/api/vciso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

/** Build a fake main stream that emits enough text to trigger tenth man (> 300 chars) */
function makeMainStreamWithEnoughText(text: string) {
  async function* gen() {
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text } };
    yield { type: 'message_stop' };
  }
  return gen();
}

/** Build a fake tenth man stream */
function makeTenthManStream(text: string) {
  async function* gen() {
    yield { type: 'content_block_delta', delta: { type: 'text_delta', text } };
    yield { type: 'message_stop' };
  }
  return gen();
}

async function readFullStream(res: Response): Promise<string> {
  const reader = res.body!.getReader();
  const decoder = new TextDecoder();
  let text = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    text += decoder.decode(value);
  }
  return text;
}

describe('POST /api/vciso — 10th Man streaming', () => {
  beforeEach(() => jest.clearAllMocks());
  it('emite chunks T: após M: acumular > 300 chars', async () => {
    const mainText = 'A'.repeat(350); // > 300 chars — triggers tenth man
    const tenthText = '## Cenário Alternativo\n\nTexto adversarial';

    let callCount = 0;
    mockedStream.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return makeMainStreamWithEnoughText(mainText);
      return makeTenthManStream(tenthText);
    });

    const res = await POST(makeRequest(validBody));
    const text = await readFullStream(res);

    expect(text).toContain('data: M:');
    expect(text).toContain('data: T:');
    expect(text).toContain('data: S:MAIN_DONE');
    expect(text).toContain('data: S:TENTH_DONE');
    expect(text).toContain('data: S:COMPLETE');
    expect(callCount).toBe(2); // main + tenth man
  });

  it('não emite T: quando M: não atingir 300 chars', async () => {
    const mainText = 'x'.repeat(50); // < 300 chars — no tenth man

    mockedStream.mockReturnValue(makeMainStreamWithEnoughText(mainText));

    const res = await POST(makeRequest(validBody));
    const text = await readFullStream(res);

    expect(text).toContain('data: M:');
    expect(text).not.toContain('data: T:');
    expect(text).toContain('data: S:COMPLETE');
    expect(mockedStream).toHaveBeenCalledTimes(1); // only main
  });

  it('emite S:ERROR:TENTH_MAN_FAILED sem interromper stream M:', async () => {
    const mainText = 'B'.repeat(350);

    let callCount = 0;
    mockedStream.mockImplementation(() => {
      callCount++;
      if (callCount === 1) return makeMainStreamWithEnoughText(mainText);
      // Tenth man throws
      async function* failStream() {
        throw new Error('Claude API error');
        yield; // unreachable, just to make it a generator
      }
      return failStream();
    });

    const res = await POST(makeRequest(validBody));
    const text = await readFullStream(res);

    // Main stream should complete
    expect(text).toContain('data: M:');
    expect(text).toContain('data: S:MAIN_DONE');
    // Tenth man error signal
    expect(text).toContain('S:ERROR:TENTH_MAN_FAILED');
    // Overall stream still completes
    expect(text).toContain('data: S:COMPLETE');
  });
});
