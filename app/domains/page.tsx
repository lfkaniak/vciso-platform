import { getAllDomains, searchDomains } from '@/lib/knowledge/domains';
import { DomainGrid } from '@/components/domains/DomainGrid';

interface DomainsPageProps {
  searchParams: Promise<{ q?: string }>;
}

export const metadata = {
  title: 'Domínios ISC2 | vCISO Platform',
  description: 'Navegue pelos 14 domínios ISC2 (CISSP e ISSMP) da base de conhecimento.',
};

export default async function DomainsPage({ searchParams }: DomainsPageProps) {
  const { q } = await searchParams;
  const keyword = q?.trim() ?? '';

  const domains = keyword ? searchDomains(keyword) : getAllDomains();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Page header */}
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-100">Domínios ISC2</h1>
        <p className="text-sm text-zinc-500">
          Base de conhecimento com {keyword ? domains.length : 14} domínios (CISSP e ISSMP)
        </p>
      </div>

      {/* Search — AC4: URL param ?q= (Server Component, no "use client") */}
      <form
        role="search"
        aria-label="Buscar domínios"
        method="GET"
        className="mb-8"
      >
        <div className="relative max-w-md">
          <span
            className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500"
            aria-hidden="true"
          >
            🔍
          </span>
          <input
            type="search"
            name="q"
            defaultValue={keyword}
            placeholder="Buscar por palavra-chave..."
            aria-label="Palavra-chave para busca de domínios"
            className="w-full rounded-lg border border-zinc-700 bg-zinc-900 py-2 pl-9 pr-4 text-sm text-zinc-100 placeholder-zinc-500 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      </form>

      {/* Results */}
      {keyword && domains.length === 0 ? (
        <p className="text-sm text-zinc-500" role="status">
          Nenhum domínio encontrado para &ldquo;{keyword}&rdquo;
        </p>
      ) : (
        <DomainGrid domains={domains} highlight={keyword || undefined} />
      )}
    </main>
  );
}
