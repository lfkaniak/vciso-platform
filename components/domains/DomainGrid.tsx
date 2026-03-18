import { DomainCard } from '@/components/domains/DomainCard';
import type { ISC2Domain } from '@/types/index';

interface DomainGridProps {
  domains: ISC2Domain[];
  highlight?: string;
}

export function DomainGrid({ domains, highlight }: DomainGridProps) {
  const cissp = domains.filter((d) => d.certification === 'CISSP');
  const issmp = domains.filter((d) => d.certification === 'ISSMP');

  return (
    <div className="flex flex-col gap-10">
      <section aria-labelledby="cissp-heading">
        <h2
          id="cissp-heading"
          className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-200"
        >
          <span className="rounded-full border border-blue-700 bg-blue-950/50 px-2 py-0.5 text-xs font-semibold text-blue-300">
            CISSP
          </span>
          <span>{cissp.length} domínios</span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {cissp.map((domain) => (
            <DomainCard key={domain.id} domain={domain} highlight={highlight} />
          ))}
        </div>
      </section>

      <section aria-labelledby="issmp-heading">
        <h2
          id="issmp-heading"
          className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-200"
        >
          <span className="rounded-full border border-green-700 bg-green-950/50 px-2 py-0.5 text-xs font-semibold text-green-300">
            ISSMP
          </span>
          <span>{issmp.length} domínios</span>
        </h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {issmp.map((domain) => (
            <DomainCard key={domain.id} domain={domain} highlight={highlight} />
          ))}
        </div>
      </section>
    </div>
  );
}
