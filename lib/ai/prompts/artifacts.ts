// Artifact generation prompts for the 5 executive artifact types.
// Edge-runtime safe — NO fs/path/crypto imports.
// max_tokens: 3000 (configured in route handler)
// Model: claude-3-5-sonnet-20241022

import type { ArtifactContext } from '@/types/index';

// --- Security Posture Report ---------------------------------------------------

function buildSecurityPostureReport(ctx: ArtifactContext): string {
  const riskAppetite = ctx.additionalContext?.riskAppetite ?? 'não informado';
  const keyAssets = ctx.additionalContext?.keyAssets ?? 'não informado';

  return `Você é um vCISO sênior certificado CISSP e ISSMP gerando um Security Posture Report executivo.

CONTEXTO ORGANIZACIONAL:
- Organização: ${ctx.organizationName}
- Setor: ${ctx.sector}
- Maturidade de Segurança: ${ctx.maturityLevel}
- Apetite de Risco: ${riskAppetite}
- Ativos Críticos: ${keyAssets}

Gere um Security Posture Report completo em Markdown estruturado, em português brasileiro, com EXATAMENTE estas seções:

# Security Posture Report — ${ctx.organizationName}

## Sumário Executivo
[3-4 parágrafos: situação atual, nível de exposição, pontos críticos identificados e recomendações prioritárias. Linguagem para board e C-level. Use o nível de maturidade ${ctx.maturityLevel} como ponto de partida.]

## Matriz de Riscos
[Tabela Markdown com colunas: Risco | Probabilidade | Impacto | Exposição | Status. Liste 8-10 riscos relevantes para o setor ${ctx.sector}. Probabilidade e Impacto: Alta/Média/Baixa. Exposição: Alta/Média/Baixa. Status: Não tratado / Em mitigação / Aceito.]

## Gaps de Controles (ISO 27001 / NIST CSF)
[Tabela Markdown com colunas: Domínio | Controle | Situação Atual | Gap | Criticidade (Crítica/Alta/Média). Mínimo 10 gaps baseados na maturidade ${ctx.maturityLevel}.]

## Recomendações Prioritárias
[Lista numerada. 5 ações imediatas (0-30 dias) e 5 de curto prazo (30-90 dias). Para cada: descrição clara, esforço estimado, impacto esperado e responsável sugerido.]

## Indicadores de Maturidade NIST CSF
[Tabela Markdown com colunas: Função | Nível Atual (1-5) | Nível Alvo (1-5) | Gap | Prazo. Funções: Identify / Protect / Detect / Respond / Recover.]

REGRAS ABSOLUTAS:
- Todo conteúdo em português brasileiro
- Dados específicos ao setor ${ctx.sector}
- Recomendações acionáveis e mensuráveis
- Tabelas com formatação Markdown correta (| col | col |)
- Não invente dados estatísticos sem base real`;
}

// --- Budget Proposal (ROSI) ----------------------------------------------------

