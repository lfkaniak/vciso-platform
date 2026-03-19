'use client';

import { use, useCallback, useState } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArtifactForm } from '@/components/artifacts/ArtifactForm';
import { ArtifactPreview } from '@/components/artifacts/ArtifactPreview';
import { ExportButtons } from '@/components/artifacts/ExportButtons';
import { ARTIFACTS } from '@/components/artifacts/ArtifactList';
import { useArtifact } from '@/hooks/useArtifact';
import type { ArtifactType, ArtifactContext, GeneratedArtifact } from '@/types/index';

const VALID_TYPES = new Set<ArtifactType>([
  'security-posture-report',
  'budget-proposal-rosi',
  'security-program-roadmap',
  'iso27001-audit-checklist',
  'lgpd-adequacy-process',
]);

interface PageProps {
  params: Promise<{ type: string }>;
}

export default function ArtifactGeneratorPage({ params }: PageProps) {
  const { type } = use(params);

  if (!VALID_TYPES.has(type as ArtifactType)) {
    notFound();
  }

  const artifactType = type as ArtifactType;
  const artifactMeta = ARTIFACTS.find((a) => a.type === artifactType)!;
  const { content, isStreaming, isComplete, error, generate, reset } = useArtifact(artifactType);
  const [lastContext, setLastContext] = useState<Omit<ArtifactContext, 'type'> | null>(null);
  // Stable timestamp captured at submit time — avoids new Date() on every re-render
  const [requestedAt, setRequestedAt] = useState<Date | null>(null);

  const handleSubmit = useCallback(
    (contextData: Omit<ArtifactContext, 'type'>) => {
      setLastContext(contextData);
      setRequestedAt(new Date());
      reset();
      generate(contextData);
    },
    [generate, reset]
  );

  const hasOutput = content.length > 0 || isStreaming;

  // Build GeneratedArtifact for export when complete
  const generatedArtifact: GeneratedArtifact | null =
    isComplete && lastContext && requestedAt
      ? {
          type: artifactType,
          title: artifactMeta.title,
          content,
          generatedAt: requestedAt,
          context: { type: artifactType, ...lastContext },
        }
      : null;

  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col gap-8 px-6 py-12">
      <div className="mx-auto w-full max-w-5xl">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
          <Link href="/artifacts" className="hover:text-zinc-300 transition-colors">
            Artefatos
          </Link>
          <span>/</span>
          <span className="text-zinc-300">{artifactMeta.title}</span>
        </nav>

        <div className="flex items-center gap-3 mb-2">
          <span className="text-3xl" aria-hidden="true">
            {artifactMeta.icon}
          </span>
          <h1 className="text-2xl font-semibold text-zinc-100">{artifactMeta.title}</h1>
        </div>
        <p className="text-sm text-zinc-500 mb-8">{artifactMeta.description}</p>

        <div
          className={`grid gap-8 ${
            hasOutput ? 'grid-cols-1 lg:grid-cols-[380px_1fr]' : 'grid-cols-1 max-w-lg'
          }`}
        >
          {/* Form column */}
          <div className="flex flex-col gap-4">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h2 className="mb-4 text-sm font-semibold text-zinc-300">
                Contexto Organizacional
              </h2>
              <ArtifactForm
                type={artifactType}
                onSubmit={handleSubmit}
                isLoading={isStreaming}
              />
            </div>

            {hasOutput && !isComplete && (
              <p className="text-xs text-zinc-600 text-center">
                ⏱ Tempo estimado: {artifactMeta.estimatedTime}
              </p>
            )}

            {/* Export buttons — shown only when generation is complete */}
            {generatedArtifact && (
              <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
                <ExportButtons artifact={generatedArtifact} disabled={isStreaming} />
              </div>
            )}
          </div>

          {/* Preview column */}
          {hasOutput && (
            <div>
              {error ? (
                <div className="rounded-xl border border-red-800 bg-red-950/30 px-4 py-3">
                  <p className="text-sm text-red-300">{error}</p>
                  <button
                    type="button"
                    onClick={reset}
                    className="mt-2 text-xs text-red-400 underline hover:text-red-300"
                  >
                    Tentar novamente
                  </button>
                </div>
              ) : (
                <ArtifactPreview
                  content={content}
                  isStreaming={isStreaming}
                  isComplete={isComplete}
                />
              )}
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
