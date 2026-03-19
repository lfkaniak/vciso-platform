'use client';

import { useRouter } from 'next/navigation';
import type { Situation } from '@/types/index';

const URGENCY_STYLES = {
  high: 'border-red-800 bg-red-950/50 text-red-300',
  medium: 'border-amber-800 bg-amber-950/50 text-amber-300',
  low: 'border-green-800 bg-green-950/50 text-green-300',
} as const;

const URGENCY_LABELS = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
} as const;

const MODE_ICONS = {
  'orient-me-now': '🚨',
  'help-decide': '⚖️',
  'help-comply': '📋',
  'help-operate': '⚙️',
} as const;

const MODE_LABELS = {
  'orient-me-now': 'Orientação imediata',
  'help-decide': 'Apoio à decisão',
  'help-comply': 'Compliance',
  'help-operate': 'Operacional',
} as const;

interface SituationCardProps {
  situation: Situation;
}

export function SituationCard({ situation }: SituationCardProps) {
  const router = useRouter();

  const handleClick = () => {
    const params = new URLSearchParams({ situation: situation.id });
    router.push(`/?${params.toString()}`);
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={`Iniciar situação: ${situation.title}`}
      className="group flex w-full flex-col gap-3 rounded-lg border border-zinc-800 bg-zinc-900/60 p-4 text-left transition-colors hover:border-zinc-600 hover:bg-zinc-900"
    >
      {/* Header: urgency badge + MVP badge */}
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${URGENCY_STYLES[situation.urgency]}`}
          aria-label={`Urgência: ${URGENCY_LABELS[situation.urgency]}`}
        >
          {URGENCY_LABELS[situation.urgency]}
        </span>

        {situation.isMvp && (
          <span className="rounded-full border border-blue-700 bg-blue-950/50 px-2 py-0.5 text-xs font-semibold text-blue-300">
            MVP
          </span>
        )}

        {/* Mode badge */}
        <span
          className="ml-auto flex items-center gap-1 text-xs text-zinc-500"
          aria-label={`Modo: ${MODE_LABELS[situation.mode]}`}
        >
          <span aria-hidden="true">{MODE_ICONS[situation.mode]}</span>
          {MODE_LABELS[situation.mode]}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-sm font-semibold text-zinc-100 group-hover:text-white">
        {situation.title}
      </h3>

      {/* ISC2 domain tags */}
      <div className="flex flex-wrap gap-1" aria-label="Domínios ISC2 relevantes">
        {situation.relevantDomains.map((domainId) => (
          <span
            key={domainId}
            className="rounded border border-zinc-700 bg-zinc-800 px-1.5 py-0.5 text-xs text-zinc-400"
          >
            {domainId}
          </span>
        ))}
      </div>
    </button>
  );
}
