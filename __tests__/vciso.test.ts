// Task 8.1 — buildVCISOPrompt unit tests
// Task 8.2 — getDomainContext unit tests
import { buildVCISOPrompt } from '@/lib/ai/prompts/vciso';
import type { UserProfile, SituationClassification } from '@/types/index';

const baseClassification: SituationClassification = {
  mode: 'orient-me-now',
  relevantDomains: ['cissp-07'],
  urgency: 'high',
  confidence: 0.9,
};

describe('buildVCISOPrompt', () => {
  it('contém a situação do usuário', () => {
    const prompt = buildVCISOPrompt(
      'Tivemos um ransomware hoje de manhã',
      'it-professional',
      baseClassification,
      ''
    );
    expect(prompt).toContain('Tivemos um ransomware hoje de manhã');
  });

  it('inclui instrução de perfil executivo', () => {
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'executive',
      baseClassification,
      ''
    );
    expect(prompt).toContain('ALE');
    expect(prompt).toContain('ROSI');
  });

  it('inclui instrução de perfil it-professional', () => {
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'it-professional',
      baseClassification,
      ''
    );
    expect(prompt).toContain('OWASP');
    expect(prompt).toContain('CVE');
  });

  it('inclui instrução de perfil consultor', () => {
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'consultant',
      baseClassification,
      ''
    );
    expect(prompt).toContain('frameworks');
    expect(prompt).toContain('maturidade');
  });

  it('contém as 5 seções H2 obrigatórias', () => {
    const profiles: UserProfile[] = ['executive', 'it-professional', 'consultant'];
    for (const profile of profiles) {
      const prompt = buildVCISOPrompt(
        'Situação de teste com mais de dez chars',
        profile,
        baseClassification,
        ''
      );
      expect(prompt).toContain('## Orientação Imediata');
      expect(prompt).toContain('## Contexto Técnico');
      expect(prompt).toContain('## Frameworks e Referências');
      expect(prompt).toContain('## Métricas e KPIs');
      expect(prompt).toContain('## Próximos Passos');
    }
  });

  it('injeta domainContext no prompt', () => {
    const domainContext = 'Conteúdo do domínio cissp-07 para teste';
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'it-professional',
      baseClassification,
      domainContext
    );
    expect(prompt).toContain(domainContext);
  });

  it('referencia frameworks ISC2/NIST/ISO', () => {
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'it-professional',
      baseClassification,
      ''
    );
    expect(prompt).toContain('ISC2');
    expect(prompt).toContain('NIST');
    expect(prompt).toContain('ISO');
  });

  it('identifica urgência alta', () => {
    const prompt = buildVCISOPrompt(
      'Situação de teste com mais de dez chars',
      'executive',
      { ...baseClassification, urgency: 'high' },
      ''
    );
    expect(prompt).toContain('URGÊNCIA ALTA');
  });
});
