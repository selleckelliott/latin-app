import type { Activity } from '../../domain/types';

export interface ActivityMeta {
  emoji: string;
  title: string;
  subtitle: string;
}

export const ACTIVITY_META: Record<Activity, ActivityMeta> = {
  vocab: { emoji: '📚', title: 'Vocabulary', subtitle: 'Learn new words' },
  grammar: { emoji: '🎮', title: 'Grammar Game', subtitle: 'Practice endings' },
  quiz: { emoji: '✏️', title: 'Quiz', subtitle: 'Test your knowledge' },
};
