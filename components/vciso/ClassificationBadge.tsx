'use client';

import type { SituationClassification } from '@/types/index';

// Domain ID → short title mapping for display
// Users shouldn't see raw IDs like "cissp-01"
const DOMAIN_TITLES: Record<string, string> = {
  'cissp-01': 'Security & Risk Mgmt',
  'cissp-02': 'Asset Security',
  'cissp-03': 'Security Architecture',
  'cissp-04': 'Network Security',
  'cissp-05': 'Identity & Access',
  'cissp-06': 'Assessment & Testing',
  'cissp-07': 'Security Operations',
  'cissp-08': 'Software Dev Security',
  'issmp-01': 'Security Leadership',
  'issmp-02': 'Security Lifecycle',
  'issmp-03': 'Compliance Mgmt',
  'issmp-04': 'Contingency Mgmt',
  'issmp-05': 'Law & Ethics',
  'issmp-06': 'Security Program',
};

const MODE_LABELS: Record<string, string> = {
  'orient-me-now': '🚨 Orientação imediata',
  'help-decide': '⚖️ Apoio à decisão',
  'help-comply': '📋 Compliance',
  'help-operate': '⚙️ Operacional',
};

const URGENCY_STYLES: Record<string, string> = {
  high: 'bg-red-950/50 text-red-400 border-red-800',
  medium: 'bg-amber-950/50 text-amber-400 border-amber-800',
  low: 'bg-green-950/50 text-green-400 border-green-800',
};

const URGENCY_LABELS: Record<string, string> = {
  high: 'Alta',
  medium: 'Média',
  low: 'Baixa',
};

interface ClassificationBadgeProps {
  classification: SituationClassification;
}

export function ClassificationBadge({ classification }: ClassificationBadgeProps) {
  const { mode, urgency, relevantDomains, confidence } = classification;

  return (
    <div
      role="status"
      aria-label="Classificação da situação"
      className="flex flex-wrap items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-900/60 px-4 py-3 text-sm"
    >
      {/* Mode */}
      <span className="font-medium text-zinc-100">{MODE_LABELS[mode] ?? mode}</span>

      <span className="text-zinc-600">·</span>

      {/* Urgency */}
      <span
        className={`rounded-full border px-2 py-0.5 text-xs font-medium ${URGENCY_STYLES[urgency]}`}
        aria-label={`Urgência: ${URGENCY_LABELS[urgency]}`}
      >
        Urgência {URGENCY_LABELS[urgency]}
      </span>

      {/* Domains — show title with ID as tooltip */}
      {relevantDomains.map((id) => (
        <span
          key={id}
          title={id}
          className="rounded-full border border-zinc-700 bg-zinc-800 px-2 py-0.5 text-xs text-zinc-300"
          aria-label={`Domínio ISC2: ${DOMAIN_TITLES[id] ?? id}`}
        >
          {DOMAIN_TITLES[id] ?? id}
        </span>
      ))}

      {/* Confidence (low confidence warning) */}
      {confidence < 0.5 && confidence > 0 && (
        <span className="ml-auto text-xs text-zinc-500" aria-label="Confiança baixa na classificação">
          ⚠ Classificação aproximada
        </span>
      )}
    </div>
  );
}
