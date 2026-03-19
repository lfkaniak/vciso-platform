'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { ShieldAlert, ChevronDown, Info } from 'lucide-react';
import { Collapsible, CollapsibleTrigger, CollapsibleContent } from '@/components/ui/collapsible';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import type { TenthManState } from '@/types/index';

const TENTH_MAN_TOOLTIP =
  'O Mecanismo do 10º Homem, inspirado na doutrina israelense, garante que nenhuma decisão de segurança seja tomada sem uma perspectiva contrária estruturada.';

const LABEL = '⚠️ Perspectiva Adversarial — Mecanismo do 10º Homem';

interface TenthManBlockProps {
  state: TenthManState;
  defaultExpanded?: boolean;
}

function TenthManSkeleton() {
  return (
    <div
      className="flex flex-col gap-2 p-4"
      role="status"
      aria-label="Gerando perspectiva adversarial"
    >
      {[70, 90, 55, 80].map((w, i) => (
        <div
          key={i}
          className="h-3 animate-pulse rounded bg-amber-900/40"
          style={{ width: `${w}%` }}
        />
      ))}
    </div>
  );
}

export function TenthManBlock({ state, defaultExpanded = true }: TenthManBlockProps) {
  const [open, setOpen] = useState(defaultExpanded);

  const hasContent = state.content.trim().length > 0;
  const showContent = hasContent || state.isStreaming || !!state.error;

  if (!showContent) return null;

  return (
    <section
      role="complementary"
      aria-label="Perspectiva Adversarial - Mecanismo do 10º Homem"
      className="rounded-lg border-l-4 border-red-500 border border-red-800/40 bg-red-950/20 overflow-hidden"
    >
      <Collapsible open={open} onOpenChange={setOpen}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 bg-red-950/30">
          <div className="flex items-center gap-2 min-w-0">
            <ShieldAlert className="h-4 w-4 text-red-400 shrink-0" aria-hidden="true" />
            <span className="text-sm font-semibold text-red-300 truncate">{LABEL}</span>

            {/* Tooltip — AC3 */}
            <Tooltip>
              <TooltipTrigger
                aria-label="O que é o Mecanismo do 10º Homem?"
                className="shrink-0 text-red-500 hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-400 rounded"
              >
                <Info className="h-3.5 w-3.5" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-xs text-xs">
                {TENTH_MAN_TOOLTIP}
              </TooltipContent>
            </Tooltip>

            {state.isStreaming && (
              <span className="text-xs text-red-500 animate-pulse shrink-0">gerando...</span>
            )}
          </div>

          {/* Collapse toggle — AC5, Task 5.3 */}
          <CollapsibleTrigger
            aria-expanded={open}
            className="ml-2 shrink-0 text-red-500 hover:text-red-300 focus:outline-none focus:ring-1 focus:ring-red-400 rounded"
          >
            <ChevronDown
              className={`h-4 w-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            />
          </CollapsibleTrigger>
        </div>

        {/* Body */}
        <CollapsibleContent id="tenth-man-content" className="transition-all duration-200">
          {state.error ? (
            <div className="px-4 py-3 flex items-center gap-2 text-sm text-red-400">
              <ShieldAlert className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Perspectiva adversarial indisponível no momento.</span>
            </div>
          ) : state.isStreaming && !hasContent ? (
            <TenthManSkeleton />
          ) : (
            <div className="px-4 py-3 prose prose-invert prose-sm max-w-none text-red-100/80 [&_h2]:text-red-300 [&_strong]:text-red-200">
              <ReactMarkdown>{state.content}</ReactMarkdown>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </section>
  );
}
