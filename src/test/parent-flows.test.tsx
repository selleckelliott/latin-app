import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ACTIVE_PROFILE_STORAGE_KEY, PARENT_VERIFIED_STORAGE_KEY } from '../app/active-profile';
import { db } from '../data/db';
import type { Attempt, Profile } from '../domain/types';
import { renderApp, resetAppState } from './helpers';

const STUDENT_ID = 'student-1';
const UNIT_ID = 'starter-pack';

async function seedFamily() {
  const parent: Profile = {
    id: 'parent-1',
    name: 'Mom',
    role: 'parent',
    avatarEmoji: '🧑‍🏫',
    pinHash: 'unused-in-these-tests',
    createdAt: new Date().toISOString(),
  };
  const student: Profile = {
    id: STUDENT_ID,
    name: 'Livia',
    role: 'student',
    avatarEmoji: '🦊',
    createdAt: new Date().toISOString(),
  };
  await db.profiles.bulkAdd([parent, student]);
}

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: crypto.randomUUID(),
    profileId: STUDENT_ID,
    unitId: UNIT_ID,
    activity: 'quiz',
    score: 3,
    total: 4,
    completedAt: new Date().toISOString(),
    ...overrides,
  };
}

beforeEach(async () => {
  await resetAppState();
  await seedFamily();
  sessionStorage.setItem(PARENT_VERIFIED_STORAGE_KEY, 'true');
});

describe('parent dashboard', () => {
  it('lists real students with stats derived from their attempts', async () => {
    await db.attempts.bulkAdd([
      attempt({ activity: 'quiz', score: 3, total: 4 }), // 75%
      attempt({ activity: 'vocab', score: 8, total: 8 }), // 100%
    ]);

    renderApp('/parent');

    const row = (await screen.findByText('Livia')).closest('button')!;
    expect(within(row).getByText('Lessons: 2')).toBeInTheDocument();
    expect(within(row).getByText('88%')).toBeInTheDocument(); // mean of 75 and 100
  });
});

describe('progress view', () => {
  it('shows derived stats and recent attempts for the routed student', async () => {
    await db.attempts.bulkAdd([
      attempt({ activity: 'quiz', score: 3, total: 4, completedAt: '2026-01-10T10:00:00.000Z' }),
      attempt({ activity: 'vocab', score: 8, total: 8, completedAt: '2026-01-11T10:00:00.000Z' }),
    ]);

    renderApp(`/parent/student/${STUDENT_ID}`);

    expect(await screen.findByText("Livia's Progress")).toBeInTheDocument();
    expect(screen.getByText('Lessons')).toBeInTheDocument();
    expect(screen.getByText('2')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();

    const recent = screen.getByText('Recent Lessons').closest('div')!;
    expect(within(recent).getByText('2026-01-11')).toBeInTheDocument();
    expect(within(recent).getByText('100%')).toBeInTheDocument();
    expect(within(recent).getByText('75%')).toBeInTheDocument();
  });
});

describe('assign lesson flow (acceptance)', () => {
  it('persists the assignment and it appears on the student home', async () => {
    const user = userEvent.setup();
    const assignScreen = renderApp('/parent/assign');

    expect(await screen.findByText('Assign Lesson', { selector: 'h1' })).toBeInTheDocument();

    // Student
    await user.click(screen.getByRole('combobox', { name: 'Select Student' }));
    await user.click(await screen.findByRole('option', { name: /Livia/ }));
    // Unit
    await user.click(screen.getByRole('combobox', { name: 'Select Unit' }));
    await user.click(await screen.findByRole('option', { name: /Starter Pack/ }));
    // Activity
    await user.click(screen.getByRole('combobox', { name: 'Select Activity' }));
    await user.click(await screen.findByRole('option', { name: /Quiz/ }));
    // Due date
    const due = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    await user.type(screen.getByLabelText('Due Date'), due);

    await user.click(screen.getByRole('button', { name: 'Assign Lesson' }));
    expect(await screen.findByText('Lesson Assigned!')).toBeInTheDocument();

    const assignments = await db.assignments.toArray();
    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toMatchObject({
      studentId: STUDENT_ID,
      unitId: UNIT_ID,
      activity: 'quiz',
      dueDate: due,
      status: 'assigned',
    });

    // The new assignment shows up on the student's home screen
    assignScreen.unmount();
    sessionStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, STUDENT_ID);
    renderApp(`/student/${STUDENT_ID}`);
    expect(await screen.findByText('Your assignments')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: new RegExp(`Due ${due}`) })).toBeInTheDocument();
  });
});
