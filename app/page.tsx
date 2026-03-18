'use client';

import { useState, useCallback } from 'react';
import { SituationInput } from '@/components/vciso/SituationInput';
import { ClassificationBadge } from '@/components/vciso/ClassificationBadge';
import { ResponseStream } from '@/components/vciso/ResponseStream';
import { useProfile } from '@/hooks/useProfile';
import { useVCISO } from '@/hooks/useVCISO';
import type { SituationClassification } from '@/types/index';

export default function Home() {
  const { profile } = useProfile();
  const [classification, setClassification] = useState<SituationClassification | null>(null);
  const [isClassifying, setIsClassifying] = useState(false);
  const [lastSituation, setLastSituation] = useState('');

  const { mainContent, isStreaming, isComplete, error, tenthManState, submit, reset } = useVCISO();

  const handleClassification = useCallback(
    (classified: SituationClassification, situation: string) => {
      setLastSituation(situation);
      setClassification(classified);
      submit(situation, profile, classified);
    },
    [profile, submit]
  );

  const handleRetry = useCallback(() => {
    if (lastSituation && classification) {
      reset();
      submit(lastSituation, profile, classification);
    }
  }, [lastSituation, classification, profile, reset, submit]);

  const hasResponse = mainContent.length > 0 || isStreaming;

  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">
          Como posso ajudar hoje?
        </h1>
        <p className="text-sm text-zinc-500">
          Descreva sua situação de segurança e receba orientação especializada
        </p>
      </div>

      <SituationInput
        profile={profile}
        onClassification={handleClassification}
        onLoadingChange={(loading) => {
          setIsClassifying(loading);
          if (loading) {
            reset();
            setClassification(null);
          }
        }}
      />

      {isClassifying && (
        <div
          role="status"
          aria-label="Analisando situação"
          className="h-10 w-full max-w-2xl animate-pulse rounded-lg bg-zinc-800"
        />
      )}

      {!isClassifying && classification && (
        <div className="w-full max-w-2xl">
          <ClassificationBadge classification={classification} />
        </div>
      )}

      {error && (
        <div className="w-full max-w-2xl flex items-center justify-between rounded-lg border border-red-800 bg-red-950/30 px-4 py-3">
          <p className="text-sm text-red-300">{error.message}</p>
          {error.retryable && (
            <button
              type="button"
              onClick={handleRetry}
              className="ml-4 text-xs text-red-400 underline hover:text-red-300 shrink-0"
            >
              Tentar novamente
            </button>
          )}
        </div>
      )}

      {hasResponse && !error && (
        <div className="w-full max-w-2xl">
          <ResponseStream
            content={mainContent}
            isStreaming={isStreaming}
            isComplete={isComplete}
            error={error}
            tenthManState={tenthManState}
          />
        </div>
      )}
    </main>
  );
}
