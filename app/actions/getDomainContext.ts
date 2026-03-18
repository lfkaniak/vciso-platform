'use server';
// Node.js runtime — uses fs via getDomainContext. NEVER call from edge runtime.
// Source: docs/architecture/fullstack-architecture.md#adr-01
import { getDomainContext } from '@/lib/knowledge/domains';

export async function fetchDomainContext(domainIds: string[]): Promise<string> {
  return getDomainContext(domainIds);
}
