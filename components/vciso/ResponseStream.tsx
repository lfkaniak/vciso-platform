'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { VCISOError, TenthManState } from '@/types/index';

interface ResponseStreamProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: VCISOError | null;
  tenthManState?: TenthManState;
}

/** Split markdown into sections by H2 headers. */
function splitSections(markdown: string): { title: string; body: string }[] {
  const lines = markdown.split('\n');
  const sections: { title: string; body: string }[] = [];
  let current: { title: string; lines: string[] } | null = null;

  for (const line of lines) {
    if (line.startsWith('## ')) {
      if (current) sections.push({ title: current.title, body: current.lines.join('\n') });
      current = { title: line.replace(/^## /, ''), lines: [] };
    } else if (current) {
      current.lines.push(line);
    }
  }
  if (current) sections.push({ title: current.title, body: current.lines.join('\n') });
  return sections;
}

function Section({ title, body }: { title: string; body: string }) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <div className="border border-zinc-800 rounded-lg overflow-hidden">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        className="w-full flex items-center justify-between px-4 py-3 bg-zinc-900 hover:bg-zinc-800 transition-colors text-left"
      >
        <h2 className="text-sm font-semibold text-zinc-200">{title}</h2>
        <span className="text-zinc-500 text-xs">{collapsed ? '▼' : '▲'}</span>
      </button>
      {!collapsed && (
        <div className="px-4 py-3 prose prose-invert prose-sm max-w-none text-zinc-300">
          <ReactMarkdown>{body}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}

/** Skeleton placeholder while streaming starts. */
function StreamingSkeleton() {
  return (
    <div className="flex flex-col gap-3 w-full" role="status" aria-label="Gerando resposta">
      {[80, 60, 90, 50, 70].map((w, i) => (
        <div
          key={i}
          className="animate-pulse rounded bg-zinc-800 h-4"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

/** AC4 + AC5 — 10th Man adversarial block with collapse/expand (Story 2.1). */
function TenthManBlock({ state }: { state: TenthManState }) {
  const [collapsed, setCollapsed] = useState(false);
  const hasContent = state.content.trim().length > 0;

  // Don't render if nothing to show yet and not streaming
  if (!hasContent && !state.isStreaming) return null;

  const label = 'Perspectiva Adversarial — 10º Homem';

  return (
    <div className="border border-amber-800/50 rounded-lg overflow-hidden mt-2">
      <button
        type="button"
        onClick={() => setCollapsed((c) => !c)}
        aria-expanded={!collapsed}
        className="w-full flex items-center justify-between px-4 py-3 bg-amber-950/30 hover:bg-amber-950/50 transition-colors text-left"
      >
        <span className="flex items-center gap-2 text-sm font-semibold text-amber-300">
          <span aria-hidden>⚡</span>
          {label}
          {state.isStreaming && (
            <span className="text-xs text-amber-500 animate-pulse">gerando...</span>
          )}
        </span>
        <span className="text-amber-600 text-xs">{collapsed ? '▼' : '▲'}</span>
      </button>

      {!collapsed && (
        <div className="px-4 py-3">
          {state.error ? (
            <p className="text-xs text-amber-600 italic">
              Perspectiva adversarial indisponível no momento.
            </p>
          ) : (
            <div className="prose prose-invert prose-sm max-w-none text-amber-100/80">
              <ReactMarkdown>{state.content}</ReactMarkdown>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export function ResponseStream({
  content,
  isStreaming,
  isComplete,
  error,
  tenthManState,
}: ResponseStreamProps) {
  const sections = useMemo(() => splitSections(content), [content]);
  const hasContent = content.trim().length > 0;
  const isInterrupted = !isStreaming && !isComplete && hasContent && !error;

  if (!hasContent && isStreaming) {
    return <StreamingSkeleton />;
  }

  if (!hasContent && !isStreaming) {
    return null;
  }

  return (
    <div className="flex flex-col gap-3 w-full">
      {sections.length > 0
        ? sections.map((s) => <Section key={s.title} title={s.title} body={s.body} />)
        : (
          <div className="prose prose-invert prose-sm max-w-none text-zinc-300 px-1">
            <ReactMarkdown>{content}</ReactMarkdown>
          </div>
        )}

      {isInterrupted && (
        <p className="text-xs text-amber-400 flex items-center gap-1">
          ⚠️ Resposta truncada — tente novamente
        </p>
      )}

      {tenthManState && <TenthManBlock state={tenthManState} />}
    </div>
  );
}
