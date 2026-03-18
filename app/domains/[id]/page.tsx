import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MDXRemote } from 'next-mdx-remote/rsc';
import { getDomain, getAllDomains } from '@/lib/knowledge/domains';

interface DomainPageProps {
  params: Promise<{ id: string }>;
}

export async function generateStaticParams() {
  const domains = getAllDomains();
  return domains.map((d) => ({ id: d.id }));
}

export async function generateMetadata({ params }: DomainPageProps) {
  const { id } = await params;
  const domain = getDomain(id);
  if (!domain) return {};
  return {
    title: `${domain.title} | Domínios ISC2 | vCISO Platform`,
    description: `Domínio ${domain.domainNumber} ${domain.certification}: ${domain.title}. Frameworks: ${domain.keyFrameworks.join(', ')}.`,
  };
}

const CERT_STYLES: Record<string, string> = {
  CISSP: 'border-blue-700 bg-blue-950/50 text-blue-300',
  ISSMP: 'border-green-700 bg-green-950/50 text-green-300',
};

export default async function DomainPage({ params }: DomainPageProps) {
  const { id } = await params;
  const domain = getDomain(id);

  if (!domain) {
    notFound();
    return null;
  }

  const certStyle = CERT_STYLES[domain.certification] ?? 'border-zinc-700 bg-zinc-800 text-zinc-300';

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Breadcrumb — AC3 */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <Link href="/domains" className="hover:text-zinc-300">
          Domínios
        </Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-300" aria-current="page">
          {domain.title}
        </span>
      </nav>

      <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
        {/* Main content */}
        <article className="min-w-0 flex-1">
          {/* Header */}
          <div className="mb-6 flex flex-wrap items-start gap-3">
            <div className="flex-1">
              <p className="text-xs text-zinc-500">Domínio {domain.domainNumber}</p>
              <h1 className="mt-1 text-2xl font-semibold text-zinc-100">{domain.title}</h1>
            </div>
            <span
              className={`rounded-full border px-3 py-1 text-sm font-semibold ${certStyle}`}
              aria-label={`Certificação: ${domain.certification}`}
            >
              {domain.certification}
            </span>
          </div>

          {/* Key Frameworks */}
          <div className="mb-6 flex flex-wrap gap-2">
            {domain.keyFrameworks.map((fw) => (
              <span
                key={fw}
                className="rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs text-zinc-300"
              >
                {fw}
              </span>
            ))}
          </div>

          {/* MDX content — AC3 */}
          {domain.content && (
            <div className="prose prose-invert prose-zinc max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-li:text-zinc-300 prose-strong:text-zinc-100 prose-code:text-zinc-300">
              <MDXRemote source={domain.content} />
            </div>
          )}
        </article>

        {/* Sidebar */}
        <aside className="w-full shrink-0 lg:w-64" aria-label="Informações do domínio">
          {/* Related domains — AC3 */}
          {domain.relatedDomains.length > 0 && (
            <div className="mb-6 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4">
              <h2 className="mb-3 text-sm font-semibold text-zinc-200">Domínios relacionados</h2>
              <ul className="flex flex-col gap-2">
                {domain.relatedDomains.map((relId) => (
                  <li key={relId}>
                    <Link
                      href={`/domains/${relId}`}
                      className="text-sm text-zinc-400 hover:text-zinc-100"
                    >
                      {relId}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Link para situações — AC5 */}
          <Link
            href={`/situations?domain=${domain.id}`}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-3 text-sm font-medium text-zinc-200 transition-colors hover:border-zinc-500 hover:bg-zinc-700"
            aria-label={`Ver situações relacionadas ao domínio ${domain.title}`}
          >
            <span aria-hidden="true">📌</span>
            Ver situações relacionadas
          </Link>
        </aside>
      </div>
    </main>
  );
}
