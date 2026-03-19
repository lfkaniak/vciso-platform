'use client';

import { useState, useCallback } from 'react';
import type { PlaybookType, PlaybookProgress } from '@/types/index';

const STORAGE_KEY = (type: PlaybookType) => `vciso_playbook_${type}`;

function readFromStorage(type: PlaybookType): PlaybookProgress | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY(type));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as PlaybookProgress;
    return parsed;
  } catch {
    return null;
  }
}

function writeToStorage(type: PlaybookType, progress: PlaybookProgress): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY(type), JSON.stringify(progress));
  } catch {
    // localStorage unavailable (private mode, quota exceeded) — degrade gracefully
  }
}

function removeFromStorage(type: PlaybookType): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.removeItem(STORAGE_KEY(type));
  } catch {
    // ignore
  }
}

interface UsePlaybookReturn {
  completedActions: string[];
  toggleAction: (id: string) => void;
  resetProgress: () => void;
  progressPercent: (total: number) => number;
  startedAt: Date | undefined;
}

export function usePlaybook(type: PlaybookType): UsePlaybookReturn {
  // Lazy initializer: reads localStorage on first client-side render only (SSR-safe)
  const [progress, setProgress] = useState<PlaybookProgress>(() => {
    const saved = readFromStorage(type);
    if (saved) {
      return {
        ...saved,
        startedAt: saved.startedAt ? new Date(saved.startedAt) : undefined,
      };
    }
    return { playbookType: type, completedActions: [], startedAt: undefined };
  });

  const toggleAction = useCallback(
    (id: string) => {
      setProgress((prev) => {
        const isCompleted = prev.completedActions.includes(id);
        const newCompleted = isCompleted
          ? prev.completedActions.filter((a) => a !== id)
          : [...prev.completedActions, id];

        const updated: PlaybookProgress = {
          ...prev,
          completedActions: newCompleted,
          // Persist startedAt on first action marked
          startedAt:
            prev.startedAt ?? (!isCompleted && newCompleted.length === 1
              ? new Date()
              : prev.startedAt),
        };
        writeToStorage(type, updated);
        return updated;
      });
    },
    [type]
  );

  const resetProgress = useCallback(() => {
    const reset: PlaybookProgress = {
      playbookType: type,
      completedActions: [],
      startedAt: undefined,
    };
    removeFromStorage(type);
    setProgress(reset);
  }, [type]);

  const progressPercent = useCallback(
    (total: number) => {
      if (total === 0) return 0;
      return Math.round((progress.completedActions.length / total) * 100);
    },
    [progress.completedActions.length]
  );

  return {
    completedActions: progress.completedActions,
    toggleAction,
    resetProgress,
    progressPercent,
    startedAt: progress.startedAt,
  };
}
