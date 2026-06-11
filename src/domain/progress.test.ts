import { describe, expect, it } from 'vitest';
import { deriveProgress } from './progress';
import type { Attempt } from './types';

function attempt(overrides: Partial<Attempt>): Attempt {
  return {
    id: crypto.randomUUID(),
    profileId: 's1',
    unitId: 'starter-pack',
    activity: 'quiz',
    score: 3,
    total: 4,
    completedAt: '2026-06-01T10:00:00.000Z',
    ...overrides,
  };
}

describe('deriveProgress', () => {
  it('returns zeroed stats with no attempts', () => {
    const stats = deriveProgress([]);
    expect(stats.lessonsCompleted).toBe(0);
    expect(stats.averageScorePct).toBe(0);
    expect(stats.recentAttempts).toEqual([]);
    expect(stats.byActivity.vocab).toEqual({ count: 0, averageScorePct: 0 });
    expect(stats.byActivity.grammar).toEqual({ count: 0, averageScorePct: 0 });
    expect(stats.byActivity.quiz).toEqual({ count: 0, averageScorePct: 0 });
  });

  it('counts every attempt as a completed lesson and averages percentages', () => {
    const stats = deriveProgress([
      attempt({ score: 4, total: 4 }), // 100
      attempt({ score: 2, total: 4 }), // 50
    ]);
    expect(stats.lessonsCompleted).toBe(2);
    expect(stats.averageScorePct).toBe(75);
  });

  it('breaks stats down by activity', () => {
    const stats = deriveProgress([
      attempt({ activity: 'vocab', score: 8, total: 8 }), // 100
      attempt({ activity: 'quiz', score: 1, total: 4 }), // 25
      attempt({ activity: 'quiz', score: 3, total: 4 }), // 75
    ]);
    expect(stats.byActivity.vocab).toEqual({ count: 1, averageScorePct: 100 });
    expect(stats.byActivity.quiz).toEqual({ count: 2, averageScorePct: 50 });
    expect(stats.byActivity.grammar).toEqual({ count: 0, averageScorePct: 0 });
  });

  it('lists recent attempts newest first, limited', () => {
    const a1 = attempt({ completedAt: '2026-06-01T10:00:00.000Z' });
    const a2 = attempt({ completedAt: '2026-06-03T10:00:00.000Z' });
    const a3 = attempt({ completedAt: '2026-06-02T10:00:00.000Z' });
    const stats = deriveProgress([a1, a2, a3], 2);
    expect(stats.recentAttempts.map((a) => a.id)).toEqual([a2.id, a3.id]);
  });

  it('does not mutate the input', () => {
    const list = [
      attempt({ completedAt: '2026-06-02T10:00:00.000Z' }),
      attempt({ completedAt: '2026-06-01T10:00:00.000Z' }),
    ];
    const copy = [...list];
    deriveProgress(list);
    expect(list).toEqual(copy);
  });
});
