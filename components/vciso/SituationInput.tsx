'use client';

import { useState, useCallback } from 'react';
import type { InteractionMode, SituationClassification } from '@/types/index';

interface ModeCard {
  mode: InteractionMode;
  icon: string;
  label: string;
  description: string;
}

const MODE_CARDS: ModeCard[] = [
  {
    mode: 'orient-me-now',
    icon: '🚨',
    label: 'Oriente-me agora',
    description: 'Crise / incidente ativo',
  },
  {
    mode: 'help-decide',
    icon: '⚖️',
    label: 'Ajude-me a decidir',
    description: 'Decisão estratégica',
  },
  {
    mode: 'help-comply',
    icon: '📋',
    label: 'Ajude-me a cumprir',
    description: 'Compliance / auditoria',
  },
  {
    mode: 'help-operate',
    icon: '⚙️',
    label: 'Ajude-me a operar',
    description: 'Rotina / programa',
  },
];

interface SituationInputProps {
  onClassification: (classification: SituationClassification) => void;
  onLoadingChange?: (loading: boolean) => void;
  profile: string;
}

export function SituationInput({
  onClassification,
  onLoadingChange,
  profile,
}: SituationInputProps) {
  const [situation, setSituation] = useState('');
  const [selectedMode, setSelectedMode] = useState<InteractionMode | null>(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleModeCard = useCallback((mode: InteractionMode) => {
    setSelectedMode(mode);
    const textarea = document.getElementById('situation-input') as HTMLTextAreaElement;
    textarea?.focus();
  }, []);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (situation.length < 10) {
        setError('Pode descrever melhor? Ex: "Tivemos um ransomware hoje de manhã"');
        return;
      }
      setError('');
      setIsLoading(true);
      onLoadingChange?.(true);

      try {
        const res = await fetch('/api/classify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ situation, profile }),
        });
        const data: SituationClassification = await res.json();
        onClassification(data);
      } catch {
        setError('Não foi possível classificar a situação. Tente novamente.');
      } finally {
        setIsLoading(false);
        onLoadingChange?.(false);
      }
    },
    [situation, profile, onClassification, onLoadingChange]
  );

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full max-w-2xl">
      {/* Mode cards */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="group" aria-label="Modo de interação">
        {MODE_CARDS.map((card) => (
          <button
            key={card.mode}
            type="button"
            role="button"
            aria-pressed={selectedMode === card.mode}
            onClick={() => handleModeCard(card.mode)}
            className={`flex flex-col items-center gap-1 rounded-lg border p-3 text-center text-sm transition-colors
              ${
                selectedMode === card.mode
                  ? 'border-blue-500 bg-blue-950/40 text-blue-300'
                  : 'border-zinc-700 bg-zinc-900 text-zinc-400 hover:border-zinc-500 hover:text-zinc-300'
              }`}
          >
            <span className="text-xl">{card.icon}</span>
            <span className="font-medium leading-tight">{card.label}</span>
            <span className="text-xs text-zinc-500">{card.description}</span>
          </button>
        ))}
      </div>

      {/* Textarea */}
      <div className="flex flex-col gap-1">
        <textarea
          id="situation-input"
          aria-label="Descreva sua situação de segurança"
          placeholder="Descreva sua situação de segurança..."
          value={situation}
          onChange={(e) => {
            setSituation(e.target.value);
            if (e.target.value.length >= 10) setError('');
          }}
          rows={4}
          className="w-full resize-none rounded-lg border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        />
        {error && (
          <p role="alert" className="text-xs text-amber-400">
            {error}
          </p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Analisando...' : 'Consultar vCISO'}
      </button>
    </form>
  );
}
