// Task 5.1 — buildArtifactPrompt
import { buildArtifactPrompt } from '@/lib/ai/prompts/artifacts';
import type { ArtifactContext, ArtifactType } from '@/types/index';

const BASE_CONTEXT: ArtifactContext = {
  type: 'security-posture-report',
  organizationName: 'Empresa Teste SA',
  sector: 'Financeiro',
  maturityLevel: 'developing',
};

describe('buildArtifactPrompt', () => {
  it('retorna string com o nome da organização inserido', () => {
    const prompt = buildArtifactPrompt(BASE_CONTEXT);
    expect(prompt).toContain('Empresa Teste SA');
  });

  it('retorna string com o setor inserido', () => {
    const prompt = buildArtifactPrompt(BASE_CONTEXT);
    expect(prompt).toContain('Financeiro');
  });

  it('retorna string com o nível de maturidade inserido', () => {
    const prompt = buildArtifactPrompt(BASE_CONTEXT);
    expect(prompt).toContain('developing');
  });

  it('inclui campos específicos do tipo security-posture-report', () => {
    const ctx: ArtifactContext = {
      ...BASE_CONTEXT,
      additionalContext: { riskAppetite: 'Moderado', keyAssets: 'ERP' },
    };
    const prompt = buildArtifactPrompt(ctx);
    expect(prompt).toContain('Moderado');
    expect(prompt).toContain('ERP');
  });

  it('gera prompts válidos para todos os 5 tipos de artefato', () => {
    const types: ArtifactType[] = [
      'security-posture-report',
      'budget-proposal-rosi',
      'security-program-roadmap',
      'iso27001-audit-checklist',
      'lgpd-adequacy-process',
    ];

    for (const type of types) {
      const prompt = buildArtifactPrompt({ ...BASE_CONTEXT, type });
      expect(typeof prompt).toBe('string');
      expect(prompt.length).toBeGreaterThan(200);
      expect(prompt).toContain('Empresa Teste SA');
    }
  });

  it('inclui campos específicos do tipo budget-proposal-rosi', () => {
    const ctx: ArtifactContext = {
      ...BASE_CONTEXT,
      type: 'budget-proposal-rosi',
      additionalContext: { annualBudget: 'R$ 50.000.000', currentSpend: 'R$ 500.000' },
    };
    const prompt = buildArtifactPrompt(ctx);
    expect(prompt).toContain('R$ 50.000.000');
    expect(prompt).toContain('R$ 500.000');
  });

  it('inclui campos específicos do tipo iso27001-audit-checklist', () => {
    const ctx: ArtifactContext = {
      ...BASE_CONTEXT,
      type: 'iso27001-audit-checklist',
      additionalContext: { auditDate: '2026-06-15', scope: 'Sede São Paulo' },
    };
    const prompt = buildArtifactPrompt(ctx);
    expect(prompt).toContain('2026-06-15');
    expect(prompt).toContain('Sede São Paulo');
  });

  it('inclui campos específicos do tipo lgpd-adequacy-process', () => {
    const ctx: ArtifactContext = {
      ...BASE_CONTEXT,
      type: 'lgpd-adequacy-process',
      additionalContext: {
        dataTypes: 'dados de clientes',
        processingPurposes: 'prestação de serviços',
      },
    };
    const prompt = buildArtifactPrompt(ctx);
    expect(prompt).toContain('dados de clientes');
    expect(prompt).toContain('prestação de serviços');
  });
});
