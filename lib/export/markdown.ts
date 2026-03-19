// Markdown export — client-side only (uses browser URL API).
// AC1, AC4: download .md with frontmatter, filename vciso-{type}-{YYYY-MM-DD}.md

import type { GeneratedArtifact } from '@/types/index';

/**
 * Build the full markdown string with YAML frontmatter.
 * Pure function — safe to test in Node.js environment.
 */
export function buildMarkdownExport(artifact: GeneratedArtifact): string {
  const frontmatter = [
    '---',
    `title: "${artifact.title}"`,
    `type: ${artifact.type}`,
    `generatedAt: "${artifact.generatedAt.toISOString()}"`,
    `organizationName: "${artifact.context.organizationName}"`,
    `sector: "${artifact.context.sector}"`,
    `maturityLevel: "${artifact.context.maturityLevel}"`,
    '---',
    '',
  ].join('\n');

  return frontmatter + artifact.content;
}

/**
 * Generate filename following the pattern vciso-{type}-{YYYY-MM-DD}.md
 */
export function buildExportFilename(
  type: string,
  date: Date,
  extension: 'md' | 'pdf' | 'pptx'
): string {
  return `vciso-${type}-${formatDate(date)}.${extension}`;
}

/**
 * Trigger browser download of the artifact as a .md file.
 * Must only be called in browser context (not SSR).
 */
export function exportToMarkdown(artifact: GeneratedArtifact): void {
  const content = buildMarkdownExport(artifact);
  const filename = buildExportFilename(artifact.type, artifact.generatedAt, 'md');

  const blob = new Blob([content], { type: 'text/markdown' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Cleanup object URL to avoid memory leaks
  URL.revokeObjectURL(url);
}

function formatDate(date: Date): string {
  return date.toISOString().slice(0, 10); // YYYY-MM-DD
}
