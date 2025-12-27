import { DbService } from './db.service';
import { CacheService } from './cache.service';
import {
  Note,
  NoteId,
  UserId,
  CreateNoteInput,
  UpdateNoteInput,
  PermissionLevel,
  NoteWithAccess,
} from '../types/note';
import { generateUUID } from '../utils/uuid';
import { toNoteId, toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';
import { CACHE_TTL } from '../utils/cache';

export class NoteService {
  constructor(
    private db: DbService,
    private cache: CacheService
  ) {}

  async getAllNotes(
    userId: UserId | null,
    page: number = 1,
    limit: number = 20,
    search?: string,
    sortBy: string = 'created_at',
    sortOrder: 'ASC' | 'DESC' = 'DESC',
    filterByUserId?: UserId
  ): Promise<{ notes: NoteWithAccess[]; total: number }> {
    const offset = (page - 1) * limit;
    const now = new Date().toISOString();

    let whereClause = 'WHERE (expires_at IS NULL OR expires_at > ?)';
    const params: unknown[] = [now];

    if (search) {
      whereClause += ' AND (title LIKE ? OR content LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm);
    }

    // If filtering by a specific user ID (for profile pages)
    if (filterByUserId) {
      if (filterByUserId === userId) {
        // Viewing own profile: show all notes (public + private)
        whereClause += ` AND id IN (SELECT note_id FROM user_notes WHERE user_id = ?)`;
        params.push(filterByUserId);
      } else {
        // Viewing another user's profile: show only their public notes
        whereClause += ` AND is_public = 1 AND id IN (SELECT note_id FROM user_notes WHERE user_id = ?)`;
        params.push(filterByUserId);
      }
    } else if (userId) {
      // If user is authenticated, show their notes and public notes
      whereClause += ` AND (
        is_public = 1 OR 
        id IN (SELECT note_id FROM user_notes WHERE user_id = ?) OR
        id IN (SELECT note_id FROM note_access WHERE user_id = ?)
      )`;
      params.push(userId, userId);
    } else {
      // Unauthenticated users only see public notes
      whereClause += ' AND is_public = 1';
    }

    const orderClause = `ORDER BY ${sortBy} ${sortOrder}`;
    const limitClause = 'LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const notes = await this.db.query<Note>(
      `SELECT * FROM notes ${whereClause} ${orderClause} ${limitClause}`,
      params
    );

    const totalResult = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM notes ${whereClause}`,
      params.slice(0, -2) // Remove limit and offset
    );
    const total = totalResult.results?.[0]?.count || 0;

    // Enrich with access information
    const notesWithAccess = await Promise.all(
      (notes.results || []).map(async (note) => {
        const access = userId
          ? await this.checkNoteAccess(toNoteId(note.id), userId)
          : null;
        return {
          ...note,
          user_permission: access?.permission_level,
        } as NoteWithAccess;
      })
    );

    return { notes: notesWithAccess, total };
  }

  async getNoteById(noteId: NoteId, userId: UserId | null): Promise<NoteWithAccess | null> {
    // Check cache first
    const cacheKey = this.cache.noteKey(noteId);
    const cached = await this.cache.get<NoteWithAccess>(cacheKey);
    if (cached) {
      // Check if expired
      if (cached.expires_at && new Date(cached.expires_at) < new Date()) {
        await this.cache.delete(cacheKey);
        return null;
      }
      // Verify access
      const hasAccess = userId ? await this.checkNoteAccess(noteId, userId) : null;
      if (hasAccess || cached.is_public) {
        return { ...cached, user_permission: hasAccess?.permission_level };
      }
      // If cached note is private and user doesn't have access, don't return it
      if (!cached.is_public && !hasAccess) {
        throw createError(
          ErrorCode.FORBIDDEN,
          'You do not have access to this note',
          403
        );
      }
    }

    const note = await this.db.queryOne<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [noteId]
    );

    if (!note) {
      return null;
    }

    // Check if expired
    if (note.expires_at && new Date(note.expires_at) < new Date()) {
      return null;
    }

    // Check access
    const access = userId ? await this.checkNoteAccess(noteId, userId) : null;
    if (!access && !note.is_public) {
      throw createError(
        ErrorCode.FORBIDDEN,
        'You do not have access to this note',
        403
      );
    }

    const noteWithAccess: NoteWithAccess = {
      ...note,
      user_permission: access?.permission_level,
    };

    // Cache the note
    const ttl = note.is_public ? CACHE_TTL.PUBLIC_NOTE : CACHE_TTL.PRIVATE_NOTE;
    await this.cache.set(cacheKey, noteWithAccess, ttl);

    return noteWithAccess;
  }

  async createNote(
    input: CreateNoteInput,
    userId: UserId | null
  ): Promise<Note> {
    const noteId = toNoteId(generateUUID());
    const now = new Date().toISOString();
    const expiresAt = userId
      ? null
      : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(); // 7 days for unauthenticated

    await this.db.execute(
      'INSERT INTO notes (id, title, content, is_public, is_permanent, expires_at, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        noteId,
        input.title,
        input.content,
        input.is_public ? 1 : 0,
        userId ? 1 : 0,
        expiresAt,
        now,
        now,
      ]
    );

    // If user is authenticated, create ownership record
    if (userId) {
      await this.db.execute(
        'INSERT INTO user_notes (user_id, note_id, is_owner) VALUES (?, ?, ?)',
        [userId, noteId, 1]
      );
    }

    const note = await this.db.queryOne<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [noteId]
    );

    if (!note) {
      throw createError(ErrorCode.INTERNAL_ERROR, 'Failed to create note', 500);
    }

    // Invalidate cache
    await this.cache.invalidateNote(noteId);
    if (userId) {
      await this.cache.invalidateUser(userId);
    }

    return note;
  }

  async updateNote(
    noteId: NoteId,
    input: UpdateNoteInput,
    userId: UserId
  ): Promise<Note> {
    // Check permission
    const access = await this.checkNoteAccess(noteId, userId);
    if (!access || (access.permission_level !== 'owner' && access.permission_level !== 'write' && access.permission_level !== 'admin')) {
      throw createError(
        ErrorCode.FORBIDDEN,
        'You do not have permission to update this note',
        403
      );
    }

    const updates: string[] = [];
    const params: unknown[] = [];

    if (input.title !== undefined) {
      updates.push('title = ?');
      params.push(input.title);
    }
    if (input.content !== undefined) {
      updates.push('content = ?');
      params.push(input.content);
    }
    if (input.is_public !== undefined) {
      updates.push('is_public = ?');
      params.push(input.is_public ? 1 : 0);
    }

    if (updates.length === 0) {
      const note = await this.db.queryOne<Note>(
        'SELECT * FROM notes WHERE id = ?',
        [noteId]
      );
      if (!note) {
        throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
      }
      return note;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(noteId);

    await this.db.execute(
      `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const note = await this.db.queryOne<Note>(
      'SELECT * FROM notes WHERE id = ?',
      [noteId]
    );

    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    // Invalidate cache
    await this.cache.invalidateNote(noteId);

    return note;
  }

  async deleteNote(noteId: NoteId, userId: UserId): Promise<void> {
    // Check permission (owner or admin only)
    const access = await this.checkNoteAccess(noteId, userId);
    if (!access || (access.permission_level !== 'owner' && access.permission_level !== 'admin')) {
      throw createError(
        ErrorCode.FORBIDDEN,
        'You do not have permission to delete this note',
        403
      );
    }

    await this.db.execute('DELETE FROM notes WHERE id = ?', [noteId]);

    // Invalidate cache
    await this.cache.invalidateNote(noteId);
  }

  async checkNoteAccess(
    noteId: NoteId,
    userId: UserId | null
  ): Promise<{ permission_level: PermissionLevel } | null> {
    if (!userId) return null;

    // Check cache
    const cacheKey = this.cache.accessKey(noteId, userId);
    const cached = await this.cache.get<{ permission_level: PermissionLevel }>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    // Check if owner
    const owner = await this.db.queryOne<{ is_owner: number }>(
      'SELECT is_owner FROM user_notes WHERE user_id = ? AND note_id = ?',
      [userId, noteId]
    );

    if (owner && owner.is_owner === 1) {
      const result = { permission_level: 'owner' as PermissionLevel };
      await this.cache.set(cacheKey, result, CACHE_TTL.ACCESS_CHECK);
      return result;
    }

    // Check shared access
    const access = await this.db.queryOne<{ permission_level: PermissionLevel }>(
      'SELECT permission_level FROM note_access WHERE user_id = ? AND note_id = ?',
      [userId, noteId]
    );

    if (access) {
      await this.cache.set(cacheKey, access, CACHE_TTL.ACCESS_CHECK);
      return access;
    }

    return null;
  }
}

