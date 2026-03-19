'use client';
// Source: docs/architecture/fullstack-architecture.md#63-hook-usevciso
import { useState, useCallback } from 'react';
import type { UserProfile, SituationClassification, VCISOError } from '@/types/index';
import { fetchDomainContext } from '@/app/actions/getDomainContext';

export interface VCISOState {
  mainContent: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: VCISOError | null;
}

const INITIAL_STATE: VCISOState = {
  mainContent: '',
  isStreaming: false,
  isComplete: false,
  error: null,
};

/** Parse SSE data lines into state updates via a callback. */
async function consumeVCISOStream(
  situation: string,
  profile: UserProfile,
  classification: SituationClassification,
  domainContext: string,
  onChunk: (chunk: string) => void,
  onSignal: (signal: string) => void,
  onError: (err: VCISOError) => void
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
          onChunk(data.slice(2));
        } else if (data === 'S:ERROR:API_UNAVAILABLE') {
          onError({
            code: 'API_UNAVAILABLE',
            message: 'O vCISO está momentaneamente indisponível. Tente em 30 segundos.',
            retryable: true,
          });
          return;
        } else if (data.startsWith('S:ERROR:')) {
          onError({
            code: 'STREAM_INTERRUPTED',
            message: 'A resposta foi interrompida. Tente novamente.',
            retryable: true,
          });
          return;
        } else if (data.startsWith('S:')) {
          onSignal(data.slice(2));
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

  /**
   * Submit a situation with a pre-existing classification (from SituationInput).
   * Fetches domain context via Server Action, then streams the vCISO response.
   */
  const submit = useCallback(
    async (situation: string, profile: UserProfile, classification: SituationClassification) => {
      setState({ mainContent: '', isStreaming: true, isComplete: false, error: null });

      // Fetch domain context (Node.js Server Action — avoids edge runtime fs restriction)
      let domainContext = '';
      try {
        domainContext = await fetchDomainContext(classification.relevantDomains);
      } catch {
        // Non-fatal: proceed without domain context
        console.warn('[useVCISO] fetchDomainContext failed, proceeding without context');
      }

      try {
        let streamEnded = false;

        await consumeVCISOStream(
          situation,
          profile,
          classification,
          domainContext,
          (chunk) => setState((prev) => ({ ...prev, mainContent: prev.mainContent + chunk })),
          (signal) => {
            if (signal === 'COMPLETE') {
              streamEnded = true;
              setState((prev) => ({ ...prev, isStreaming: false, isComplete: true }));
            }
          },
          (err) => {
            streamEnded = true;
            setState((prev) => ({ ...prev, isStreaming: false, error: err }));
          }
        );

        // Stream ended without S:COMPLETE → truncated
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
