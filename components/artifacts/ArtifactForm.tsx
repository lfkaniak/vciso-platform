'use client';

import { useState, FormEvent } from 'react';
import type { ArtifactType, ArtifactContext } from '@/types/index';

interface FieldDef {
  key: string;
  label: string;
  placeholder: string;
  required?: boolean;
}

const EXTRA_FIELDS: Record<ArtifactType, FieldDef[]> = {
  'security-posture-report': [
    {
      key: 'riskAppetite',
      label: 'Apetite de Risco',
      placeholder: 'Ex: Conservador, Moderado, Agressivo',
    },
    {
      key: 'keyAssets',
      label: 'Ativos Críticos',
      placeholder: 'Ex: ERP, dados de clientes, sistema de pagamentos',
    },
  ],
  'budget-proposal-rosi': [
    {
      key: 'annualBudget',
      label: 'Orçamento Anual da Empresa',
      placeholder: 'Ex: R$ 50.000.000',
    },
    {
      key: 'currentSpend',
      label: 'Investimento Atual em Segurança',
      placeholder: 'Ex: R$ 500.000 / ano',
    },
  ],
  'security-program-roadmap': [
    {
      key: 'currentMaturity',
      label: 'Maturidade Atual (detalhe)',
      placeholder: 'Ex: Processos ad-hoc, sem documentação formal',
    },
    {
      key: 'targetMaturity',
      label: 'Maturidade Alvo',
      placeholder: 'Ex: managed (processos gerenciados e medidos)',
    },
  ],
  'iso27001-audit-checklist': [
    {
      key: 'auditDate',
      label: 'Data da Auditoria',
      placeholder: 'Ex: 2026-06-15',
    },
    {
      key: 'scope',
      label: 'Escopo do SGSI',
      placeholder: 'Ex: Sistemas de TI da sede — São Paulo',
    },
  ],
  'lgpd-adequacy-process': [
    {
      key: 'dataTypes',
      label: 'Tipos de Dados Pessoais Tratados',
      placeholder: 'Ex: dados de clientes, colaboradores, menores de idade',
    },
    {
      key: 'processingPurposes',
      label: 'Finalidades de Tratamento',
      placeholder: 'Ex: prestação de serviços, marketing, gestão de RH',
    },
  ],
};

const MATURITY_OPTIONS = [
  { value: 'initial', label: 'Inicial — processos ad-hoc, sem controles formais' },
  { value: 'developing', label: 'Em desenvolvimento — controles básicos implantados' },
  { value: 'defined', label: 'Definido — processos documentados e padronizados' },
  { value: 'managed', label: 'Gerenciado — processos medidos e monitorados' },
  { value: 'optimizing', label: 'Otimizando — melhoria contínua e inovação' },
] as const;

interface ArtifactFormProps {
  type: ArtifactType;
  onSubmit: (context: Omit<ArtifactContext, 'type'>) => void;
  isLoading: boolean;
}

export function ArtifactForm({ type, onSubmit, isLoading }: ArtifactFormProps) {
  const [organizationName, setOrganizationName] = useState('');
  const [sector, setSector] = useState('');
  const [maturityLevel, setMaturityLevel] = useState<ArtifactContext['maturityLevel']>('developing');
  const [extraFields, setExtraFields] = useState<Record<string, string>>({});

  const extraFieldDefs = EXTRA_FIELDS[type];

  const handleExtraField = (key: string, value: string) => {
    setExtraFields((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    onSubmit({
      organizationName,
      sector,
      maturityLevel,
      additionalContext: Object.keys(extraFields).length > 0 ? extraFields : undefined,
    });
  };

  const isValid = organizationName.trim().length > 0 && sector.trim().length > 0;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Common fields */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="organizationName" className="text-sm font-medium text-zinc-300">
          Nome da Organização <span className="text-red-400">*</span>
        </label>
        <input
          id="organizationName"
          type="text"
          value={organizationName}
          onChange={(e) => setOrganizationName(e.target.value)}
          placeholder="Ex: Empresa ABC Ltda"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="sector" className="text-sm font-medium text-zinc-300">
          Setor / Indústria <span className="text-red-400">*</span>
        </label>
        <input
          id="sector"
          type="text"
          value={sector}
          onChange={(e) => setSector(e.target.value)}
          placeholder="Ex: Financeiro, Saúde, Varejo, Manufatura"
          required
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="maturityLevel" className="text-sm font-medium text-zinc-300">
          Nível de Maturidade de Segurança <span className="text-red-400">*</span>
        </label>
        <select
          id="maturityLevel"
          value={maturityLevel}
          onChange={(e) => setMaturityLevel(e.target.value as ArtifactContext['maturityLevel'])}
          className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
        >
          {MATURITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {/* Type-specific fields */}
      {extraFieldDefs.map((field) => (
        <div key={field.key} className="flex flex-col gap-1.5">
          <label htmlFor={field.key} className="text-sm font-medium text-zinc-300">
            {field.label}
          </label>
          <input
            id={field.key}
            type="text"
            value={extraFields[field.key] ?? ''}
            onChange={(e) => handleExtraField(field.key, e.target.value)}
            placeholder={field.placeholder}
            className="rounded-lg border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:border-zinc-500 focus:outline-none focus:ring-1 focus:ring-zinc-500"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={!isValid || isLoading}
        className="mt-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isLoading ? 'Gerando artefato...' : 'Gerar Artefato'}
      </button>
    </form>
  );
}
