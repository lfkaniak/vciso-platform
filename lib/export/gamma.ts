// Gamma.app export utilities — structure markdown for presentation slides.
// Pure functions only — safe for any runtime context.
// NOTE: API calls are proxied via /api/export/gamma (server-side, GAMMA_API_KEY never exposed).
//
// API Deviation from architecture doc (docs/architecture/fullstack-architecture.md#7):
//   - Correct URL: https://public-api.gamma.app/v1.0/generations (not /v1/generate)
//   - Auth: X-API-KEY header (not Authorization: Bearer)
//   - API is ASYNC: POST → poll GET until status=completed → gammaUrl returned
// Source: https://developers.gamma.app/docs/getting-started

import type { GeneratedArtifact } from '@/types/index';

/**
 * Convert artifact Markdown into slide-separated format for Gamma.app.
 * Each H2 section becomes a separate slide (separated by \n---\n).
 * Structure: Title slide → sections → final section.
 */
export function structureArtifactForGamma(content: string): string {
  // Split on H2 headings, keeping the heading
  const sections = content.split(/(?=^## )/m).filter(Boolean);

  if (sections.length === 0) return content;

  return sections
    .map((section) => section.trim())
    .join('\n\n---\n\n');
}

/**
 * Build the inputText payload for Gamma.app generations API.
 * Uses cardSplit: 'inputTextBreaks' so Gamma respects our \n---\n separators.
 */
export function buildGammaPayload(artifact: GeneratedArtifact) {
  const slidesMarkdown = structureArtifactForGamma(artifact.content);

  return {
    inputText: slidesMarkdown,
    textMode: 'preserve' as const,  // Keep our structured content intact
    format: 'presentation' as const,
    cardSplit: 'inputTextBreaks' as const,
    additionalInstructions: `Professional security presentation for ${artifact.context.organizationName}. Use a clean, executive style.`,
    textOptions: {
      amount: 'detailed' as const,
      tone: 'professional',
      audience: 'executive, security professionals',
      language: 'pt',
    },
  };
}
