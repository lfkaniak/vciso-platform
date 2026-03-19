'use client';

import { useState, useCallback } from 'react';
import type { ArtifactContext, ArtifactType } from '@/types/index';

interface ArtifactState {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: string | null;
}

const INITIAL_STATE: ArtifactState = {
  content: '',
  isStreaming: false,
  isComplete: false,
  error: null,
};

export function useArtifact(type: ArtifactType) {
  const [state, setState] = useState<ArtifactState>(INITIAL_STATE);

  const generate = useCallback(
    async (contextData: Omit<ArtifactContext, 'type'>) => {
      setState({ content: '', isStreaming: true, isComplete: false, error: null });

      try {
        const response = await fetch(`/api/artifacts/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(contextData),
        });

        if (!response.ok) {
          const err = await response.json().catch(() => ({}));
          setState((prev) => ({
            ...prev,
            isStreaming: false,
            error: err.message ?? 'Erro ao iniciar geração do artefato.',
          }));
          return;
        }

        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const events = buffer.split('\n\n');
          buffer = events.pop() ?? '';

          for (const event of events) {
            const raw = event.replace(/^data: /, '').trim();
            if (!raw) continue;

            if (raw.startsWith('A:')) {
              const chunk = raw.slice(2);
              setState((prev) => ({ ...prev, content: prev.content + chunk }));
            } else if (raw === 'S:ARTIFACT_DONE' || raw === 'S:COMPLETE') {
              setState((prev) => ({ ...prev, isStreaming: false, isComplete: true }));
            } else if (raw.startsWith('S:ERROR:')) {
              const code = raw.slice(8);
              const message =
                code === 'API_UNAVAILABLE'
                  ? 'O serviço de IA está momentaneamente indisponível. Tente em 30 segundos.'
                  : 'Erro durante a geração. Tente novamente.';
              setState((prev) => ({ ...prev, isStreaming: false, error: message }));
            }
          }
        }
      } catch {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: 'Falha de conexão. Verifique sua internet e tente novamente.',
        }));
      }
    },
    [type]
  );

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  return { ...state, generate, reset };
}
