// PDF export via @react-pdf/renderer.
// Client-side only — never import in Edge runtime or server components.
// AC2, AC3, AC4, AC5

import type { GeneratedArtifact } from '@/types/index';
import { buildExportFilename } from './markdown';

/**
 * Generate a PDF Blob from a GeneratedArtifact.
 * Must only be called in browser context.
 */
export async function generatePDF(artifact: GeneratedArtifact): Promise<Blob> {
  // Dynamic import to prevent SSR issues
  const { pdf } = await import('@react-pdf/renderer');
  const { createElement } = await import('react');
  const { ArtifactPDFTemplate } = await import('@/components/artifacts/ArtifactPDFTemplate');

  // Cast needed: ArtifactPDFTemplate returns Document (DocumentProps) but createElement
  // infers ArtifactPDFTemplateProps — both are structurally compatible at runtime.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const element = createElement(ArtifactPDFTemplate, { artifact }) as any;
  const pdfInstance = pdf(element);
  return pdfInstance.toBlob();
}

/**
 * Trigger browser download of the artifact as a PDF file.
 * Returns the filename used.
 */
export async function exportToPDF(artifact: GeneratedArtifact): Promise<string> {
  const blob = await generatePDF(artifact);
  const filename = buildExportFilename(artifact.type, artifact.generatedAt, 'pdf');

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);

  return filename;
}
