import Dexie, { type EntityTable } from 'dexie';
import type { Assignment, Attempt, Profile } from '../domain/types';

export type LatinDb = Dexie & {
  profiles: EntityTable<Profile, 'id'>;
  attempts: EntityTable<Attempt, 'id'>;
  assignments: EntityTable<Assignment, 'id'>;
};

export function createDb(name = 'latin-app'): LatinDb {
  const db = new Dexie(name) as LatinDb;
  db.version(1).stores({
    profiles: 'id, role',
    attempts: 'id, profileId, unitId, completedAt',
    assignments: 'id, studentId, status, dueDate',
  });
  return db;
}

/** The app-wide database instance. Tests create their own via createDb(). */
export const db = createDb();
