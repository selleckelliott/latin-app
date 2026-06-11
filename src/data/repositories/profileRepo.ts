import type { ProfileRepo } from '../../domain/repositories';
import type { Profile } from '../../domain/types';
import type { LatinDb } from '../db';

export class DexieProfileRepo implements ProfileRepo {
  private readonly db: LatinDb;

  constructor(db: LatinDb) {
    this.db = db;
  }

  async add(profile: Profile): Promise<void> {
    await this.db.profiles.add(profile);
  }

  get(id: string): Promise<Profile | undefined> {
    return this.db.profiles.get(id);
  }

  all(): Promise<Profile[]> {
    return this.db.profiles.toArray();
  }

  students(): Promise<Profile[]> {
    return this.db.profiles.where('role').equals('student').toArray();
  }

  parents(): Promise<Profile[]> {
    return this.db.profiles.where('role').equals('parent').toArray();
  }
}
