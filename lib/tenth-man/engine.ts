// Source: docs/architecture/fullstack-architecture.md#adr-05
// Tenth Man trigger logic — 300-token threshold for adversarial context

const TRIGGER_THRESHOLD = 300; // chars as proxy (~75-100 tokens for PT-BR text), per ADR-05

/**
 * Returns true when enough main response has accumulated to derive adversarial context.
 * Uses char length as proxy (~1 char ≈ 1 token for Portuguese text).
 */
export function shouldActivateTenthMan(excerpt: string): boolean {
  return excerpt.length >= TRIGGER_THRESHOLD;
}

/**
 * Build a concise context string to feed the adversarial prompt.
 * Truncates at 1200 chars to keep tenth-man prompt tight.
 */
export function buildTenthManContext(situation: string, mainExcerpt: string): string {
  const truncated = mainExcerpt.slice(0, 1200);
  return `Situação: ${situation}\n\nResposta principal (trecho):\n${truncated}`;
}
