// Source: docs/architecture/fullstack-architecture.md#41-prompt-de-classificação-apiclassify
import type { UserProfile } from '@/types/index';

export function buildClassifyPrompt(situation: string, profile: UserProfile): string {
  return `Você é o classificador de situações de segurança do vCISO.

SITUAÇÃO: "${situation}"
PERFIL DECLARADO: ${profile}

Analise a situação e retorne APENAS JSON válido (sem markdown, sem explicações):
{
  "mode": "orient-me-now" | "help-decide" | "help-comply" | "help-operate",
  "relevantDomains": ["cissp-XX", "issmp-XX"],
  "urgency": "high" | "medium" | "low",
  "confidence": 0.0-1.0
}

Regras de classificação:
- "orient-me-now": incidente ativo, crise, emergência (urgência alta)
- "help-decide": decisão estratégica, investimento, priorização
- "help-comply": auditoria, certificação, regulamentação, LGPD, ISO
- "help-operate": rotina, programa, políticas, operação contínua

Domínios ISC2 disponíveis: cissp-01, cissp-02, cissp-03, cissp-04, cissp-05, cissp-06, cissp-07, cissp-08, issmp-01, issmp-02, issmp-03, issmp-04, issmp-05, issmp-06
Retorne entre 1 e 3 domínios relevantes.`;
}
