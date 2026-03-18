// Canary page — health-check visual (Story 1.1 AC5)
// Will be replaced by SituationInput UI in Story 1.2
export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950">
      <main className="flex flex-col items-center gap-6 text-center px-8">
        <div className="flex items-center gap-3">
          <span className="text-3xl">🛡️</span>
          <h1 className="text-3xl font-semibold tracking-tight text-white">
            vCISO Platform
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-400 animate-pulse" />
          <p className="text-zinc-400 text-sm">Sistema operacional</p>
        </div>
        <p className="text-zinc-600 text-xs font-mono">MVP v0.1</p>
      </main>
    </div>
  );
}
