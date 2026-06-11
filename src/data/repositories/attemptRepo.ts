import type { AttemptRepo } from '../../domain/repositories';
import type { Attempt } from '../../domain/types';
import type { LatinDb } from '../db';

export class DexieAttemptRepo implements AttemptRepo {
  private readonly db: LatinDb;

  constructor(db: LatinDb) {
    this.db = db;
  }

  async add(attempt: Attempt): Promise<void> {
    await this.db.attempts.add(attempt);
  }

  get(id: string): Promise<Attempt | undefined> {
    return this.db.attempts.get(id);
  }

  forStudent(profileId: string): Promise<Attempt[]> {
    return this.db.attempts.where('profileId').equals(profileId).toArray();
  }
}
