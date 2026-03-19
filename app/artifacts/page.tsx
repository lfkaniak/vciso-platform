import { ArtifactList } from '@/components/artifacts/ArtifactList';

export const metadata = {
  title: 'Artefatos Executivos — vCISO Platform',
  description:
    'Gere relatórios e documentos de segurança personalizados com IA para board, reguladores e auditorias.',
};

export default function ArtifactsPage() {
  return (
    <main className="flex min-h-[calc(100vh-57px)] flex-col items-center gap-8 px-6 py-12">
      <div className="flex flex-col items-center gap-2 text-center">
        <h1 className="text-2xl font-semibold text-zinc-100">Artefatos Executivos</h1>
        <p className="text-sm text-zinc-500 max-w-lg">
          Gere documentos de segurança personalizados com IA — prontos para board, reguladores e auditorias.
        </p>
      </div>

      <div className="w-full max-w-4xl">
        <ArtifactList />
      </div>
    </main>
  );
}
