import type { Assignment, Attempt } from './types';

/**
 * Domain rule: an attempt fulfils every still-open assignment for the same
 * student, unit, and activity. Returns the assignments that the attempt
 * completes (empty when it was free practice).
 */
export function assignmentsCompletedBy(
  attempt: Pick<Attempt, 'profileId' | 'unitId' | 'activity'>,
  assignments: readonly Assignment[],
): Assignment[] {
  return assignments.filter(
    (assignment) =>
      assignment.status === 'assigned' &&
      assignment.studentId === attempt.profileId &&
      assignment.unitId === attempt.unitId &&
      assignment.activity === attempt.activity,
  );
}

/** Open assignments sorted by due date (soonest first), then assigned time. */
export function sortDueAssignments(assignments: readonly Assignment[]): Assignment[] {
  return assignments
    .filter((a) => a.status === 'assigned')
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate) || a.assignedAt.localeCompare(b.assignedAt));
}

/** True when the assignment is still open and due before `today` (YYYY-MM-DD). */
export function isOverdue(assignment: Assignment, today: string): boolean {
  return assignment.status === 'assigned' && assignment.dueDate < today;
}
