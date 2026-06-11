import type { Assignment, Attempt, Profile } from './types';

/**
 * Persistence seams. Interfaces live in the domain so features depend on
 * abstractions; Dexie implementations live in src/data/repositories.
 */

export interface ProfileRepo {
  add(profile: Profile): Promise<void>;
  get(id: string): Promise<Profile | undefined>;
  all(): Promise<Profile[]>;
  students(): Promise<Profile[]>;
  parents(): Promise<Profile[]>;
}

export interface AttemptRepo {
  add(attempt: Attempt): Promise<void>;
  get(id: string): Promise<Attempt | undefined>;
  forStudent(profileId: string): Promise<Attempt[]>;
}

export interface AssignmentRepo {
  add(assignment: Assignment): Promise<void>;
  get(id: string): Promise<Assignment | undefined>;
  forStudent(studentId: string): Promise<Assignment[]>;
  openForStudent(studentId: string): Promise<Assignment[]>;
  markCompleted(id: string, completedAt: string): Promise<void>;
}
