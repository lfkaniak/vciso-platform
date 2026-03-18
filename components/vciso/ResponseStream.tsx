'use client';

import { useState, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import type { VCISOError } from '@/types/index';

interface ResponseStreamProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
  error: VCISOError | null;
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

/** Placeholder reserved for the 10th Man block (Story 2.1). */
function TenthManBlock() {
  return null;
}

export function ResponseStream({ content, isStreaming, isComplete, error }: ResponseStreamProps) {
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

      <TenthManBlock />
    </div>
  );
}
