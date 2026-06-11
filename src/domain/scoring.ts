import type { GrammarItem, QuizQuestion } from '../content/schema';

export interface Score {
  score: number;
  total: number;
}

/**
 * Scores a completed quiz. `answers` holds the chosen choice index per
 * question (aligned by position); missing/out-of-range answers count wrong.
 */
export function scoreQuiz(questions: readonly QuizQuestion[], answers: readonly number[]): Score {
  let score = 0;
  questions.forEach((question, i) => {
    if (answers[i] === question.answerIndex) {
      score += 1;
    }
  });
  return { score, total: questions.length };
}

/**
 * Scores the grammar game. `selected` holds the chosen option string per
 * item (aligned by position); missing answers count wrong.
 */
export function scoreGrammar(
  items: readonly GrammarItem[],
  selected: readonly (string | undefined)[],
): Score {
  let score = 0;
  items.forEach((item, i) => {
    if (selected[i] === item.correct) {
      score += 1;
    }
  });
  return { score, total: items.length };
}

/** Integer percentage (0–100); 0 when total is 0. */
export function percentage(score: number, total: number): number {
  if (total <= 0) {
    return 0;
  }
  return Math.round((score / total) * 100);
}
