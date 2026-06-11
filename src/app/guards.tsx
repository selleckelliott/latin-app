import { Navigate, Outlet, useParams } from 'react-router';
import { useActiveProfile } from './active-profile';
import { ParentGate } from './ParentGate';

/**
 * Student routes require the active profile to be the student in the URL.
 * Keeps one child from wandering into a sibling's lessons (or a parent's
 * area) by editing the address bar.
 */
export function StudentGuard() {
  const { sid } = useParams<{ sid: string }>();
  const { activeProfileId, activeProfile } = useActiveProfile();

  if (!activeProfileId || activeProfileId !== sid) {
    return <Navigate to="/" replace />;
  }
  if (activeProfile === undefined) {
    return null; // still loading from IndexedDB
  }
  if (activeProfile === null || activeProfile.role !== 'student') {
    return <Navigate to="/" replace />;
  }
  return <Outlet />;
}

/** Parent routes sit behind the PIN child gate. */
export function ParentGuard() {
  const { parentVerified } = useActiveProfile();

  if (!parentVerified) {
    return <ParentGate />;
  }
  return <Outlet />;
}
