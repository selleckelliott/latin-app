import { describe, expect, it } from 'vitest';
import { assignmentsCompletedBy, isOverdue, sortDueAssignments } from './assignments';
import type { Assignment } from './types';

function assignment(overrides: Partial<Assignment>): Assignment {
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

const quizAttempt = { profileId: 's1', unitId: 'starter-pack', activity: 'quiz' as const };

describe('assignmentsCompletedBy', () => {
  it('matches open assignments for the same student, unit, and activity', () => {
    const match = assignment({});
    const otherActivity = assignment({ activity: 'vocab' });
    const otherStudent = assignment({ studentId: 's2' });
    const otherUnit = assignment({ unitId: 'unit-2' });
    const alreadyDone = assignment({ status: 'completed' });

    const completed = assignmentsCompletedBy(quizAttempt, [
      match,
      otherActivity,
      otherStudent,
      otherUnit,
      alreadyDone,
    ]);

    expect(completed.map((a) => a.id)).toEqual([match.id]);
  });

  it('completes multiple matching assignments at once', () => {
    const first = assignment({ dueDate: '2026-06-12' });
    const second = assignment({ dueDate: '2026-06-20' });
    const completed = assignmentsCompletedBy(quizAttempt, [first, second]);
    expect(completed).toHaveLength(2);
  });

  it('returns empty for free practice', () => {
    expect(assignmentsCompletedBy(quizAttempt, [])).toEqual([]);
  });
});

describe('sortDueAssignments', () => {
  it('filters to open assignments sorted by due date then assigned time', () => {
    const later = assignment({ dueDate: '2026-06-20' });
    const sooner = assignment({ dueDate: '2026-06-12' });
    const completed = assignment({ dueDate: '2026-06-01', status: 'completed' });
    const sameDayEarlier = assignment({
      dueDate: '2026-06-20',
      assignedAt: '2026-06-09T08:00:00.000Z',
    });

    const sorted = sortDueAssignments([later, sooner, completed, sameDayEarlier]);
    expect(sorted.map((a) => a.id)).toEqual([sooner.id, sameDayEarlier.id, later.id]);
  });
});

describe('isOverdue', () => {
  it('flags open assignments past their due date', () => {
    expect(isOverdue(assignment({ dueDate: '2026-06-10' }), '2026-06-11')).toBe(true);
    expect(isOverdue(assignment({ dueDate: '2026-06-11' }), '2026-06-11')).toBe(false);
    expect(
      isOverdue(assignment({ dueDate: '2026-06-10', status: 'completed' }), '2026-06-11'),
    ).toBe(false);
  });
});
