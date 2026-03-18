import { buildClassifyPrompt } from '@/lib/ai/prompts/classify';
import type { UserProfile } from '@/types/index';

describe('buildClassifyPrompt', () => {
  it('retorna string com a situação inserida', () => {
    const prompt = buildClassifyPrompt('Tivemos um ransomware hoje de manhã', 'it-professional');
    expect(prompt).toContain('Tivemos um ransomware hoje de manhã');
  });

  it('retorna string com o perfil inserido', () => {
    const prompt = buildClassifyPrompt('Situação de teste com mais de dez chars', 'executive');
    expect(prompt).toContain('executive');
  });

  it('contém instrução de retornar JSON', () => {
    const prompt = buildClassifyPrompt('Teste de prompt para verificação', 'consultant');
    expect(prompt).toContain('JSON válido');
    expect(prompt).toContain('"mode"');
    expect(prompt).toContain('"urgency"');
  });

  it('funciona para todos os perfis', () => {
    const profiles: UserProfile[] = ['executive', 'it-professional', 'consultant'];
    for (const profile of profiles) {
      const prompt = buildClassifyPrompt('Situação com mais de dez chars', profile);
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(100);
    }
  });
});
