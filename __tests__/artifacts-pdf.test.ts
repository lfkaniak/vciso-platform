/**
 * @jest-environment node
 */
// Task 5.3 — generatePDF retorna Blob com conteúdo não-vazio

// Mock @react-pdf/renderer to avoid browser-only API issues in test environment
jest.mock('@react-pdf/renderer', () => ({
  pdf: jest.fn().mockReturnValue({
    toBlob: jest.fn().mockResolvedValue(new Blob(['%PDF-1.4 mock content'], { type: 'application/pdf' })),
  }),
  Document: jest.fn(),
  Page: jest.fn(),
  Text: jest.fn(),
  View: jest.fn(),
  StyleSheet: { create: jest.fn().mockReturnValue({}) },
  Font: { register: jest.fn() },
}));

jest.mock('react', () => ({
  ...jest.requireActual('react'),
  createElement: jest.fn().mockReturnValue({}),
}));

jest.mock('@/components/artifacts/ArtifactPDFTemplate', () => ({
  ArtifactPDFTemplate: jest.fn(),
}));

import { generatePDF } from '@/lib/export/pdf';
import type { GeneratedArtifact } from '@/types/index';

const MOCK_ARTIFACT: GeneratedArtifact = {
  type: 'security-posture-report',
  title: 'Security Posture Report',
  content: '# Security Posture Report\n\n## Sumário Executivo\n\nConteúdo.',
  generatedAt: new Date('2026-03-18T12:00:00.000Z'),
  context: {
    type: 'security-posture-report',
    organizationName: 'Empresa Teste SA',
    sector: 'Financeiro',
    maturityLevel: 'developing',
  },
};

describe('generatePDF', () => {
  it('retorna um Blob', async () => {
    const blob = await generatePDF(MOCK_ARTIFACT);
    expect(blob).toBeInstanceOf(Blob);
  });

  it('retorna Blob com conteúdo não-vazio', async () => {
    const blob = await generatePDF(MOCK_ARTIFACT);
    expect(blob.size).toBeGreaterThan(0);
  });

  it('retorna Blob com type application/pdf', async () => {
    const blob = await generatePDF(MOCK_ARTIFACT);
    expect(blob.type).toBe('application/pdf');
  });
});
