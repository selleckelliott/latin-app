import { useLiveQuery } from 'dexie-react-hooks';
import { useCallback, useMemo, useState, type ReactNode } from 'react';
import { db } from '../data/db';
import {
  ACTIVE_PROFILE_STORAGE_KEY,
  ActiveProfileContext,
  PARENT_VERIFIED_STORAGE_KEY,
} from './active-profile';

export function ActiveProfileProvider({ children }: { children: ReactNode }) {
  const [activeProfileId, setActiveProfileIdState] = useState<string | null>(() =>
    sessionStorage.getItem(ACTIVE_PROFILE_STORAGE_KEY),
  );
  const [parentVerified, setParentVerifiedState] = useState<boolean>(
    () => sessionStorage.getItem(PARENT_VERIFIED_STORAGE_KEY) === 'true',
  );

  // Tag results with the id they resolve so a stale result from a previous
  // id (useLiveQuery keeps the old value while requerying) reads as loading.
  const lookup = useLiveQuery(
    async () => ({
      id: activeProfileId,
      profile: activeProfileId ? ((await db.profiles.get(activeProfileId)) ?? null) : null,
    }),
    [activeProfileId],
  );
  const activeProfile =
    lookup === undefined || lookup.id !== activeProfileId ? undefined : lookup.profile;

  const setActiveProfileId = useCallback((id: string | null) => {
    if (id) {
      sessionStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, id);
    } else {
      sessionStorage.removeItem(ACTIVE_PROFILE_STORAGE_KEY);
    }
    setActiveProfileIdState(id);
  }, []);

  const setParentVerified = useCallback((verified: boolean) => {
    if (verified) {
      sessionStorage.setItem(PARENT_VERIFIED_STORAGE_KEY, 'true');
    } else {
      sessionStorage.removeItem(PARENT_VERIFIED_STORAGE_KEY);
    }
    setParentVerifiedState(verified);
  }, []);

  const value = useMemo(
    () => ({
      activeProfileId,
      activeProfile,
      parentVerified,
      setActiveProfileId,
      setParentVerified,
    }),
    [activeProfileId, activeProfile, parentVerified, setActiveProfileId, setParentVerified],
  );

  return <ActiveProfileContext.Provider value={value}>{children}</ActiveProfileContext.Provider>;
}
