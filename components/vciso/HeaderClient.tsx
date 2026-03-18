'use client';

import { ProfileSelector } from '@/components/vciso/ProfileSelector';
import { useProfile } from '@/hooks/useProfile';

export function HeaderClient() {
  const { profile, setProfile } = useProfile();

  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950 px-6 py-3">
      <div className="flex items-center gap-2">
        <span className="text-lg">🛡️</span>
        <span className="text-sm font-semibold text-zinc-100">vCISO Platform</span>
      </div>
      <ProfileSelector value={profile} onChange={setProfile} />
    </header>
  );
}
