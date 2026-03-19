'use client';

import ReactMarkdown from 'react-markdown';

interface ArtifactPreviewProps {
  content: string;
  isStreaming: boolean;
  isComplete: boolean;
}

export function ArtifactPreview({ content, isStreaming, isComplete }: ArtifactPreviewProps) {
  if (!content && isStreaming) {
    // Skeleton loading during first chunks
    return (
      <div className="space-y-3 animate-pulse" role="status" aria-label="Gerando artefato">
        <div className="h-6 w-3/4 rounded bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-800" />
        <div className="h-4 w-5/6 rounded bg-zinc-800" />
        <div className="h-4 w-4/5 rounded bg-zinc-800" />
        <div className="mt-4 h-4 w-2/3 rounded bg-zinc-800" />
        <div className="h-4 w-full rounded bg-zinc-800" />
        <div className="h-4 w-3/4 rounded bg-zinc-800" />
      </div>
    );
  }

  if (!content) return null;

  return (
    <div className="relative">
      {isStreaming && (
        <div className="mb-3 flex items-center gap-2 text-xs text-zinc-500">
          <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-blue-500" />
          Gerando artefato...
        </div>
      )}
      {isComplete && (
        <div className="mb-3 flex items-center gap-2 text-xs text-emerald-500">
          <span>✓</span>
          Artefato gerado com sucesso
        </div>
      )}

      <div className="prose prose-invert prose-sm max-w-none rounded-xl border border-zinc-800 bg-zinc-900/50 p-6">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl font-bold text-zinc-100 mb-4">{children}</h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-base font-semibold text-zinc-200 mt-6 mb-3 border-b border-zinc-800 pb-1">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-sm font-semibold text-zinc-300 mt-4 mb-2">{children}</h3>
            ),
            p: ({ children }) => (
              <p className="text-sm text-zinc-300 leading-relaxed mb-3">{children}</p>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-4">
                <table className="w-full text-xs border-collapse">{children}</table>
              </div>
            ),
            th: ({ children }) => (
              <th className="border border-zinc-700 bg-zinc-800 px-3 py-2 text-left font-medium text-zinc-200">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="border border-zinc-800 px-3 py-2 text-zinc-400">{children}</td>
            ),
            li: ({ children }) => (
              <li className="text-sm text-zinc-300 leading-relaxed">{children}</li>
            ),
            code: ({ children }) => (
              <code className="rounded bg-zinc-800 px-1.5 py-0.5 text-xs font-mono text-zinc-300">
                {children}
              </code>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
