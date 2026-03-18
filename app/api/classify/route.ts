import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { anthropic } from '@/lib/ai/client';
import { buildClassifyPrompt } from '@/lib/ai/prompts/classify';
import type { SituationClassification, VCISOError } from '@/types/index';

const RequestSchema = z.object({
  situation: z.string().min(10, 'Situação deve ter no mínimo 10 caracteres'),
  profile: z.enum(['executive', 'it-professional', 'consultant']),
});

const ClassificationSchema = z.object({
  mode: z.enum(['orient-me-now', 'help-decide', 'help-comply', 'help-operate']),
  relevantDomains: z.array(z.string()).min(1).max(3),
  urgency: z.enum(['high', 'medium', 'low']),
  confidence: z.number().min(0).max(1),
});

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json<VCISOError>(
      { code: 'INVALID_INPUT', message: parsed.error.issues[0]?.message ?? 'Input inválido', retryable: false },
      { status: 400 }
    );
  }

  const { situation, profile } = parsed.data;
  const prompt = buildClassifyPrompt(situation, profile);

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 256,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0].type === 'text' ? message.content[0].text : '';

    // Strip markdown code fences if present
    const jsonText = text.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '').trim();

    const rawJson = JSON.parse(jsonText);
    const classification = ClassificationSchema.safeParse(rawJson);

    if (!classification.success) {
      console.error('[classify] Invalid JSON structure from Claude:', rawJson);
      return NextResponse.json<SituationClassification>(fallbackClassification(profile), {
        status: 200,
      });
    }

    const result: SituationClassification = {
      ...classification.data,
      detectedProfile: profile,
    };

    return NextResponse.json<SituationClassification>(result);
  } catch (error) {
    console.error('[classify] API error:', error);
    // Graceful fallback — never return 500 to the client for classification
    return NextResponse.json<SituationClassification>(fallbackClassification(profile), {
      status: 200,
    });
  }
}

function fallbackClassification(profile: string): SituationClassification {
  return {
    mode: 'orient-me-now',
    relevantDomains: ['cissp-07'],
    urgency: 'high',
    detectedProfile: profile as SituationClassification['detectedProfile'],
    confidence: 0,
  };
}
