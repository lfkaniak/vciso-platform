import { TenthManBlock } from '@/components/vciso/TenthManBlock';
import { PlaybookTimeline } from '@/components/playbooks/PlaybookTimeline';
import type { PlaybookAction } from '@/types/index';
import actionsData from '@/content/playbooks/data-breach.json';
import Link from 'next/link';

export const metadata = {
  title: 'Playbook Data Breach | vCISO Platform',
  description: 'Guia de resposta a vazamento de dados com ações sequenciais por fase de tempo.',
};

const TENTH_MAN_STATE = {
  isStreaming: false,
  isComplete: true,
  content:
    'Antes de executar este playbook, o 10º Homem questiona: **E se a notificação imediata comprometer a investigação forense?** Notificar prematuramente pode alertar o atacante, destruir evidências e dificultar a atribuição. Considere: já coletou evidências suficientes? A notificação precipitada pode gerar mais danos reputacionais do que o próprio incidente? Existe uma janela segura para investigar antes de notificar?',
};

export default function DataBreachPage() {
  const actions = actionsData as PlaybookAction[];

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6 flex items-center gap-2 text-sm text-zinc-500">
        <Link href="/" className="hover:text-zinc-300">Home</Link>
        <span aria-hidden="true">/</span>
        <Link href="/situations" className="hover:text-zinc-300">Situações</Link>
        <span aria-hidden="true">/</span>
        <span className="text-zinc-300" aria-current="page">Playbook Data Breach</span>
      </nav>

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl" aria-hidden="true">🔓</span>
          <div>
            <h1 className="text-2xl font-semibold text-zinc-100">Resposta a Vazamento de Dados</h1>
            <p className="text-sm text-zinc-500">S02 · {actions.length} ações em 3 fases</p>
          </div>
        </div>
      </div>

      {/* AC5 — 10th Man Block estático */}
      <div className="mb-8">
        <TenthManBlock state={TENTH_MAN_STATE} defaultExpanded={true} />
      </div>

      {/* Timeline */}
      <PlaybookTimeline type="data-breach" actions={actions} />
    </main>
  );
}
