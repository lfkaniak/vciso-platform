// Task 5.1 — buildTenthManPrompt unit tests
// Task 5.2/5.3 — Covered in tenth-man-route.test.ts
import { buildTenthManPrompt } from '@/lib/ai/prompts/tenth-man';
import { shouldActivateTenthMan, buildTenthManContext } from '@/lib/tenth-man/engine';

describe('buildTenthManPrompt', () => {
  const situation = 'Tivemos um ransomware hoje de manhã na empresa';
  const excerpt = 'Isole os sistemas afetados imediatamente. Desconecte da rede.';

  it('contém a situação original', () => {
    const prompt = buildTenthManPrompt(situation, excerpt);
    expect(prompt).toContain(situation);
  });

  it('contém a abordagem dominante (excerpt)', () => {
    const prompt = buildTenthManPrompt(situation, excerpt);
    expect(prompt).toContain(excerpt);
  });

  it('exige exatamente as 4 seções obrigatórias', () => {
    const prompt = buildTenthManPrompt(situation, excerpt);
    expect(prompt).toContain('## Cenário Alternativo');
    expect(prompt).toContain('## Evidência Contrária');
    expect(prompt).toContain('## Análise de Risco da Abordagem Dominante');
    expect(prompt).toContain('## Pergunta Provocativa');
  });

  it('instrui máximo de 400 palavras', () => {
    const prompt = buildTenthManPrompt(situation, excerpt);
    expect(prompt).toContain('400 palavras');
  });

  it('instrui resposta em português', () => {
    const prompt = buildTenthManPrompt(situation, excerpt);
    expect(prompt).toContain('português');
  });
});

describe('shouldActivateTenthMan', () => {
  it('retorna false para excerpt menor que 300 chars', () => {
    expect(shouldActivateTenthMan('a'.repeat(299))).toBe(false);
  });

  it('retorna true para excerpt de exatamente 300 chars', () => {
    expect(shouldActivateTenthMan('a'.repeat(300))).toBe(true);
  });

  it('retorna true para excerpt maior que 300 chars', () => {
    expect(shouldActivateTenthMan('a'.repeat(500))).toBe(true);
  });

  it('retorna false para string vazia', () => {
    expect(shouldActivateTenthMan('')).toBe(false);
  });
});

describe('buildTenthManContext', () => {
  it('inclui situação e excerpt no contexto', () => {
    const ctx = buildTenthManContext('situação de teste', 'resposta do vciso aqui');
    expect(ctx).toContain('situação de teste');
    expect(ctx).toContain('resposta do vciso aqui');
  });

  it('trunca excerpt em 1200 chars', () => {
    const longExcerpt = 'x'.repeat(2000);
    const ctx = buildTenthManContext('teste', longExcerpt);
    // Should not contain 2000 chars of 'x'
    expect(ctx.length).toBeLessThan(1300);
  });
});