function buildBudgetProposalROSI(ctx: ArtifactContext): string {
  const annualBudget = ctx.additionalContext?.annualBudget ?? 'não informado';
  const currentSpend = ctx.additionalContext?.currentSpend ?? 'não informado';

  return `Você é um vCISO sênior certificado CISSP e ISSMP gerando uma Proposta de Orçamento de Segurança com análise de ROSI.

CONTEXTO ORGANIZACIONAL:
- Organização: ${ctx.organizationName}
- Setor: ${ctx.sector}
- Maturidade de Segurança: ${ctx.maturityLevel}
- Orçamento Anual Estimado: ${annualBudget}
- Investimento Atual em Segurança: ${currentSpend}

Gere uma Proposta de Orçamento completa em Markdown estruturado, em português brasileiro, com EXATAMENTE estas seções:

# Proposta de Orçamento de Segurança — ${ctx.organizationName}

## Sumário Executivo
[2-3 parágrafos: situação atual de investimento, justificativa de negócio, ROI esperado e recomendação de aprovação. Linguagem para CFO e CEO.]

## Inventário de Ativos e Exposição
[Tabela Markdown com colunas: Ativo / Categoria | Valor Estimado (BRL) | Exposição a Riscos | Controle Atual | Gap. Liste 8-10 ativos críticos típicos do setor ${ctx.sector}.]

## Análise de Ameaças e Impacto Financeiro
[Tabela Markdown com colunas: Ameaça | ALE (Annual Loss Expectancy) | Probabilidade | Impacto Financeiro Potencial. Liste 6-8 ameaças relevantes para ${ctx.sector}. Use método ALE = AV × EF × ARO.]

## Análise de ROSI (Return on Security Investment)
[Para cada iniciativa proposta: Investimento (R$) | Risco Reduzido | ALE Antes | ALE Depois | ROSI (%). Mínimo 5 iniciativas.]

## Roadmap de Investimentos
[Tabela com fases: Fase 1 (0-6 meses) | Fase 2 (6-12 meses) | Fase 3 (12-24 meses). Para cada fase: iniciativas, investimento, entregáveis mensuráveis.]

## Resumo Orçamentário
[Tabela consolidada: Categoria | Investimento Anual (R$) | Prioridade | Impacto. Categorias: Ferramentas/Tecnologia | Serviços/Consultoria | Treinamento | Conformidade | Governança.]

REGRAS ABSOLUTAS:
- Todo conteúdo em português brasileiro
- Valores em BRL quando possível
- Use benchmarks de mercado para o setor ${ctx.sector} quando citar percentuais
- Tabelas com formatação Markdown correta
- ROSI calculado com metodologia ALE (AV × EF × ARO)`;
}

// --- Security Program Roadmap --------------------------------------------------

function buildSecurityProgramRoadmap(ctx: ArtifactContext): string {
  const currentMaturity = ctx.additionalContext?.currentMaturity ?? ctx.maturityLevel;
  const targetMaturity = ctx.additionalContext?.targetMaturity ?? 'managed';

  return `Você é um vCISO sênior certificado CISSP e ISSMP gerando um Security Program Roadmap estratégico.

CONTEXTO ORGANIZACIONAL:
- Organização: ${ctx.organizationName}
- Setor: ${ctx.sector}
- Maturidade Atual: ${currentMaturity}
- Maturidade Alvo: ${targetMaturity}

Gere um Security Program Roadmap completo em Markdown estruturado, em português brasileiro, com EXATAMENTE estas seções:

# Security Program Roadmap — ${ctx.organizationName}

## Avaliação de Maturidade Atual
[Tabela Markdown com colunas: Domínio | Nível Atual (1-5) | Evidências | Gaps Identificados. Domínios: Governança | Gestão de Risco | Gestão de Ativos | IAM | Segurança de Rede | Detecção e Resposta | Continuidade | Conformidade.]

## Roadmap em 3 Fases

### Fase 1 — Fundação (0-90 dias)
[Lista de iniciativas críticas para estabilizar a base. Para cada: Iniciativa | Objetivo | Recursos | KPI de Conclusão | Responsável. Mínimo 6 iniciativas.]

### Fase 2 — Crescimento (3-6 meses)
[Lista de iniciativas para elevar maturidade de ${currentMaturity} em direção a ${targetMaturity}. Para cada: Iniciativa | Objetivo | Recursos | KPI de Conclusão | Responsável. Mínimo 6 iniciativas.]

### Fase 3 — Otimização (6-12 meses)
[Lista de iniciativas para consolidar e atingir maturidade ${targetMaturity}. Para cada: Iniciativa | Objetivo | Recursos | KPI de Conclusão | Responsável. Mínimo 5 iniciativas.]

## KPIs do Programa
[Tabela Markdown: KPI | Baseline | Meta 90 dias | Meta 6 meses | Meta 12 meses | Frequência de Medição. Mínimo 10 KPIs mensuráveis.]

## Dependências e Riscos de Implementação
[Tabela: Risco de Implementação | Probabilidade | Impacto | Mitigação. Mínimo 6 riscos.]

## Estrutura de Governança Recomendada
[Diagrama em texto (ASCII ou listas): papéis, comitês, frequência de reuniões, escalação. Adequado ao porte da organização no setor ${ctx.sector}.]

REGRAS ABSOLUTAS:
- Todo conteúdo em português brasileiro
- KPIs com métricas SMART (específicos, mensuráveis, atingíveis, relevantes, com prazo)
- Iniciativas priorizadas por impacto de segurança vs esforço
- Tabelas com formatação Markdown correta`;
}

