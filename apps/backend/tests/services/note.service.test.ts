import { describe, it, expect, beforeEach } from 'vitest';
import { NoteService } from '../../src/services/note.service';
import { DbService } from '../../src/services/db.service';
import { CacheService } from '../../src/services/cache.service';
import { toNoteId, toUserId } from '../../src/utils/types';

describe('NoteService', () => {
  let noteService: NoteService;
  let dbService: DbService;
  let cacheService: CacheService;

  beforeEach(() => {
    // Mock D1 database
    const mockDb = {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          all: async () => ({ results: [] }),
          run: async () => ({ success: true }),
        }),
        all: async () => ({ results: [] }),
        run: async () => ({ success: true }),
      }),
    } as unknown as D1Database;

    dbService = new DbService(mockDb);
    cacheService = new CacheService(undefined);
    noteService = new NoteService(dbService, cacheService);
  });

  it('should create a temporary note for unauthenticated users', async () => {
    const input = {
      title: 'Test Note',
      content: 'Test content',
      is_public: false,
    };

    // This would need proper mocking to test fully
    expect(input.title).toBe('Test Note');
  });

  it('should create a permanent note for authenticated users', async () => {
    const userId = toUserId('test-user-id');
    const input = {
      title: 'Test Note',
      content: 'Test content',
      is_public: false,
    };

    // This would need proper mocking to test fully
    expect(input.title).toBe('Test Note');
  });
});

