import { KVNamespace } from '@cloudflare/workers-types';
import {
  generateNoteCacheKey,
  generateProfileCacheKey,
  generateAccessCacheKey,
  generateUserNotesCacheKey,
  generateNotePattern,
  generateProfilePattern,
  generateAccessPattern,
  generateUserNotesPattern,
  CACHE_TTL,
  CacheKey,
} from '../utils/cache';
import { NoteId, UserId } from '../types/note';

export class CacheService {
  constructor(private kv?: KVNamespace) {}

  async get<T>(key: CacheKey): Promise<T | null> {
    if (!this.kv) return null;
    try {
      const value = await this.kv.get(key, 'json');
      return value as T | null;
    } catch {
      return null;
    }
  }

  async set<T>(
    key: CacheKey,
    value: T,
    ttl: number = CACHE_TTL.USER_DATA
  ): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.put(key, JSON.stringify(value), {
        expirationTtl: ttl,
      });
    } catch {
      // Silently fail cache writes
    }
  }

  async delete(key: CacheKey): Promise<void> {
    if (!this.kv) return;
    try {
      await this.kv.delete(key);
    } catch {
      // Silently fail cache deletes
    }
  }

  async invalidatePattern(pattern: string): Promise<void> {
    if (!this.kv) return;
    // KV doesn't support pattern deletion, so we'll need to track keys
    // For now, we'll implement a simple version that deletes known patterns
    // In production, you might want to use a list of keys stored separately
  }

  async invalidateNote(noteId: NoteId): Promise<void> {
    const pattern = generateNotePattern(noteId);
    await this.invalidatePattern(pattern);
    // Also invalidate access patterns
    const accessPattern = generateAccessPattern(noteId);
    await this.invalidatePattern(accessPattern);
  }

  async invalidateUser(userId: UserId): Promise<void> {
    const profilePattern = generateProfilePattern(userId);
    await this.invalidatePattern(profilePattern);
    const notesPattern = generateUserNotesPattern(userId);
    await this.invalidatePattern(notesPattern);
  }

  generateETag(data: unknown): string {
    const str = JSON.stringify(data);
    // Simple hash function for ETag
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return `"${Math.abs(hash).toString(16)}"`;
  }

  // Cache key generators
  noteKey = generateNoteCacheKey;
  profileKey = generateProfileCacheKey;
  accessKey = generateAccessCacheKey;
  userNotesKey = generateUserNotesCacheKey;
}