// --- ISO 27001 Audit Checklist -------------------------------------------------

function buildISO27001AuditChecklist(ctx: ArtifactContext): string {
  const auditDate = ctx.additionalContext?.auditDate ?? 'a definir';
  const scope = ctx.additionalContext?.scope ?? `Organização ${ctx.organizationName} — escopo completo`;

  return `Você é um auditor líder certificado ISO 27001 e vCISO sênior gerando um checklist de auditoria ISO 27001.

CONTEXTO ORGANIZACIONAL:
- Organização: ${ctx.organizationName}
- Setor: ${ctx.sector}
- Maturidade de Segurança: ${ctx.maturityLevel}
- Data da Auditoria: ${auditDate}
- Escopo do SGSI: ${scope}

Gere um ISO 27001 Audit Checklist completo em Markdown estruturado, em português brasileiro, cobrindo TODAS AS 14 CLÁUSULAS da norma ISO 27001:2013/2022.

# ISO 27001 Audit Checklist — ${ctx.organizationName}

## Informações da Auditoria
| Campo | Valor |
|-------|-------|
| Organização | ${ctx.organizationName} |
| Setor | ${ctx.sector} |
| Data | ${auditDate} |
| Escopo | ${scope} |
| Maturidade Atual | ${ctx.maturityLevel} |

---

Para CADA UMA das 14 cláusulas abaixo, gere uma tabela com colunas:
**Controle ISO 27001 | Status (Conforme / Não Conforme / Parcial / N/A) | Evidência Necessária | Observações / Gaps**

## Cláusula 5 — Políticas de Segurança da Informação
[Tabela com controles A.5.1.1 e A.5.1.2]

## Cláusula 6 — Organização da Segurança da Informação
[Tabela com controles A.6.1.1 até A.6.2.2]

## Cláusula 7 — Segurança em Recursos Humanos
[Tabela com controles A.7.1.1 até A.7.3.1]

## Cláusula 8 — Gestão de Ativos
[Tabela com controles A.8.1.1 até A.8.3.3]

## Cláusula 9 — Controle de Acesso
[Tabela com controles A.9.1.1 até A.9.4.3]

## Cláusula 10 — Criptografia
[Tabela com controles A.10.1.1 e A.10.1.2]

## Cláusula 11 — Segurança Física e do Ambiente
[Tabela com controles A.11.1.1 até A.11.2.9]

## Cláusula 12 — Segurança nas Operações
[Tabela com controles A.12.1.1 até A.12.7.1]

## Cláusula 13 — Segurança nas Comunicações
[Tabela com controles A.13.1.1 até A.13.2.4]

## Cláusula 14 — Aquisição, Desenvolvimento e Manutenção de Sistemas
[Tabela com controles A.14.1.1 até A.14.3.1]

## Cláusula 15 — Relacionamento com Fornecedores
[Tabela com controles A.15.1.1 até A.15.2.2]

## Cláusula 16 — Gestão de Incidentes de Segurança
[Tabela com controles A.16.1.1 até A.16.1.7]

## Cláusula 17 — Aspectos de Segurança da Informação na Gestão da Continuidade do Negócio
[Tabela com controles A.17.1.1 até A.17.2.1]

## Cláusula 18 — Conformidade
[Tabela com controles A.18.1.1 até A.18.2.3]

## Resumo da Auditoria
[Tabela consolidada: Cláusula | Total de Controles | Conformes | Não Conformes | Parciais | % Conformidade]

## Plano de Ação (Não Conformidades Críticas)
[Lista das 5-10 não conformidades mais críticas com: NC | Ação Corretiva | Prazo | Responsável]

REGRAS ABSOLUTAS:
- Todo conteúdo em português brasileiro
- Status baseado na maturidade ${ctx.maturityLevel} da organização
- Evidências específicas e verificáveis
- Tabelas com formatação Markdown correta
- Focar nos controles mais relevantes para o setor ${ctx.sector}`;
}

// --- LGPD Adequacy Process -----------------------------------------------------

