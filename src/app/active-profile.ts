import { createContext, useContext } from 'react';
import type { Profile } from '../domain/types';

export const ACTIVE_PROFILE_STORAGE_KEY = 'latin-app.activeProfileId';
export const PARENT_VERIFIED_STORAGE_KEY = 'latin-app.parentVerified';

export interface ActiveProfileState {
  /** The selected profile id (survives reloads via sessionStorage). */
  activeProfileId: string | null;
  /**
   * The active profile row: `undefined` while loading, `null` when the id
   * doesn't resolve to a stored profile.
   */
  activeProfile: Profile | null | undefined;
  /** True once the parent PIN has been entered this browser session. */
  parentVerified: boolean;
  setActiveProfileId: (id: string | null) => void;
  setParentVerified: (verified: boolean) => void;
}

export const ActiveProfileContext = createContext<ActiveProfileState | null>(null);

export function useActiveProfile(): ActiveProfileState {
  const state = useContext(ActiveProfileContext);
  if (!state) {
    throw new Error('useActiveProfile must be used within ActiveProfileProvider');
  }
  return state;
}
