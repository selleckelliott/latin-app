import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import type { Assignment, Attempt, Profile } from '../domain/types';
import { createDb, type LatinDb } from './db';
import { createRepos, recordAttempt, type Repos } from './index';

let db: LatinDb;
let repos: Repos;

beforeEach(() => {
  db = createDb(`test-${crypto.randomUUID()}`);
  repos = createRepos(db);
});

afterEach(async () => {
  await db.delete();
});

function profile(overrides: Partial<Profile> = {}): Profile {
  return {
    id: crypto.randomUUID(),
    name: 'Livia',
    role: 'student',
    avatarEmoji: '🦊',
    createdAt: '2026-06-01T09:00:00.000Z',
    ...overrides,
  };
}

function attempt(overrides: Partial<Attempt> = {}): Attempt {
  return {
    id: crypto.randomUUID(),
    profileId: 's1',
    unitId: 'starter-pack',
    activity: 'quiz',
    score: 3,
    total: 4,
    completedAt: '2026-06-11T10:00:00.000Z',
    ...overrides,
  };
}

function assignment(overrides: Partial<Assignment> = {}): Assignment {
  return {
    id: crypto.randomUUID(),
    studentId: 's1',
    unitId: 'starter-pack',
    activity: 'quiz',
    dueDate: '2026-06-15',
    status: 'assigned',
    assignedAt: '2026-06-10T08:00:00.000Z',
    ...overrides,
  };
}

describe('DexieProfileRepo', () => {
  it('adds and retrieves profiles by id, role, and in bulk', async () => {
    const student = profile({ name: 'Livia' });
    const parent = profile({ role: 'parent', name: 'Mom', pinHash: 'abc' });
    await repos.profiles.add(student);
    await repos.profiles.add(parent);

    expect(await repos.profiles.get(student.id)).toEqual(student);
    expect((await repos.profiles.all()).length).toBe(2);
    expect((await repos.profiles.students()).map((p) => p.id)).toEqual([student.id]);
    expect((await repos.profiles.parents()).map((p) => p.id)).toEqual([parent.id]);
  });

  it('rejects duplicate ids', async () => {
    const p = profile();
    await repos.profiles.add(p);
    await expect(repos.profiles.add(p)).rejects.toThrow();
  });
});

describe('DexieAttemptRepo', () => {
  it('stores attempts and queries them per student', async () => {
    const mine = attempt({ profileId: 's1', answers: [1, 0, 2, 1] });
    const theirs = attempt({ profileId: 's2' });
    await repos.attempts.add(mine);
    await repos.attempts.add(theirs);

    expect(await repos.attempts.get(mine.id)).toEqual(mine);
    const forS1 = await repos.attempts.forStudent('s1');
    expect(forS1.map((a) => a.id)).toEqual([mine.id]);
  });
});

describe('DexieAssignmentRepo', () => {
  it('stores assignments and filters open ones per student', async () => {
    const open = assignment();
    const done = assignment({ status: 'completed', completedAt: '2026-06-10T12:00:00.000Z' });
    const otherStudent = assignment({ studentId: 's2' });
    await repos.assignments.add(open);
    await repos.assignments.add(done);
    await repos.assignments.add(otherStudent);

    expect((await repos.assignments.forStudent('s1')).length).toBe(2);
    expect((await repos.assignments.openForStudent('s1')).map((a) => a.id)).toEqual([open.id]);
  });

  it('marks assignments completed with a timestamp', async () => {
    const a = assignment();
    await repos.assignments.add(a);
    await repos.assignments.markCompleted(a.id, '2026-06-11T10:00:00.000Z');

    const stored = await repos.assignments.get(a.id);
    expect(stored?.status).toBe('completed');
    expect(stored?.completedAt).toBe('2026-06-11T10:00:00.000Z');
  });
});

describe('recordAttempt', () => {
  it('persists the attempt and auto-completes matching open assignments', async () => {
    const a = assignment({ activity: 'quiz' });
    await repos.assignments.add(a);

    const done = attempt({ activity: 'quiz', completedAt: '2026-06-11T11:00:00.000Z' });
    await recordAttempt(done, db);

    expect(await repos.attempts.get(done.id)).toEqual(done);
    const stored = await repos.assignments.get(a.id);
    expect(stored?.status).toBe('completed');
    expect(stored?.completedAt).toBe('2026-06-11T11:00:00.000Z');
  });

  it('leaves non-matching assignments open', async () => {
    const vocabAssignment = assignment({ activity: 'vocab' });
    const otherStudents = assignment({ studentId: 's2' });
    await repos.assignments.add(vocabAssignment);
    await repos.assignments.add(otherStudents);

    await recordAttempt(attempt({ activity: 'quiz' }), db);

    expect((await repos.assignments.get(vocabAssignment.id))?.status).toBe('assigned');
    expect((await repos.assignments.get(otherStudents.id))?.status).toBe('assigned');
  });

  it('records free practice without touching assignments', async () => {
    const done = attempt();
    await recordAttempt(done, db);
    expect(await repos.attempts.get(done.id)).toEqual(done);
    expect(await repos.assignments.forStudent('s1')).toEqual([]);
  });

  it('rolls back the attempt if assignment completion fails', async () => {
    const a = assignment();
    await repos.assignments.add(a);
    const done = attempt();

    // Sabotage the assignments table within the transaction scope.
    const update = db.assignments.update.bind(db.assignments);
    db.assignments.update = () => {
      throw new Error('boom');
    };
    await expect(recordAttempt(done, db)).rejects.toThrow('boom');
    db.assignments.update = update;

    expect(await repos.attempts.get(done.id)).toBeUndefined();
    expect((await repos.assignments.get(a.id))?.status).toBe('assigned');
  });
});