function buildLGPDAdequacyProcess(ctx: ArtifactContext): string {
  const dataTypes = ctx.additionalContext?.dataTypes ?? 'dados pessoais de clientes e colaboradores';
  const processingPurposes = ctx.additionalContext?.processingPurposes ?? 'prestação de serviços e gestão interna';

  return `Você é um especialista em LGPD, DPO certificado e vCISO sênior gerando um Processo de Adequação à LGPD.

CONTEXTO ORGANIZACIONAL:
- Organização: ${ctx.organizationName}
- Setor: ${ctx.sector}
- Maturidade de Segurança: ${ctx.maturityLevel}
- Tipos de Dados Tratados: ${dataTypes}
- Finalidades de Tratamento: ${processingPurposes}

Gere um Processo de Adequação à LGPD completo em Markdown estruturado, em português brasileiro, com EXATAMENTE 10 etapas de adequação.

# Processo de Adequação à LGPD — ${ctx.organizationName}

## Visão Geral do Projeto de Adequação
[Resumo executivo: escopo, objetivos, prazo estimado, estrutura de governança recomendada para ${ctx.organizationName} no setor ${ctx.sector}.]

---

## Etapa 1 — Mapeamento de Dados (Data Mapping / ROPA)
[Descrição da etapa | Atividades específicas | Responsável (DPO/TI/Jurídico) | Prazo sugerido | Entregável | Ferramentas sugeridas]

## Etapa 2 — Identificação das Bases Legais
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Mapear bases legais LGPD: consentimento, legítimo interesse, contrato, obrigação legal, etc. para cada finalidade em ${processingPurposes}]

## Etapa 3 — Avaliação de Riscos de Privacidade (DPIA/PIA)
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Focar em dados: ${dataTypes}]

## Etapa 4 — Revisão e Adequação de Contratos e Políticas
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Política de Privacidade, Termos de Uso, contratos com operadores, DPAs]

## Etapa 5 — Implementação de Controles Técnicos
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Pseudonimização, minimização, criptografia, controle de acesso para ${dataTypes}]

## Etapa 6 — Estruturação do Canal de Titulares (DSR)
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Acesso, correção, eliminação, portabilidade — processo e SLA de 15 dias LGPD]

## Etapa 7 — Treinamento e Conscientização
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Programa de conscientização para colaboradores de ${ctx.organizationName} no setor ${ctx.sector}]

## Etapa 8 — Gestão de Incidentes de Dados Pessoais
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Processo de notificação ANPD em 2 dias úteis, comunicação a titulares]

## Etapa 9 — Designação e Estruturação do DPO
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Papel do DPO, canal de comunicação, interface com ANPD]

## Etapa 10 — Monitoramento Contínuo e Revisão
[Descrição da etapa | Atividades específicas | Responsável | Prazo sugerido | Entregável]
[Auditorias periódicas, atualização do ROPA, KPIs de conformidade LGPD]

---

## Roadmap Consolidado
[Tabela Markdown: Etapa | Prazo | Responsável | Prioridade | Status Inicial]

## KPIs de Adequação LGPD
[Tabela: KPI | Meta | Frequência | Responsável]
[Mínimo 8 KPIs: % dados mapeados, SLA de DSR, % colaboradores treinados, etc.]

## Riscos e Penalidades
[Tabela: Risco de Não Conformidade | Artigo LGPD | Penalidade Máxima | Probabilidade para ${ctx.sector} | Mitigação]

REGRAS ABSOLUTAS:
- Todo conteúdo em português brasileiro
- Referências aos artigos específicos da LGPD (Lei 13.709/2018) quando aplicável
- Prazos realistas para o porte da organização no setor ${ctx.sector}
- Responsáveis: DPO, Jurídico, TI, RH, Alta Direção conforme aplicável
- Tabelas com formatação Markdown correta`;
}

// --- Public API ----------------------------------------------------------------

/**
 * Build a generation prompt for a given artifact type and context.
 * Safe for Edge runtime — no Node-only imports.
 */
export function buildArtifactPrompt(context: ArtifactContext): string {
  switch (context.type) {
    case 'security-posture-report':
      return buildSecurityPostureReport(context);
    case 'budget-proposal-rosi':
      return buildBudgetProposalROSI(context);
    case 'security-program-roadmap':
      return buildSecurityProgramRoadmap(context);
    case 'iso27001-audit-checklist':
      return buildISO27001AuditChecklist(context);
    case 'lgpd-adequacy-process':
      return buildLGPDAdequacyProcess(context);
  }
}
