'use client';

import type { UserProfile } from '@/types/index';

const PROFILES: { value: UserProfile; label: string }[] = [
  { value: 'executive', label: 'Executivo' },
  { value: 'it-professional', label: 'Profissional TI' },
  { value: 'consultant', label: 'Consultor' },
];

interface ProfileSelectorProps {
  value: UserProfile;
  onChange: (profile: UserProfile) => void;
}

export function ProfileSelector({ value, onChange }: ProfileSelectorProps) {
  return (
    <div
      role="group"
      aria-label="Perfil do usuário"
      className="flex items-center gap-1 rounded-lg border border-zinc-700 bg-zinc-900 p-1"
    >
      {PROFILES.map((p) => (
        <button
          key={p.value}
          type="button"
          aria-pressed={value === p.value}
          onClick={() => onChange(p.value)}
          className={`rounded-md px-3 py-1 text-xs font-medium transition-colors
            ${
              value === p.value
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}
