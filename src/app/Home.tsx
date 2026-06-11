import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../data/db';
import { Onboarding } from '../features/profiles/Onboarding';
import { ProfilePicker } from '../features/profiles/ProfilePicker';

/** First run shows onboarding; afterwards the profile picker. */
export function Home() {
  const profiles = useLiveQuery(() => db.profiles.toArray(), []);

  if (profiles === undefined) {
    return null; // loading from IndexedDB
  }
  if (profiles.length === 0) {
    return <Onboarding />;
  }
  return <ProfilePicker profiles={profiles} />;
}
