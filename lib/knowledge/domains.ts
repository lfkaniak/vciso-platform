// Node.js runtime only — uses fs. NEVER import in edge runtime.
// Source: docs/architecture/fullstack-architecture.md#adr-01
import 'server-only';
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import type { ISC2Domain } from '@/types/index';

const DOMAINS_DIR = path.join(process.cwd(), 'content', 'domains');
const MAX_TOKENS_PER_DOMAIN = 4000; // ~4k tokens max per domain in context

function parseDomainFile(filePath: string): ISC2Domain | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const { data, content } = matter(raw);

    if (!data.id || !data.title || !data.certification) {
      console.error(`[domains] Invalid frontmatter in ${filePath}`);
      return null;
    }

    return {
      id: data.id as string,
      title: data.title as string,
      certification: data.certification as 'CISSP' | 'ISSMP',
      domainNumber: data.domainNumber as number,
      keyFrameworks: (data.keyFrameworks as string[]) ?? [],
      relatedDomains: (data.relatedDomains as string[]) ?? [],
      keywords: (data.keywords as string[]) ?? [],
      situationClusters: (data.situationClusters as string[]) ?? [],
      content: content.trim(),
    };
  } catch (error) {
    console.error(`[domains] Failed to parse ${filePath}:`, error);
    return null;
  }
}

export function getDomain(id: string): ISC2Domain | null {
  const files = fs.readdirSync(DOMAINS_DIR);
  const file = files.find((f) => f.startsWith(id));
  if (!file) return null;
  return parseDomainFile(path.join(DOMAINS_DIR, file));
}

export function getAllDomains(): ISC2Domain[] {
  const files = fs.readdirSync(DOMAINS_DIR).filter((f) => f.endsWith('.mdx'));
  return files
    .map((f) => parseDomainFile(path.join(DOMAINS_DIR, f)))
    .filter((d): d is ISC2Domain => d !== null);
}

export function getDomainContext(ids: string[]): string {
  return ids
    .map((id) => {
      const domain = getDomain(id);
      if (!domain || !domain.content) return '';
      // Truncate to avoid exceeding context window
      const truncated = domain.content.slice(0, MAX_TOKENS_PER_DOMAIN * 4); // ~4 chars/token
      return `## Domínio ISC2: ${domain.title} (${domain.id})\n\n${truncated}`;
    })
    .filter(Boolean)
    .join('\n\n---\n\n');
}
