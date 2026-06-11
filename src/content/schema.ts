import { z } from 'zod';

export const vocabCardSchema = z.object({
  id: z.string().min(1),
  latin: z.string().min(1),
  meaning: z.string().min(1),
  emoji: z.string().min(1),
});

export const grammarItemSchema = z
  .object({
    id: z.string().min(1),
    word: z.string().min(1),
    options: z.array(z.string().min(1)).min(2),
    correct: z.string().min(1),
  })
  .refine((item) => item.options.includes(item.correct), {
    message: 'correct must be one of options',
    path: ['correct'],
  });

export const quizQuestionSchema = z
  .object({
    id: z.string().min(1),
    prompt: z.string().min(1),
    emoji: z.string().min(1),
    choices: z.array(z.string().min(1)).min(2),
    answerIndex: z.number().int().nonnegative(),
  })
  .refine((q) => q.answerIndex < q.choices.length, {
    message: 'answerIndex must point at one of choices',
    path: ['answerIndex'],
  });

export const unitSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  order: z.number().int(),
  vocab: z.array(vocabCardSchema).min(1),
  grammar: z.array(grammarItemSchema).min(1),
  quiz: z.array(quizQuestionSchema).min(1),
});

export type VocabCard = z.infer<typeof vocabCardSchema>;
export type GrammarItem = z.infer<typeof grammarItemSchema>;
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;
export type Unit = z.infer<typeof unitSchema>;
