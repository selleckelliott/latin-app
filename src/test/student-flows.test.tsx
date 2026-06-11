import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { beforeEach, describe, expect, it } from 'vitest';
import { ACTIVE_PROFILE_STORAGE_KEY } from '../app/active-profile';
import { getUnit } from '../content/loader';
import { db } from '../data/db';
import type { Assignment, Profile } from '../domain/types';
import { renderApp, resetAppState } from './helpers';

const STUDENT_ID = 'student-1';
const UNIT_ID = 'starter-pack';

async function seedActiveStudent() {
  const student: Profile = {
    id: STUDENT_ID,
    name: 'Livia',
    role: 'student',
    avatarEmoji: '🦊',
    createdAt: new Date().toISOString(),
  };
  await db.profiles.add(student);
  sessionStorage.setItem(ACTIVE_PROFILE_STORAGE_KEY, STUDENT_ID);
}

function tomorrow(): string {
  return new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

beforeEach(async () => {
  await resetAppState();
  await seedActiveStudent();
});

describe('assigned quiz flow (acceptance)', () => {
  it('completes an assigned quiz: attempt persisted, results shown, assignment auto-completed, survives reload', async () => {
    const user = userEvent.setup();
    const assignment: Assignment = {
      id: 'a-quiz',
      studentId: STUDENT_ID,
      unitId: UNIT_ID,
      activity: 'quiz',
      dueDate: tomorrow(),
      status: 'assigned',
      assignedAt: new Date().toISOString(),
    };
    await db.assignments.add(assignment);

    const home = renderApp(`/student/${STUDENT_ID}`);

    // Assignment is shown before free practice
    expect(await screen.findByText('Your assignments')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: /Due / }));

    // Answer: water ✓, dog ✓, sun ✓, amat ✗ (correct is amas) → 3/4
    expect(await screen.findByText("What does 'aqua' mean?")).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'water' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'dog' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'sun' }));
    await user.click(screen.getByRole('button', { name: 'Next' }));
    await user.click(await screen.findByRole('button', { name: 'amat' }));
    await user.click(screen.getByRole('button', { name: 'Finish' }));

    // Results read from the recorded attempt
    expect(await screen.findByText('3 out of 4 correct!')).toBeInTheDocument();
    expect(screen.getByText('75%')).toBeInTheDocument();
    expect(screen.getByText('Good job!')).toBeInTheDocument();

    // Attempt persisted with answers; assignment auto-completed
    const attempts = await db.attempts.toArray();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({
      profileId: STUDENT_ID,
      unitId: UNIT_ID,
      activity: 'quiz',
      score: 3,
      total: 4,
      answers: [1, 1, 2, 0],
    });
    const stored = await db.assignments.get('a-quiz');
    expect(stored?.status).toBe('completed');
    expect(stored?.completedAt).toBeTruthy();

    // "Reload": fresh mounts still show the results and the cleared assignment
    home.unmount();
    const results = renderApp(
      `/student/${STUDENT_ID}/unit/${UNIT_ID}/results?attemptId=${attempts[0].id}`,
    );
    expect(await screen.findByText('3 out of 4 correct!')).toBeInTheDocument();
    results.unmount();

    renderApp(`/student/${STUDENT_ID}`);
    expect(await screen.findByText('Free practice')).toBeInTheDocument();
    expect(screen.queryByText('Your assignments')).not.toBeInTheDocument();
  });
});

describe('vocabulary lesson', () => {
  it('requeues practiced cards and scores only first-try knows', async () => {
    const user = userEvent.setup();
    renderApp(`/student/${STUDENT_ID}/unit/${UNIT_ID}/vocab`);

    expect(await screen.findByText('0 of 8 words done')).toBeInTheDocument();
    expect(screen.getByText('puella')).toBeInTheDocument();

    // First card: needs practice → goes to the back of the deck
    await user.click(screen.getByRole('button', { name: 'Flip Card' }));
    expect(screen.getByText('girl')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Practice Again' }));

    // Next card is puer; the deck still has 8 cards to clear
    expect(await screen.findByText('puer')).toBeInTheDocument();
    for (let i = 0; i < 8; i++) {
      await user.click(await screen.findByRole('button', { name: 'Flip Card' }));
      await user.click(screen.getByRole('button', { name: 'I Know It' }));
    }

    // 7 of 8 known first try
    expect(await screen.findByText('7 out of 8 correct!')).toBeInTheDocument();
    expect(screen.getByText('88%')).toBeInTheDocument();

    const attempts = await db.attempts.toArray();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ activity: 'vocab', score: 7, total: 8 });
  });
});

describe('grammar game', () => {
  it('locks answers with immediate feedback and records the attempt', async () => {
    const user = userEvent.setup();
    const unit = getUnit(UNIT_ID)!;
    renderApp(`/student/${STUDENT_ID}/unit/${UNIT_ID}/grammar`);

    expect(await screen.findByText('Grammar Game')).toBeInTheDocument();

    // First item answered wrong, the rest right → 6/7
    for (const item of unit.grammar) {
      const card = screen.getByTestId(`grammar-item-${item.id}`);
      const answer =
        item.id === 'g-ending-puella'
          ? item.options.find((o) => o !== item.correct)!
          : item.correct;
      await user.click(within(card).getByRole('button', { name: answer }));
    }

    expect(await screen.findByText('Score: 6 out of 7')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'See Results' }));

    expect(await screen.findByText('6 out of 7 correct!')).toBeInTheDocument();
    const attempts = await db.attempts.toArray();
    expect(attempts).toHaveLength(1);
    expect(attempts[0]).toMatchObject({ activity: 'grammar', score: 6, total: 7 });
  });
});
