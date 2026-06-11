import { describe, expect, it } from 'vitest';
import type { GrammarItem, QuizQuestion } from '../content/schema';
import { percentage, scoreGrammar, scoreQuiz } from './scoring';

const questions: QuizQuestion[] = [
  { id: 'q1', prompt: 'aqua?', emoji: '💧', choices: ['fire', 'water'], answerIndex: 1 },
  { id: 'q2', prompt: 'canis?', emoji: '🐶', choices: ['cat', 'dog'], answerIndex: 1 },
  { id: 'q3', prompt: 'sol?', emoji: '☀️', choices: ['moon', 'sun'], answerIndex: 1 },
];

const grammarItems: GrammarItem[] = [
  { id: 'g1', word: 'puella', options: ['-a', '-us', '-um'], correct: '-a' },
  { id: 'g2', word: 'puer', options: ['-a', '-us', '-um'], correct: '-us' },
];

describe('scoreQuiz', () => {
  it('counts correct answers', () => {
    expect(scoreQuiz(questions, [1, 1, 1])).toEqual({ score: 3, total: 3 });
    expect(scoreQuiz(questions, [1, 0, 1])).toEqual({ score: 2, total: 3 });
    expect(scoreQuiz(questions, [0, 0, 0])).toEqual({ score: 0, total: 3 });
  });

  it('treats missing answers as wrong', () => {
    expect(scoreQuiz(questions, [1])).toEqual({ score: 1, total: 3 });
    expect(scoreQuiz(questions, [])).toEqual({ score: 0, total: 3 });
  });

  it('treats out-of-range answers as wrong', () => {
    expect(scoreQuiz(questions, [9, -1, 1])).toEqual({ score: 1, total: 3 });
  });

  it('handles an empty question list', () => {
    expect(scoreQuiz([], [])).toEqual({ score: 0, total: 0 });
  });
});

describe('scoreGrammar', () => {
  it('counts matching selections', () => {
    expect(scoreGrammar(grammarItems, ['-a', '-us'])).toEqual({ score: 2, total: 2 });
    expect(scoreGrammar(grammarItems, ['-um', '-us'])).toEqual({ score: 1, total: 2 });
  });

  it('treats missing selections as wrong', () => {
    expect(scoreGrammar(grammarItems, [undefined, '-us'])).toEqual({ score: 1, total: 2 });
    expect(scoreGrammar(grammarItems, [])).toEqual({ score: 0, total: 2 });
  });
});

describe('percentage', () => {
  it('rounds to whole percent', () => {
    expect(percentage(2, 3)).toBe(67);
    expect(percentage(1, 3)).toBe(33);
    expect(percentage(3, 3)).toBe(100);
    expect(percentage(0, 3)).toBe(0);
  });

  it('returns 0 for zero or negative totals', () => {
    expect(percentage(0, 0)).toBe(0);
    expect(percentage(5, -1)).toBe(0);
  });
});
