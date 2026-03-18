'use client';

import { useState } from 'react';
import { SituationInput } from '@/components/vciso/SituationInput';
import { ClassificationBadge } from '@/components/vciso/ClassificationBadge';
import { useProfile } from '@/hooks/useProfile';
import type { SituationClassification } from '@/types/index';

export default function Home() {
  const { profile } = useProfile();
  const [classification, setClassification] = useState<SituationClassification | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center justify-center gap-8 px-6 py-12">
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
        onClassification={setClassification}
        onLoadingChange={setIsLoading}
      />

      {isLoading && (
        <div
          role="status"
          aria-label="Analisando situação"
          className="h-10 w-full max-w-2xl animate-pulse rounded-lg bg-zinc-800"
        />
      )}

      {!isLoading && classification && (
        <div className="w-full max-w-2xl">
          <ClassificationBadge classification={classification} />
        </div>
      )}
    </main>
  );
}
