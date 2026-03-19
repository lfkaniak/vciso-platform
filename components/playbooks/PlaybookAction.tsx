'use client';

import Link from 'next/link';
import type { PlaybookAction as PlaybookActionType } from '@/types/index';

const OWNER_STYLES: Record<string, string> = {
  CISO: 'border-blue-700 bg-blue-950/50 text-blue-300',
  TI: 'border-cyan-700 bg-cyan-950/50 text-cyan-300',
  Jurídico: 'border-purple-700 bg-purple-950/50 text-purple-300',
  Comunicação: 'border-amber-700 bg-amber-950/50 text-amber-300',
  Executivo: 'border-red-700 bg-red-950/50 text-red-300',
};

interface PlaybookActionProps {
  action: PlaybookActionType;
  isCompleted: boolean;
  onToggle: (id: string) => void;
}

export function PlaybookAction({ action, isCompleted, onToggle }: PlaybookActionProps) {
  const ownerStyle = OWNER_STYLES[action.owner] ?? 'border-zinc-700 bg-zinc-800 text-zinc-300';

  return (
    <div
      className={`rounded-lg border p-4 transition-colors ${
        isCompleted
          ? 'border-green-800/60 bg-green-950/20'
          : 'border-zinc-800 bg-zinc-900/60'
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Checkbox — AC4 */}
        <input
          type="checkbox"
          id={`action-${action.id}`}
          checked={isCompleted}
          onChange={() => onToggle(action.id)}
          aria-label={`Marcar como concluído: ${action.title}`}
          className="mt-0.5 h-4 w-4 shrink-0 cursor-pointer rounded border-zinc-600 bg-zinc-800 accent-green-500"
        />

        <div className="min-w-0 flex-1">
          {/* Title — AC4: riscado quando concluído */}
          <label
            htmlFor={`action-${action.id}`}
            className={`cursor-pointer text-sm font-semibold ${
              isCompleted ? 'text-zinc-500 line-through' : 'text-zinc-100'
            }`}
          >
            <span className="mr-1.5 text-zinc-500">#{action.order}</span>
            {action.title}
          </label>

          {/* Description */}
          <p className={`mt-1 text-xs leading-relaxed ${isCompleted ? 'text-zinc-600' : 'text-zinc-400'}`}>
            {action.description}
          </p>

          {/* Footer: owner + criteria + domain */}
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {/* Owner badge — AC3 */}
            <span
              className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${ownerStyle}`}
              aria-label={`Responsável: ${action.owner}`}
            >
              {action.owner}
            </span>

            {/* Completion criteria */}
            <span className="text-xs text-zinc-500" aria-label="Critério de conclusão">
              ✓ {action.completionCriteria}
            </span>
          </div>

          {/* Domain link — AC3 */}
          <div className="mt-2">
            <Link
              href={`/domains/${action.relatedDomain}`}
              className="text-xs text-zinc-500 hover:text-zinc-300 hover:underline"
              aria-label={`Ver domínio ISC2: ${action.relatedDomain}`}
            >
              📚 {action.relatedDomain}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
