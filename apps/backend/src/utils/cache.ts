import { NoteId, UserId } from '../types/note';

export type CacheKey = string;

export function generateCacheKey(
  prefix: string,
  ...parts: (string | number)[]
): CacheKey {
  return `${prefix}:${parts.join(':')}`;
}

export function generateNoteCacheKey(noteId: NoteId, version = 1): CacheKey {
  return generateCacheKey('note', noteId, `v${version}`);
}

export function generateProfileCacheKey(userId: UserId, version = 1): CacheKey {
  return generateCacheKey('profile', userId, `v${version}`);
}

export function generateAccessCacheKey(
  noteId: NoteId,
  userId: UserId
): CacheKey {
  return generateCacheKey('access', noteId, userId);
}

export function generateUserNotesCacheKey(
  userId: UserId,
  page: number,
  limit: number
): CacheKey {
  return generateCacheKey('user', 'notes', userId, page, limit);
}

export function generateNotePattern(noteId: NoteId): string {
  return `note:${noteId}:*`;
}

export function generateProfilePattern(userId: UserId): string {
  return `profile:${userId}:*`;
}

export function generateAccessPattern(noteId: NoteId): string {
  return `access:${noteId}:*`;
}

export function generateUserNotesPattern(userId: UserId): string {
  return `user:notes:${userId}:*`;
}

export const CACHE_TTL = {
  PUBLIC_NOTE: 3600, // 1 hour
  PRIVATE_NOTE: 300, // 5 minutes
  PROFILE_PUBLIC: 3600, // 1 hour
  PROFILE_PRIVATE: 300, // 5 minutes
  ACCESS_CHECK: 300, // 5 minutes
  USER_DATA: 900, // 15 minutes
} as const;

