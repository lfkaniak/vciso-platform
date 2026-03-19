// Situations knowledge base — static JSON import (no fs, safe for client and server)
import type { Situation, SituationCluster } from '@/types/index';
import situationsData from '@/content/situations/situations.json';

const situations: Situation[] = situationsData as Situation[];

export function getAllSituations(): Situation[] {
  return situations;
}

export function getSituation(id: string): Situation | null {
  return situations.find((s) => s.id === id) ?? null;
}

export function getSituationsByCluster(cluster: SituationCluster): Situation[] {
  return situations.filter((s) => s.cluster === cluster);
}

export function getMvpSituations(): Situation[] {
  return situations.filter((s) => s.isMvp);
}
