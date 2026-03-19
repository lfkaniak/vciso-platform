import Link from 'next/link';
import type { ISC2Domain } from '@/types/index';

function HighlightText({ text, keyword }: { text: string; keyword?: string }) {
  if (!keyword) return <>{text}</>;
  const idx = text.toLowerCase().indexOf(keyword.toLowerCase());
  if (idx === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="rounded bg-amber-400/20 text-amber-300 not-italic">
        {text.slice(idx, idx + keyword.length)}
      </mark>
      {text.slice(idx + keyword.length)}
    </>
  );
}

const CERT_STYLES: Record<string, string> = {
  CISSP: 'border-blue-700 bg-blue-950/50 text-blue-300',
  ISSMP: 'border-green-700 bg-green-950/50 text-green-300',
};

const DOMAIN_ICONS: Record<string, string> = {
  'cissp-01': '⚖️',
  'cissp-02': '🗄️',
  'cissp-03': '🏗️',
  'cissp-04': '🌐',
  'cissp-05': '🔑',
  'cissp-06': '🔬',
  'cissp-07': '🛡️',
  'cissp-08': '💻',
  'issmp-01': '👔',
  'issmp-02': '🔄',
  'issmp-03': '📋',
  'issmp-04': '🚨',
  'issmp-05': '📜',
  'issmp-06': '📊',
};

interface DomainCardProps {
  domain: ISC2Domain;
  highlight?: string;
}

export function DomainCard({ domain, highlight }: DomainCardProps) {
  const icon = DOMAIN_ICONS[domain.id] ?? '🔒';
  const certStyle = CERT_STYLES[domain.certification] ?? 'border-zinc-700 bg-zinc-800 text-zinc-300';

  return (
    <article
      aria-label={`Domínio ${domain.domainNumber}: ${domain.title}`}
      className="group rounded-lg border border-zinc-800 bg-zinc-900/60 transition-colors hover:border-zinc-600 hover:bg-zinc-900"
    >
      <Link
        href={`/domains/${domain.id}`}
        className="flex flex-col gap-3 p-4"
      >
        {/* Header: icon + certification badge */}
        <div className="flex items-center justify-between">
          <span className="text-2xl" aria-hidden="true">{icon}</span>
          <span
            className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${certStyle}`}
            aria-label={`Certificação: ${domain.certification}`}
          >
            {domain.certification}
          </span>
        </div>

        {/* Domain number + title */}
        <div>
          <p className="text-xs text-zinc-500">Domínio {domain.domainNumber}</p>
          <h3 className="mt-0.5 text-sm font-semibold text-zinc-100 group-hover:text-white">
            <HighlightText text={domain.title} keyword={highlight} />
          </h3>
        </div>

        {/* Key frameworks */}
        <ul className="flex flex-col gap-1" aria-label="Frameworks principais">
          {domain.keyFrameworks.slice(0, 3).map((fw) => (
            <li key={fw} className="text-xs text-zinc-500 before:mr-1 before:content-['·']">
              {fw}
            </li>
          ))}
        </ul>
      </Link>
    </article>
  );
}
