// Smoke test — Story 1.1 AC1
// Validates that all core TypeScript interfaces can be imported without error.
import type {
  UserProfile,
  InteractionMode,
  SituationClassification,
  ISC2Domain,
  Situation,
  StreamChunkType,
  StreamEvent,
  TenthManState,
  TenthManResponse,
  ArtifactType,
  ArtifactContext,
  GeneratedArtifact,
  PlaybookType,
  PlaybookPhase,
  PlaybookAction,
  PlaybookProgress,
  VCISOErrorCode,
  VCISOError,
  UserSession,
} from '@/types/index';

describe('Core TypeScript interfaces', () => {
  it('UserProfile values are valid', () => {
    const profiles: UserProfile[] = ['executive', 'it-professional', 'consultant'];
    expect(profiles).toHaveLength(3);
  });

  it('InteractionMode values are valid', () => {
    const modes: InteractionMode[] = [
      'orient-me-now',
      'help-decide',
      'help-comply',
      'help-operate',
    ];
    expect(modes).toHaveLength(4);
  });

  it('SituationClassification can be constructed', () => {
    const classification: SituationClassification = {
      mode: 'orient-me-now',
      relevantDomains: ['cissp-07'],
      urgency: 'high',
      confidence: 0.95,
    };
    expect(classification.mode).toBe('orient-me-now');
    expect(classification.urgency).toBe('high');
  });

  it('ArtifactType values are valid', () => {
    const types: ArtifactType[] = [
      'security-posture-report',
      'budget-proposal-rosi',
      'security-program-roadmap',
      'iso27001-audit-checklist',
      'lgpd-adequacy-process',
    ];
    expect(types).toHaveLength(5);
  });

  it('VCISOError can be constructed', () => {
    const error: VCISOError = {
      code: 'API_UNAVAILABLE',
      message: 'O vCISO está momentaneamente indisponível. Tente em 30 segundos.',
      retryable: true,
    };
    expect(error.code).toBe('API_UNAVAILABLE');
    expect(error.retryable).toBe(true);
  });

  it('PlaybookProgress can be constructed', () => {
    const progress: PlaybookProgress = {
      playbookType: 'ransomware',
      completedActions: ['ransomware-01-01', 'ransomware-01-02'],
      startedAt: new Date(),
    };
    expect(progress.completedActions).toHaveLength(2);
  });

  // Type-only import guard — if this file compiles, all types are valid
  it('all types imported without error', () => {
    // This test passes simply by the file compiling successfully.
    const _typeCheck: Record<string, unknown> = {
      userProfile: {} as UserProfile,
      interactionMode: {} as InteractionMode,
      isc2Domain: {} as ISC2Domain,
      situation: {} as Situation,
      streamChunkType: {} as StreamChunkType,
      streamEvent: {} as StreamEvent,
      tenthManState: {} as TenthManState,
      tenthManResponse: {} as TenthManResponse,
      artifactContext: {} as ArtifactContext,
      generatedArtifact: {} as GeneratedArtifact,
      playbookType: {} as PlaybookType,
      playbookPhase: {} as PlaybookPhase,
      playbookAction: {} as PlaybookAction,
      vcISOErrorCode: {} as VCISOErrorCode,
      userSession: {} as UserSession,
    };
    expect(_typeCheck).toBeDefined();
  });
});
