import { DbService } from './db.service';
import { CacheService } from './cache.service';
import { NoteId } from '../types/note';

export class CleanupService {
  constructor(
    private db: DbService,
    private cache: CacheService
  ) {}

  async deleteExpiredNotes(): Promise<number> {
    const now = new Date().toISOString();

    // Get expired notes
    const expiredNotes = await this.db.query<{ id: string }>(
      'SELECT id FROM notes WHERE expires_at IS NOT NULL AND expires_at < ?',
      [now]
    );

    if (!expiredNotes.results || expiredNotes.results.length === 0) {
      return 0;
    }

    const noteIds = expiredNotes.results.map((n) => n.id);

    // Delete expired notes (cascade will handle related records)
    await this.db.execute(
      'DELETE FROM notes WHERE expires_at IS NOT NULL AND expires_at < ?',
      [now]
    );

    // Invalidate cache for deleted notes
    for (const noteId of noteIds) {
      await this.cache.invalidateNote(noteId as NoteId);
    }

    return noteIds.length;
  }

  async invalidateRelatedCache(noteIds: NoteId[]): Promise<void> {
    for (const noteId of noteIds) {
      await this.cache.invalidateNote(noteId);
    }
  }
}

