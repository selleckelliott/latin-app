import { percentage } from './scoring';
import type { Activity, Attempt } from './types';
import { ACTIVITIES } from './types';

export interface ActivityStats {
  count: number;
  averageScorePct: number;
}

export interface ProgressStats {
  /** Number of completed activities (every attempt counts). */
  lessonsCompleted: number;
  /** Mean of per-attempt percentages, rounded; 0 with no attempts. */
  averageScorePct: number;
  byActivity: Record<Activity, ActivityStats>;
  /** Most recent attempts, newest first. */
  recentAttempts: Attempt[];
}

/**
 * Derives progress stats from attempts. Stats are always computed from the
 * attempt log — never stored — so they can't drift.
 */
export function deriveProgress(attempts: readonly Attempt[], recentLimit = 5): ProgressStats {
  const lessonsCompleted = attempts.length;
  const averageScorePct = averagePct(attempts);

  const byActivity = Object.fromEntries(
    ACTIVITIES.map((activity) => {
      const subset = attempts.filter((a) => a.activity === activity);
      return [activity, { count: subset.length, averageScorePct: averagePct(subset) }];
    }),
  ) as Record<Activity, ActivityStats>;

  const recentAttempts = [...attempts]
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
    .slice(0, recentLimit);

  return { lessonsCompleted, averageScorePct, byActivity, recentAttempts };
}

function averagePct(attempts: readonly Attempt[]): number {
  if (attempts.length === 0) {
    return 0;
  }
  const sum = attempts.reduce((acc, a) => acc + percentage(a.score, a.total), 0);
  return Math.round(sum / attempts.length);
}
