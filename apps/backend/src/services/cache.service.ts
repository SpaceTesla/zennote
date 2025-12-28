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

  private trackingKey(pattern: string): string {
    return `_tracking:${pattern}`;
  }

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

  async getList<T>(key: CacheKey): Promise<T | null> {
    return this.get<T>(key);
  }

  async setList<T>(
    key: CacheKey,
    value: T,
    ttl: number,
    pattern: string
  ): Promise<void> {
    await this.set(key, value, ttl);
    await this.trackKey(pattern, key);
  }

  private async trackKey(pattern: string, key: CacheKey): Promise<void> {
    if (!this.kv) return;
    const trackingKey = this.trackingKey(pattern);
    try {
      const existing = (await this.kv.get(trackingKey, 'json')) as
        | CacheKey[]
        | null;
      const keys = existing || [];
      if (!keys.includes(key)) {
        keys.push(key);
        await this.kv.put(trackingKey, JSON.stringify(keys), {
          expirationTtl: 24 * 60 * 60, // keep tracking for a day
        });
      }
    } catch {
      // ignore tracking failures
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
    const trackingKey = this.trackingKey(pattern);
    try {
      const keys = (await this.kv.get(trackingKey, 'json')) as
        | CacheKey[]
        | null;
      if (keys && keys.length > 0) {
        await Promise.all([
          ...keys.map((k) => this.kv!.delete(k)),
          this.kv.delete(trackingKey),
        ]);
      }
    } catch {
      // ignore invalidation failures
    }
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

