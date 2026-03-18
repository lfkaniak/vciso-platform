'use client';
// Source: docs/architecture/fullstack-architecture.md#63-hook-usevciso
import { useState, useCallback } from 'react';
import type { UserProfile, SituationClassification, VCISOError, TenthManState } from '@/types/index';
import { fetchDomainContext } from '@/app/actions/getDomainContext';

export interface VCISOState {
  mainContent: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: VCISOError | null;
  tenthManState: TenthManState;
}

const INITIAL_TENTH_MAN: TenthManState = {
  isStreaming: false,
  isComplete: false,
  content: '',
};

const INITIAL_STATE: VCISOState = {
  mainContent: '',
  isStreaming: false,
  isComplete: false,
  error: null,
  tenthManState: INITIAL_TENTH_MAN,
};

async function consumeVCISOStream(
  situation: string,
  profile: UserProfile,
  classification: SituationClassification,
  domainContext: string,
  onMainChunk: (chunk: string) => void,
  onTenthChunk: (chunk: string) => void,
  onSignal: (signal: string) => void,
  onError: (err: VCISOError) => void,
  onTenthError: (code: 'unavailable' | 'timeout') => void
) {
  const res = await fetch('/api/vciso', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ situation, profile, classification, domainContext }),
  });

  if (!res.body) throw new Error('No response body');

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n\n');
      buffer = lines.pop() ?? '';

      for (const line of lines) {
        const data = line.replace(/^data: /, '').trim();
        if (!data) continue;

        if (data.startsWith('M:')) {
          onMainChunk(data.slice(2));
        } else if (data.startsWith('T:')) {
          onTenthChunk(data.slice(2));
        } else if (data === 'S:ERROR:API_UNAVAILABLE') {
          onError({
            code: 'API_UNAVAILABLE',
            message: 'O vCISO está momentaneamente indisponível. Tente em 30 segundos.',
            retryable: true,
          });
          return;
        } else if (data === 'S:ERROR:TENTH_MAN_TIMEOUT') {
          onTenthError('timeout');
        } else if (data === 'S:ERROR:TENTH_MAN_FAILED') {
          onTenthError('unavailable');
        } else if (data.startsWith('S:ERROR:')) {
          onError({
            code: 'STREAM_INTERRUPTED',
            message: 'A resposta foi interrompida. Tente novamente.',
            retryable: true,
          });
          return;
        } else if (data === 'S:TENTH_DONE') {
          onSignal('TENTH_DONE');
        } else if (data === 'S:MAIN_DONE') {
          onSignal('MAIN_DONE');
        } else if (data === 'S:COMPLETE') {
          onSignal('COMPLETE');
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}

export function useVCISO() {
  const [state, setState] = useState<VCISOState>(INITIAL_STATE);

  const reset = useCallback(() => setState(INITIAL_STATE), []);

  const submit = useCallback(
    async (situation: string, profile: UserProfile, classification: SituationClassification) => {
      setState({
        mainContent: '',
        isStreaming: true,
        isComplete: false,
        error: null,
        tenthManState: { ...INITIAL_TENTH_MAN, isStreaming: false },
      });

      let domainContext = '';
      try {
        domainContext = await fetchDomainContext(classification.relevantDomains);
      } catch {
        console.warn('[useVCISO] fetchDomainContext failed, proceeding without context');
      }

      try {
        let streamEnded = false;

        await consumeVCISOStream(
          situation,
          profile,
          classification,
          domainContext,
          // Main chunk
          (chunk) => setState((prev) => ({ ...prev, mainContent: prev.mainContent + chunk })),
          // Tenth man chunk — activate streaming indicator on first chunk
          (chunk) =>
            setState((prev) => ({
              ...prev,
              tenthManState: {
                ...prev.tenthManState,
                isStreaming: true,
                content: prev.tenthManState.content + chunk,
              },
            })),
          // Signals
          (signal) => {
            if (signal === 'COMPLETE') {
              streamEnded = true;
              setState((prev) => ({ ...prev, isStreaming: false, isComplete: true }));
            } else if (signal === 'TENTH_DONE') {
              setState((prev) => ({
                ...prev,
                tenthManState: { ...prev.tenthManState, isStreaming: false, isComplete: true },
              }));
            }
          },
          // Main error
          (err) => {
            streamEnded = true;
            setState((prev) => ({ ...prev, isStreaming: false, error: err }));
          },
          // Tenth man error — graceful degradation, never blocks main UI
          (code) =>
            setState((prev) => ({
              ...prev,
              tenthManState: { ...prev.tenthManState, isStreaming: false, error: code },
            }))
        );

        if (!streamEnded) {
          setState((prev) => {
            if (!prev.isComplete) return { ...prev, isStreaming: false };
            return prev;
          });
        }
      } catch {
        setState((prev) => ({
          ...prev,
          isStreaming: false,
          error: {
            code: 'STREAM_INTERRUPTED',
            message: 'A conexão foi interrompida. Tente novamente.',
            retryable: true,
          },
        }));
      }
    },
    []
  );

  return { ...state, submit, reset };
}
