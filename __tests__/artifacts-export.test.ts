// Task 5.1 — exportToMarkdown gera string com frontmatter correto
// Task 5.2 — nome do arquivo segue padrão vciso-{type}-{date}.{ext}
// Task 5.4 — falha do Gamma.app retorna mensagem de fallback sem crash

import { buildMarkdownExport, buildExportFilename } from '@/lib/export/markdown';
import { structureArtifactForGamma, buildGammaPayload } from '@/lib/export/gamma';
import type { GeneratedArtifact } from '@/types/index';

const FIXED_DATE = new Date('2026-03-18T12:00:00.000Z');

const MOCK_ARTIFACT: GeneratedArtifact = {
  type: 'security-posture-report',
  title: 'Security Posture Report',
  content: '# Security Posture Report\n\n## Sumário Executivo\n\nConteúdo executivo.\n\n## Matriz de Riscos\n\nTabela de riscos.',
  generatedAt: FIXED_DATE,
  context: {
    type: 'security-posture-report',
    organizationName: 'Empresa Teste SA',
    sector: 'Financeiro',
    maturityLevel: 'developing',
  },
};

// Task 5.1 — buildMarkdownExport
describe('buildMarkdownExport', () => {
  it('inclui frontmatter YAML com campos obrigatórios', () => {
    const result = buildMarkdownExport(MOCK_ARTIFACT);
    expect(result).toContain('---');
    expect(result).toContain('title: "Security Posture Report"');
    expect(result).toContain('type: security-posture-report');
    expect(result).toContain('organizationName: "Empresa Teste SA"');
    expect(result).toContain('sector: "Financeiro"');
    expect(result).toContain('maturityLevel: "developing"');
  });

  it('inclui o conteúdo do artefato após o frontmatter', () => {
    const result = buildMarkdownExport(MOCK_ARTIFACT);
    expect(result).toContain('# Security Posture Report');
    expect(result).toContain('## Sumário Executivo');
  });

  it('inclui generatedAt como ISO string', () => {
    const result = buildMarkdownExport(MOCK_ARTIFACT);
    expect(result).toContain('generatedAt: "2026-03-18T12:00:00.000Z"');
  });

  it('começa com --- (frontmatter YAML)', () => {
    const result = buildMarkdownExport(MOCK_ARTIFACT);
    expect(result.startsWith('---')).toBe(true);
  });
});

// Task 5.2 — buildExportFilename
describe('buildExportFilename', () => {
  it('gera nome no padrão vciso-{type}-{YYYY-MM-DD}.md', () => {
    const filename = buildExportFilename('security-posture-report', FIXED_DATE, 'md');
    expect(filename).toBe('vciso-security-posture-report-2026-03-18.md');
  });

  it('gera nome no padrão vciso-{type}-{YYYY-MM-DD}.pdf', () => {
    const filename = buildExportFilename('budget-proposal-rosi', FIXED_DATE, 'pdf');
    expect(filename).toBe('vciso-budget-proposal-rosi-2026-03-18.pdf');
  });

  it('gera nome no padrão vciso-{type}-{YYYY-MM-DD}.pptx', () => {
    const filename = buildExportFilename('iso27001-audit-checklist', FIXED_DATE, 'pptx');
    expect(filename).toBe('vciso-iso27001-audit-checklist-2026-03-18.pptx');
  });

  it('usa a data correta do artefato', () => {
    const date = new Date('2025-12-01T00:00:00.000Z');
    const filename = buildExportFilename('lgpd-adequacy-process', date, 'md');
    expect(filename).toBe('vciso-lgpd-adequacy-process-2025-12-01.md');
  });
});

// Task 5.4 — structureArtifactForGamma e buildGammaPayload
describe('structureArtifactForGamma', () => {
  it('separa seções H2 com \\n---\\n', () => {
    const content = '# Título\n\n## Seção 1\n\nConteúdo 1.\n\n## Seção 2\n\nConteúdo 2.';
    const result = structureArtifactForGamma(content);
    expect(result).toContain('\n\n---\n\n');
    expect(result).toContain('## Seção 1');
    expect(result).toContain('## Seção 2');
  });

  it('não crasheia com conteúdo vazio', () => {
    expect(() => structureArtifactForGamma('')).not.toThrow();
  });

  it('não crasheia com conteúdo sem H2', () => {
    const result = structureArtifactForGamma('Texto sem headings.');
    expect(typeof result).toBe('string');
  });
});

describe('buildGammaPayload', () => {
  it('retorna payload com format=presentation', () => {
    const payload = buildGammaPayload(MOCK_ARTIFACT);
    expect(payload.format).toBe('presentation');
  });

  it('retorna payload com textMode=preserve', () => {
    const payload = buildGammaPayload(MOCK_ARTIFACT);
    expect(payload.textMode).toBe('preserve');
  });

  it('retorna payload com cardSplit=inputTextBreaks', () => {
    const payload = buildGammaPayload(MOCK_ARTIFACT);
    expect(payload.cardSplit).toBe('inputTextBreaks');
  });

  it('inclui o nome da organização nas instruções adicionais', () => {
    const payload = buildGammaPayload(MOCK_ARTIFACT);
    expect(payload.additionalInstructions).toContain('Empresa Teste SA');
  });

  it('retorna inputText com separadores ---', () => {
    const payload = buildGammaPayload(MOCK_ARTIFACT);
    expect(payload.inputText).toContain('---');
  });
});
