// =============================================================================
// vCISO Platform — Core TypeScript Interfaces
// Source: docs/architecture/fullstack-architecture.md#3-typescript-core-interfaces
// =============================================================================

// --- User & Session -----------------------------------------------------------

export type UserProfile = 'executive' | 'it-professional' | 'consultant';

export type InteractionMode =
  | 'orient-me-now'
  | 'help-decide'
  | 'help-comply'
  | 'help-operate';

export interface SituationClassification {
  mode: InteractionMode;
  relevantDomains: string[];
  urgency: 'high' | 'medium' | 'low';
  detectedProfile?: UserProfile;
  confidence: number;
}

export type PlaybookType = 'ransomware' | 'data-breach';
export type PlaybookPhase = '0-30min' | '24h' | '72h';

export interface PlaybookAction {
  id: string; // e.g. 'ransomware-01-01'
  phase: PlaybookPhase;
  order: number;
  title: string;
  description: string;
  owner: string;
  completionCriteria: string;
  relatedDomain: string;
}

export interface PlaybookProgress {
  playbookType: PlaybookType;
  completedActions: string[];
  startedAt?: Date;
}

export interface UserSession {
  profile: UserProfile;
  recentSituations: string[];
  playbookProgress: Record<PlaybookType, PlaybookProgress>;
}

// --- Knowledge Base -----------------------------------------------------------

export interface ISC2Domain {
  id: string; // e.g. 'cissp-01'
  title: string;
  certification: 'CISSP' | 'ISSMP';
  domainNumber: number;
  keyFrameworks: string[]; // exactly 3
  relatedDomains: string[];
  keywords: string[];
  situationClusters?: string[];
  content?: string; // MDX content (optional, loaded on demand)
}

export type SituationCluster =
  | 'crisis'
  | 'strategic'
  | 'compliance'
  | 'operational'
  | 'projects';

export interface Situation {
  id: string; // e.g. 'S01'
  title: string;
  cluster: SituationCluster;
  urgency: 'high' | 'medium' | 'low';
  relevantDomains: string[];
  mode: InteractionMode;
  isMvp: boolean;
  promptSeed?: string;
}

// --- Streaming / SSE ----------------------------------------------------------

export type StreamChunkType = 'M' | 'T' | 'S' | 'A';

export interface StreamEvent {
  type: StreamChunkType;
  payload: string;
}

// --- 10th Man -----------------------------------------------------------------

export type TenthManErrorCode = 'unavailable' | 'timeout';

export interface TenthManState {
  isStreaming: boolean;
  isComplete: boolean;
  content: string;
  error?: TenthManErrorCode;
}

export interface TenthManResponse {
  alternativeScenario: string;
  counterEvidence: string;
  dominantRiskAnalysis: string;
  provocativeQuestion: string;
}

// --- Artifacts ----------------------------------------------------------------

export type ArtifactType =
  | 'security-posture-report'
  | 'budget-proposal-rosi'
  | 'security-program-roadmap'
  | 'iso27001-audit-checklist'
  | 'lgpd-adequacy-process';

export interface ArtifactContext {
  type: ArtifactType;
  organizationName: string;
  sector: string;
  maturityLevel: 'initial' | 'developing' | 'defined' | 'managed' | 'optimizing';
  additionalContext?: Record<string, string>;
}

export interface GeneratedArtifact {
  type: ArtifactType;
  title: string;
  content: string; // Full Markdown
  generatedAt: Date;
  context: ArtifactContext;
}

// --- Error Handling -----------------------------------------------------------

export type VCISOErrorCode =
  | 'CLASSIFICATION_FAILED'
  | 'API_UNAVAILABLE'
  | 'STREAM_INTERRUPTED'
  | 'TENTH_MAN_FAILED'
  | 'TENTH_MAN_TIMEOUT'
  | 'INVALID_INPUT';

export interface VCISOError {
  code: VCISOErrorCode;
  message: string;
  retryable: boolean;
}
