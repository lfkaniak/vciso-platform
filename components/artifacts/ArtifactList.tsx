'use client';

import Link from 'next/link';
import type { ArtifactType } from '@/types/index';

interface ArtifactMeta {
  type: ArtifactType;
  icon: string;
  title: string;
  description: string;
  estimatedTime: string;
  exportFormats: string[];
}

export const ARTIFACTS: ArtifactMeta[] = [
  {
    type: 'security-posture-report',
    icon: '🛡️',
    title: 'Security Posture Report',
    description:
      'Relatório executivo com matriz de riscos, gaps de controles ISO 27001/NIST CSF e recomendações priorizadas para board e C-level.',
    estimatedTime: '2-3 min',
    exportFormats: ['Markdown', 'PDF'],
  },
  {
    type: 'budget-proposal-rosi',
    icon: '💰',
    title: 'Budget Proposal (ROSI)',
    description:
      'Proposta de orçamento de segurança com análise de retorno sobre investimento (ROSI), ALE por ameaça e roadmap de investimentos.',
    estimatedTime: '2-3 min',
    exportFormats: ['Markdown', 'PDF'],
  },
  {
    type: 'security-program-roadmap',
    icon: '🗺️',
    title: 'Security Program Roadmap',
    description:
      'Avaliação de maturidade atual e roadmap em 3 fases (90 dias / 6 meses / 12 meses) com KPIs mensuráveis e estrutura de governança.',
    estimatedTime: '2-3 min',
    exportFormats: ['Markdown', 'PDF'],
  },
  {
    type: 'iso27001-audit-checklist',
    icon: '📋',
    title: 'ISO 27001 Audit Checklist',
    description:
      'Checklist completo das 14 cláusulas ISO 27001 com status de conformidade, evidências necessárias e plano de ação para não conformidades.',
    estimatedTime: '3-4 min',
    exportFormats: ['Markdown', 'PDF'],
  },
  {
    type: 'lgpd-adequacy-process',
    icon: '⚖️',
    title: 'LGPD Adequacy Process',
    description:
      '10 etapas de adequação à LGPD com responsáveis, prazos, KPIs de conformidade e mapeamento de riscos de penalidades por setor.',
    estimatedTime: '2-3 min',
    exportFormats: ['Markdown', 'PDF'],
  },
];

export function ArtifactList() {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {ARTIFACTS.map((artifact) => (
        <Link
          key={artifact.type}
          href={`/artifacts/${artifact.type}`}
          className="group flex flex-col gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition-colors hover:border-zinc-600 hover:bg-zinc-800/70"
        >
          <div className="flex items-start gap-3">
            <span className="text-2xl" aria-hidden="true">
              {artifact.icon}
            </span>
            <div className="flex-1">
              <h2 className="text-base font-semibold text-zinc-100 group-hover:text-white">
                {artifact.title}
              </h2>
              <p className="mt-1 text-sm text-zinc-400 leading-relaxed">
                {artifact.description}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-zinc-800 pt-3">
            <div className="flex gap-2">
              {artifact.exportFormats.map((fmt) => (
                <span
                  key={fmt}
                  className="rounded px-2 py-0.5 text-xs font-medium bg-zinc-800 text-zinc-400"
                >
                  {fmt}
                </span>
              ))}
            </div>
            <span className="text-xs text-zinc-500">⏱ {artifact.estimatedTime}</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
