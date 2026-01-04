import { DbService } from './db.service';
import { CacheService } from './cache.service';
import { NoteId, UserId, PermissionLevel } from '../types/note';
import { createError, ErrorCode } from '../utils/errors';
import { CACHE_TTL } from '../utils/cache';

export interface Collaborator {
  user_id: UserId;
  email: string;
  display_name: string | null;
  permission_level: PermissionLevel;
  granted_by: UserId;
  created_at: string;
}

export class AccessService {
  constructor(
    private db: DbService,
    private cache: CacheService
  ) {}

  async grantAccess(
    noteId: NoteId,
    targetUserId: UserId,
    permissionLevel: PermissionLevel,
    grantedBy: UserId
  ): Promise<void> {
    // Verify grantor is owner or admin
    const grantorAccess = await this.checkPermission(noteId, grantedBy);
    if (
      !grantorAccess ||
      (grantorAccess !== 'owner' && grantorAccess !== 'admin')
    ) {
      throw createError(
        ErrorCode.FORBIDDEN,
        'Only owners and admins can grant access',
        403
      );
    }

    // Check if access already exists
    const existing = await this.db.queryOne<{ permission_level: PermissionLevel }>(
      'SELECT permission_level FROM note_access WHERE note_id = ? AND user_id = ?',
      [noteId, targetUserId]
    );

    if (existing) {
      // Update existing access
      await this.db.execute(
        'UPDATE note_access SET permission_level = ?, granted_by = ? WHERE note_id = ? AND user_id = ?',
        [permissionLevel, grantedBy, noteId, targetUserId]
      );
    } else {
      // Create new access
      await this.db.execute(
        'INSERT INTO note_access (note_id, user_id, permission_level, granted_by, created_at) VALUES (?, ?, ?, ?, ?)',
        [noteId, targetUserId, permissionLevel, grantedBy, new Date().toISOString()]
      );
    }

    // Invalidate cache
    await this.cache.invalidateNote(noteId);
    await this.cache.delete(this.cache.accessKey(noteId, targetUserId));
  }

  async revokeAccess(noteId: NoteId, targetUserId: UserId, revokedBy: UserId): Promise<void> {
    // Verify revoker is owner or admin
    const revokerAccess = await this.checkPermission(noteId, revokedBy);
    if (
      !revokerAccess ||
      (revokerAccess !== 'owner' && revokerAccess !== 'admin')
    ) {
      throw createError(
        ErrorCode.FORBIDDEN,
        'Only owners and admins can revoke access',
        403
      );
    }

    await this.db.execute(
      'DELETE FROM note_access WHERE note_id = ? AND user_id = ?',
      [noteId, targetUserId]
    );

    // Invalidate cache
    await this.cache.invalidateNote(noteId);
    await this.cache.delete(this.cache.accessKey(noteId, targetUserId));
  }

  async getNoteCollaborators(noteId: NoteId): Promise<Collaborator[]> {
    const collaborators = await this.db.query<Collaborator>(
      `SELECT 
        na.user_id,
        u.email,
        up.display_name,
        na.permission_level,
        na.granted_by,
        na.created_at
      FROM note_access na
      JOIN users u ON na.user_id = u.id
      LEFT JOIN user_profiles up ON na.user_id = up.user_id
      WHERE na.note_id = ?
      ORDER BY na.created_at`,
      [noteId]
    );

    return collaborators.results || [];
  }

  async checkPermission(
    noteId: NoteId,
    userId: UserId
  ): Promise<PermissionLevel | null> {
    // Check cache
    const cacheKey = this.cache.accessKey(noteId, userId);
    const cached = await this.cache.get<{ permission_level: PermissionLevel }>(
      cacheKey
    );
    if (cached) {
      return cached.permission_level;
    }

    // Check if owner
    const noteOwner = await this.db.queryOne<{ owner_id: string | null }>(
      'SELECT owner_id FROM notes WHERE id = ?',
      [noteId]
    );

    if (noteOwner?.owner_id === userId) {
      const result: PermissionLevel = 'owner';
      await this.cache.set(
        cacheKey,
        { permission_level: result },
        CACHE_TTL.ACCESS_CHECK
      );
      return result;
    }

    // Check shared access
    const access = await this.db.queryOne<{ permission_level: PermissionLevel }>(
      'SELECT permission_level FROM note_access WHERE user_id = ? AND note_id = ?',
      [userId, noteId]
    );

    if (access) {
      await this.cache.set(
        cacheKey,
        { permission_level: access.permission_level },
        CACHE_TTL.ACCESS_CHECK
      );
      return access.permission_level;
    }

    return null;
  }

  async getAccessibleNotes(userId: UserId): Promise<NoteId[]> {
    const notes = await this.db.query<{ id: string }>(
      `SELECT DISTINCT n.id
      FROM notes n
      WHERE n.visibility != 'private'
         OR n.owner_id = ?
         OR n.id IN (SELECT note_id FROM note_access WHERE user_id = ?)
         AND (n.expires_at IS NULL OR n.expires_at > ?)`,
      [userId, userId, new Date().toISOString()]
    );

    return (notes.results || []).map((n) => n.id as NoteId);
  }
}

