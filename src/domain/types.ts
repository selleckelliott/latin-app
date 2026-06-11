export type Role = 'student' | 'parent';

export type Activity = 'vocab' | 'grammar' | 'quiz';

export const ACTIVITIES: readonly Activity[] = ['vocab', 'grammar', 'quiz'];

export interface Profile {
  id: string;
  name: string;
  role: Role;
  avatarEmoji: string;
  /** Parent profiles only. SHA-256 of the PIN — a child gate, not security. */
  pinHash?: string;
  /** ISO 8601 timestamp. */
  createdAt: string;
}

export interface Attempt {
  id: string;
  profileId: string;
  unitId: string;
  activity: Activity;
  score: number;
  total: number;
  /** Chosen answer indices, quiz only. */
  answers?: number[];
  /** ISO 8601 timestamp. */
  completedAt: string;
}

export type AssignmentStatus = 'assigned' | 'completed';

export interface Assignment {
  id: string;
  studentId: string;
  unitId: string;
  activity: Activity;
  /** YYYY-MM-DD. */
  dueDate: string;
  status: AssignmentStatus;
  /** ISO 8601 timestamp. */
  assignedAt: string;
  /** ISO 8601 timestamp, set when status becomes 'completed'. */
  completedAt?: string;
}
