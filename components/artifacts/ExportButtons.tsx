'use client';

import { useState } from 'react';
import { exportToMarkdown } from '@/lib/export/markdown';
import type { GeneratedArtifact } from '@/types/index';

interface ExportState {
  md: 'idle' | 'loading' | 'done' | 'error';
  pdf: 'idle' | 'loading' | 'done' | 'error';
  ppt: 'idle' | 'loading' | 'done' | 'error';
}

interface ExportError {
  md?: string;
  pdf?: string;
  ppt?: string;
}

interface ExportButtonsProps {
  artifact: GeneratedArtifact;
  disabled?: boolean;
}

export function ExportButtons({ artifact, disabled = false }: ExportButtonsProps) {
  const [state, setState] = useState<ExportState>({ md: 'idle', pdf: 'idle', ppt: 'idle' });
  const [errors, setErrors] = useState<ExportError>({});

  // --- Markdown ---
  function handleMarkdown() {
    setState((s) => ({ ...s, md: 'loading' }));
    setErrors((e) => ({ ...e, md: undefined }));
    try {
      exportToMarkdown(artifact);
      setState((s) => ({ ...s, md: 'done' }));
      setTimeout(() => setState((s) => ({ ...s, md: 'idle' })), 2000);
    } catch {
      setState((s) => ({ ...s, md: 'error' }));
      setErrors((e) => ({ ...e, md: 'Falha ao baixar Markdown.' }));
    }
  }

  // --- PDF ---
  async function handlePDF() {
    setState((s) => ({ ...s, pdf: 'loading' }));
    setErrors((e) => ({ ...e, pdf: undefined }));
    try {
      const { exportToPDF } = await import('@/lib/export/pdf');
      await exportToPDF(artifact);
      setState((s) => ({ ...s, pdf: 'done' }));
      setTimeout(() => setState((s) => ({ ...s, pdf: 'idle' })), 2000);
    } catch {
      setState((s) => ({ ...s, pdf: 'error' }));
      setErrors((e) => ({
        ...e,
        pdf: 'Falha ao gerar PDF. Tente Markdown.',
      }));
    }
  }

  // --- PowerPoint via Gamma.app ---
  async function handlePowerPoint() {
    setState((s) => ({ ...s, ppt: 'loading' }));
    setErrors((e) => ({ ...e, ppt: undefined }));
    try {
      const res = await fetch('/api/export/gamma', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ artifact }),
      });

      const data = await res.json() as { url?: string; message?: string };

      if (!res.ok || !data.url) {
        throw new Error(data.message ?? 'Export para PowerPoint indisponível. Tente Markdown ou PDF.');
      }

      window.open(data.url, '_blank', 'noopener,noreferrer');
      setState((s) => ({ ...s, ppt: 'done' }));
      setTimeout(() => setState((s) => ({ ...s, ppt: 'idle' })), 3000);
    } catch (err) {
      setState((s) => ({ ...s, ppt: 'error' }));
      setErrors((e) => ({
        ...e,
        ppt: err instanceof Error ? err.message : 'Export para PowerPoint indisponível. Tente Markdown ou PDF.',
      }));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">Exportar</p>

      <div className="flex flex-wrap gap-2">
        {/* Markdown button */}
        <button
          type="button"
          onClick={handleMarkdown}
          disabled={disabled || state.md === 'loading'}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.md === 'loading' ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-zinc-200" />
          ) : state.md === 'done' ? (
            <span>✓</span>
          ) : (
            <span>⬇️</span>
          )}
          Markdown
        </button>

        {/* PDF button */}
        <button
          type="button"
          onClick={handlePDF}
          disabled={disabled || state.pdf === 'loading'}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.pdf === 'loading' ? (
            <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-zinc-200" />
          ) : state.pdf === 'done' ? (
            <span>✓</span>
          ) : (
            <span>📄</span>
          )}
          PDF
        </button>

        {/* PowerPoint button */}
        <button
          type="button"
          onClick={handlePowerPoint}
          disabled={disabled || state.ppt === 'loading'}
          className="flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-xs font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
        >
          {state.ppt === 'loading' ? (
            <>
              <span className="h-3 w-3 animate-spin rounded-full border border-zinc-500 border-t-zinc-200" />
              Gerando apresentação...
            </>
          ) : state.ppt === 'done' ? (
            <span>✓ Aberto</span>
          ) : (
            <>
              <span>📊</span>
              PowerPoint
            </>
          )}
        </button>
      </div>

      {/* Error messages — independent per format */}
      {errors.md && (
        <p className="text-xs text-red-400">{errors.md}</p>
      )}
      {errors.pdf && (
        <p className="text-xs text-red-400">{errors.pdf}</p>
      )}
      {errors.ppt && (
        <p className="text-xs text-amber-400">{errors.ppt}</p>
      )}

      {state.ppt === 'loading' && (
        <p className="text-xs text-zinc-500">
          Gamma.app está gerando sua apresentação (5-15 segundos)...
        </p>
      )}
    </div>
  );
}
