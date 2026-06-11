import type { AssignmentRepo } from '../../domain/repositories';
import type { Assignment } from '../../domain/types';
import type { LatinDb } from '../db';

export class DexieAssignmentRepo implements AssignmentRepo {
  private readonly db: LatinDb;

  constructor(db: LatinDb) {
    this.db = db;
  }

  async add(assignment: Assignment): Promise<void> {
    await this.db.assignments.add(assignment);
  }

  get(id: string): Promise<Assignment | undefined> {
    return this.db.assignments.get(id);
  }

  forStudent(studentId: string): Promise<Assignment[]> {
    return this.db.assignments.where('studentId').equals(studentId).toArray();
  }

  async openForStudent(studentId: string): Promise<Assignment[]> {
    const assignments = await this.forStudent(studentId);
    return assignments.filter((a) => a.status === 'assigned');
  }

  async markCompleted(id: string, completedAt: string): Promise<void> {
    await this.db.assignments.update(id, { status: 'completed', completedAt });
  }
}
