'use client';

import { useSyncExternalStore, useCallback } from 'react';
import type { UserProfile } from '@/types/index';

const STORAGE_KEY = 'vciso_profile';
const DEFAULT_PROFILE: UserProfile = 'it-professional';

function subscribe(callback: () => void) {
  window.addEventListener('storage', callback);
  return () => window.removeEventListener('storage', callback);
}

function getSnapshot(): UserProfile {
  try {
    return (localStorage.getItem(STORAGE_KEY) as UserProfile) ?? DEFAULT_PROFILE;
  } catch {
    return DEFAULT_PROFILE;
  }
}

// SSR fallback — always returns default on the server
function getServerSnapshot(): UserProfile {
  return DEFAULT_PROFILE;
}

export function useProfile() {
  const profile = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setProfile = useCallback((newProfile: UserProfile) => {
    try {
      localStorage.setItem(STORAGE_KEY, newProfile);
      // Notify other hooks/tabs
      window.dispatchEvent(new StorageEvent('storage', { key: STORAGE_KEY, newValue: newProfile }));
    } catch {
      // localStorage unavailable — state update handled by useSyncExternalStore
    }
  }, []);

  return { profile, setProfile };
}
