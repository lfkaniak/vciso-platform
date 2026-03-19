'use client';

import { PlaybookAction } from '@/components/playbooks/PlaybookAction';
import { usePlaybook } from '@/hooks/usePlaybook';
import type { PlaybookAction as PlaybookActionType, PlaybookType, PlaybookPhase } from '@/types/index';

const PHASE_CONFIG: Record<PlaybookPhase, { icon: string; label: string; color: string }> = {
  '0-30min': { icon: '🚨', label: '0 – 30 minutos', color: 'border-red-700 text-red-300' },
  '24h': { icon: '⏰', label: '24 horas', color: 'border-amber-700 text-amber-300' },
  '72h': { icon: '📋', label: '72 horas', color: 'border-blue-700 text-blue-300' },
};

const PHASE_ORDER: PlaybookPhase[] = ['0-30min', '24h', '72h'];

interface PlaybookTimelineProps {
  type: PlaybookType;
  actions: PlaybookActionType[];
}

export function PlaybookTimeline({ type, actions }: PlaybookTimelineProps) {
  const { completedActions, toggleAction, resetProgress, progressPercent } = usePlaybook(type);

  const total = actions.length;
  const percent = progressPercent(total);

  const grouped = PHASE_ORDER.reduce<Record<PlaybookPhase, PlaybookActionType[]>>(
    (acc, phase) => {
      acc[phase] = actions.filter((a) => a.phase === phase).sort((a, b) => a.order - b.order);
      return acc;
    },
    {} as Record<PlaybookPhase, PlaybookActionType[]>
  );

  return (
    <div className="flex flex-col gap-8">
      {/* Progress bar — AC2 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-zinc-400">
            {completedActions.length} de {total} ações concluídas
          </span>
          <div className="flex items-center gap-3">
            <span className="font-semibold text-zinc-200">{percent}%</span>
            {completedActions.length > 0 && (
              <button
                type="button"
                onClick={resetProgress}
                className="text-xs text-zinc-600 hover:text-zinc-400"
                aria-label="Reiniciar progresso do playbook"
              >
                Reiniciar
              </button>
            )}
          </div>
        </div>
        <div
          className="h-2 w-full overflow-hidden rounded-full bg-zinc-800"
          role="progressbar"
          aria-valuenow={percent}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Progresso do playbook: ${percent}%`}
        >
          <div
            className="h-full rounded-full bg-green-500 transition-all duration-500"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      {/* Phases — AC2 */}
      {PHASE_ORDER.map((phase) => {
        const phaseActions = grouped[phase];
        if (phaseActions.length === 0) return null;
        const { icon, label, color } = PHASE_CONFIG[phase];
        const phaseCompleted = phaseActions.filter((a) => completedActions.includes(a.id)).length;

        return (
          <section key={phase} aria-labelledby={`phase-${phase}`}>
            {/* Phase header */}
            <div className={`mb-4 flex items-center gap-3 border-l-4 pl-4 ${color}`}>
              <span className="text-xl" aria-hidden="true">{icon}</span>
              <div className="flex-1">
                <h2 id={`phase-${phase}`} className="text-base font-semibold text-zinc-100">
                  {label}
                </h2>
                <p className="text-xs text-zinc-500">
                  {phaseCompleted}/{phaseActions.length} ações concluídas
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3 pl-4">
              {phaseActions.map((action) => (
                <PlaybookAction
                  key={action.id}
                  action={action}
                  isCompleted={completedActions.includes(action.id)}
                  onToggle={toggleAction}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
