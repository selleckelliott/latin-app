import { assignmentsCompletedBy } from '../domain/assignments';
import type { Attempt } from '../domain/types';
import { db, type LatinDb } from './db';
import { DexieAssignmentRepo } from './repositories/assignmentRepo';
import { DexieAttemptRepo } from './repositories/attemptRepo';
import { DexieProfileRepo } from './repositories/profileRepo';

export function createRepos(database: LatinDb) {
  return {
    profiles: new DexieProfileRepo(database),
    attempts: new DexieAttemptRepo(database),
    assignments: new DexieAssignmentRepo(database),
  };
}

export type Repos = ReturnType<typeof createRepos>;

/** App-wide repositories bound to the real database. */
export const repos = createRepos(db);

/**
 * Records a completed activity and, per the domain rule, marks every open
 * assignment it fulfils as completed — atomically.
 */
export async function recordAttempt(attempt: Attempt, database: LatinDb = db): Promise<void> {
  await database.transaction('rw', database.attempts, database.assignments, async () => {
    const { attempts, assignments } = createRepos(database);
    await attempts.add(attempt);
    const open = await assignments.openForStudent(attempt.profileId);
    for (const assignment of assignmentsCompletedBy(attempt, open)) {
      await assignments.markCompleted(assignment.id, attempt.completedAt);
    }
  });
}
