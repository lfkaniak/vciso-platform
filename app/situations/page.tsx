import { getAllSituations } from '@/lib/knowledge/situations';
import { SituationCard } from '@/components/vciso/SituationCard';
import type { SituationCluster } from '@/types/index';

interface SituationsPageProps {
  searchParams: Promise<{
    cluster?: string;
    urgency?: string;
    domain?: string;
  }>;
}

export const metadata = {
  title: 'Situações | vCISO Platform',
  description: 'Navegue por 31 situações reais de segurança pré-mapeadas em 5 clusters.',
};

const CLUSTER_LABELS: Record<SituationCluster, string> = {
  crisis: 'Crises',
  strategic: 'Estratégicas',
  compliance: 'Compliance',
  operational: 'Operacional',
  projects: 'Projetos',
};

const CLUSTER_ICONS: Record<SituationCluster, string> = {
  crisis: '🚨',
  strategic: '📊',
  compliance: '📋',
  operational: '⚙️',
  projects: '🔧',
};

const CLUSTER_ORDER: SituationCluster[] = [
  'crisis',
  'strategic',
  'compliance',
  'operational',
  'projects',
];

export default async function SituationsPage({ searchParams }: SituationsPageProps) {
  const { cluster, urgency, domain } = await searchParams;

  let situations = getAllSituations();

  // AC4 — filtros via URL params
  if (cluster && CLUSTER_ORDER.includes(cluster as SituationCluster)) {
    situations = situations.filter((s) => s.cluster === cluster);
  }
  if (urgency && ['high', 'medium', 'low'].includes(urgency)) {
    situations = situations.filter((s) => s.urgency === urgency);
  }
  // AC2.5 — filtro por domínio (vindo do link da Story 3.2)
  if (domain) {
    situations = situations.filter((s) => s.relevantDomains.includes(domain));
  }

  const hasFilter = !!(cluster || urgency || domain);

  // Group by cluster (preserving order)
  const grouped = CLUSTER_ORDER.reduce<Record<SituationCluster, typeof situations>>(
    (acc, c) => {
      acc[c] = situations.filter((s) => s.cluster === c);
      return acc;
    },
    {} as Record<SituationCluster, typeof situations>
  );

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      {/* Header */}
      <div className="mb-8 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold text-zinc-100">Biblioteca de Situações</h1>
        <p className="text-sm text-zinc-500">
          {situations.length} situações em {Object.values(grouped).filter((g) => g.length > 0).length} clusters
        </p>
      </div>

      {/* Filters — AC4 */}
      <form method="GET" className="mb-8 flex flex-wrap gap-3" aria-label="Filtros">
        {/* Cluster filter */}
        <select
          name="cluster"
          defaultValue={cluster ?? ''}
          aria-label="Filtrar por cluster"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          <option value="">Todos os clusters</option>
          {CLUSTER_ORDER.map((c) => (
            <option key={c} value={c}>
              {CLUSTER_LABELS[c]}
            </option>
          ))}
        </select>

        {/* Urgency filter */}
        <select
          name="urgency"
          defaultValue={urgency ?? ''}
          aria-label="Filtrar por urgência"
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-200 focus:border-zinc-500 focus:outline-none"
        >
          <option value="">Todas as urgências</option>
          <option value="high">Urgência Alta</option>
          <option value="medium">Urgência Média</option>
          <option value="low">Urgência Baixa</option>
        </select>

        {domain && <input type="hidden" name="domain" value={domain} />}

        <button
          type="submit"
          className="rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm text-zinc-200 hover:bg-zinc-700"
        >
          Filtrar
        </button>

        {hasFilter && (
          <a
            href="/situations"
            className="rounded-lg px-4 py-2 text-sm text-zinc-500 hover:text-zinc-300"
          >
            Limpar filtros
          </a>
        )}
      </form>

      {/* Domain filter indicator */}
      {domain && (
        <div className="mb-6 flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-2 text-sm text-zinc-400">
          <span>Filtrando por domínio:</span>
          <span className="rounded border border-zinc-600 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300">
            {domain}
          </span>
          <a href="/situations" className="ml-auto text-xs text-zinc-500 hover:text-zinc-300">
            Remover
          </a>
        </div>
      )}

      {/* Results — grouped by cluster */}
      {situations.length === 0 ? (
        <p className="text-sm text-zinc-500" role="status">
          Nenhuma situação encontrada para os filtros selecionados.
        </p>
      ) : (
        <div className="flex flex-col gap-10">
          {CLUSTER_ORDER.map((c) => {
            const group = grouped[c];
            if (group.length === 0) return null;
            return (
              <section key={c} aria-labelledby={`cluster-${c}`}>
                <h2
                  id={`cluster-${c}`}
                  className="mb-4 flex items-center gap-2 text-base font-semibold text-zinc-200"
                >
                  <span aria-hidden="true">{CLUSTER_ICONS[c]}</span>
                  {CLUSTER_LABELS[c]}
                  <span className="text-sm font-normal text-zinc-500">
                    ({group.length})
                  </span>
                </h2>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {group.map((situation) => (
                    <SituationCard key={situation.id} situation={situation} />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}
    </main>
  );
}
