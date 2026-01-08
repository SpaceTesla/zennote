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
  Visibility,
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

    // Validate sortBy to prevent SQL injection
    const allowedSortBy = ['created_at', 'updated_at', 'title'];
    const validSortBy = allowedSortBy.includes(sortBy) ? sortBy : 'created_at';

    let whereClause = 'WHERE (n.expires_at IS NULL OR n.expires_at > ?)';
    const params: unknown[] = [now];

    if (search) {
      whereClause += ' AND (n.title LIKE ? OR n.content LIKE ? OR n.slug LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    if (filterByUserId) {
      if (filterByUserId === userId) {
        whereClause += ' AND n.owner_id = ?';
        params.push(filterByUserId);
      } else {
        whereClause += ' AND n.owner_id = ? AND n.visibility != "private"';
        params.push(filterByUserId);
      }
    } else if (userId) {
      whereClause +=
        ' AND (n.visibility != "private" OR n.owner_id = ? OR n.id IN (SELECT note_id FROM note_access WHERE user_id = ?))';
      params.push(userId, userId);
    } else {
      whereClause += ' AND n.visibility != "private"';
    }

    const orderClause = `ORDER BY n.${validSortBy} ${sortOrder}`;
    const limitClause = 'LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const notes = await this.db.query<Note>(
      `SELECT n.* FROM notes n ${whereClause} ${orderClause} ${limitClause}`,
      params
    );

    const totalResult = await this.db.query<{ count: number }>(
      `SELECT COUNT(*) as count FROM notes n ${whereClause}`,
      params.slice(0, -2)
    );
    const total = totalResult.results?.[0]?.count || 0;

    const notesWithAccess = await Promise.all(
      (notes.results || []).map(async (note) => {
        const permission = userId
          ? await this.checkNoteAccess(toNoteId(note.id), userId)
          : null;
        return {
          ...note,
          user_permission: permission?.permission_level,
        } as NoteWithAccess;
      })
    );

    return { notes: notesWithAccess, total };
  }

  private isExpired(note: Note): boolean {
    return note.expires_at ? new Date(note.expires_at) < new Date() : false;
  }

  private notFound(): never {
    throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
  }

  async resolvePrivateNote(
    noteId: NoteId,
    userId: UserId | null
  ): Promise<NoteWithAccess | null> {
    if (!userId) {
      this.notFound();
    }

    const note = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) {
      this.notFound();
    }

    if (note.ownership_type === 'anonymous') {
      this.notFound();
    }

    if (this.isExpired(note)) {
      this.notFound();
    }

    const userPermission =
      note.owner_id === userId
        ? ({ permission_level: 'owner' } as { permission_level: PermissionLevel })
        : await this.checkNoteAccess(noteId, userId);

    if (!userPermission) {
      this.notFound();
    }

    await this.recordView(noteId, userId);

    return {
      ...note,
      user_permission: userPermission.permission_level,
    };
  }

  async resolveSharedNote(
    noteId: NoteId,
    userId: UserId | null
  ): Promise<NoteWithAccess | null> {
    const note = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) {
      this.notFound();
    }

    if (this.isExpired(note)) {
      this.notFound();
    }

    if (note.visibility === 'private') {
      this.notFound();
    }

    // Optional: surface permission for logged-in users without affecting visibility
    const permission = userId ? await this.checkNoteAccess(noteId, userId) : null;

    await this.recordView(noteId, userId);

    return {
      ...note,
      user_permission: permission?.permission_level,
    };
  }

  async resolvePublicNote(
    username: string,
    slug: string,
    userId: UserId | null
  ): Promise<NoteWithAccess | null> {
    const owner = await this.db.queryOne<{ user_id: string }>(
      'SELECT user_id FROM user_profiles WHERE username = ?',
      [username]
    );
    if (!owner) {
      return null;
    }

    const note = await this.db.queryOne<Note>(
      'SELECT * FROM notes WHERE slug = ? AND slug_owner_id = ?',
      [slug, owner.user_id]
    );
    if (!note) {
      this.notFound();
    }

    if (note.ownership_type === 'anonymous') {
      this.notFound();
    }

    if (this.isExpired(note)) {
      this.notFound();
    }

    if (note.visibility !== 'public') {
      this.notFound();
    }

    const permission =
      userId && note.owner_id === userId
        ? ({ permission_level: 'owner' } as { permission_level: PermissionLevel })
        : userId
        ? await this.checkNoteAccess(toNoteId(note.id), userId)
        : null;

    await this.recordView(toNoteId(note.id), userId);

    return { ...note, user_permission: permission?.permission_level };
  }

  async getNoteById(noteId: NoteId, userId: UserId | null): Promise<NoteWithAccess | null> {
    return this.resolvePrivateNote(noteId, userId);
  }

  async getNoteBySlug(
    username: string,
    slug: string,
    userId: UserId | null
  ): Promise<NoteWithAccess | null> {
    return this.resolvePublicNote(username, slug, userId);
  }

  async createNote(
    input: CreateNoteInput,
    userId: UserId | null
  ): Promise<Note> {
    const noteId = toNoteId(generateUUID());
    const now = new Date().toISOString();

    const ownerId = input.ownership_type === 'anonymous' ? null : userId;
    if (input.ownership_type !== 'anonymous' && !userId) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required for owned notes', 401);
    }

    if (!ownerId && input.visibility === 'private') {
      throw createError(ErrorCode.BAD_REQUEST, 'Anonymous notes cannot be private', 400);
    }

    const slugOwnerId = input.slug ? ownerId : null;

    if (input.slug && ownerId) {
      const existingSlug = await this.db.queryOne<{ slug: string }>(
        'SELECT slug FROM notes WHERE slug = ? AND slug_owner_id = ?',
        [input.slug, ownerId]
      );
      if (existingSlug) {
        throw createError(ErrorCode.CONFLICT, 'Slug already exists for this user', 409);
      }
    }

    const expiresAt = input.expires_at ?? null;
    const isEditable = input.is_editable ?? true;

    await this.db.execute(
      `INSERT INTO notes (id, title, content, ownership_type, owner_id, visibility, slug, slug_owner_id, is_editable, expires_at, view_count, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`,
      [
        noteId,
        input.title,
        input.content,
        input.ownership_type ?? 'user',
        ownerId,
        input.visibility,
        input.slug ?? null,
        slugOwnerId,
        isEditable ? 1 : 0,
        expiresAt,
        now,
        now,
      ]
    );

    const note = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) {
      throw createError(ErrorCode.INTERNAL_ERROR, 'Failed to create note', 500);
    }

    await this.cache.invalidatePattern(`notes:list:${ownerId || 'anon'}`);
    await this.cache.invalidatePublicNoteMeta(noteId, ownerId);
    return note;
  }

  async updateNote(
    noteId: NoteId,
    input: UpdateNoteInput,
    userId: UserId
  ): Promise<Note> {
    const access = await this.checkNoteAccess(noteId, userId);
    if (!access || (access.permission_level !== 'owner' && access.permission_level !== 'write' && access.permission_level !== 'admin')) {
      throw createError(ErrorCode.FORBIDDEN, 'You do not have permission to update this note', 403);
    }

    const note = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
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
    if (input.visibility !== undefined) {
      updates.push('visibility = ?');
      params.push(input.visibility);
    }
    if (input.slug !== undefined) {
      if (input.slug && note.owner_id) {
        const existingSlug = await this.db.queryOne<{ slug: string }>(
          'SELECT slug FROM notes WHERE slug = ? AND slug_owner_id = ? AND id != ?',
          [input.slug, note.owner_id, noteId]
        );
        if (existingSlug) {
          throw createError(ErrorCode.CONFLICT, 'Slug already exists for this user', 409);
        }
      }
      updates.push('slug = ?');
      params.push(input.slug ?? null);
      updates.push('slug_owner_id = ?');
      params.push(input.slug ? note.owner_id : null);
    }
    if (input.is_editable !== undefined) {
      updates.push('is_editable = ?');
      params.push(input.is_editable ? 1 : 0);
    }
    if (input.expires_at !== undefined) {
      updates.push('expires_at = ?');
      params.push(input.expires_at);
    }

    if (updates.length === 0) {
      return note;
    }

    updates.push('updated_at = ?');
    params.push(new Date().toISOString());
    params.push(noteId);

    await this.db.execute(
      `UPDATE notes SET ${updates.join(', ')} WHERE id = ?`,
      params
    );

    const updated = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!updated) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    await this.cache.invalidateNote(noteId);
    await this.cache.invalidatePattern(`notes:list:${note.owner_id || 'anon'}`);
    await this.cache.invalidatePublicNoteMeta(noteId, note.owner_id);
    return updated;
  }

  async deleteNote(noteId: NoteId, userId: UserId): Promise<void> {
    const access = await this.checkNoteAccess(noteId, userId);
    if (!access || (access.permission_level !== 'owner' && access.permission_level !== 'admin')) {
      throw createError(ErrorCode.FORBIDDEN, 'You do not have permission to delete this note', 403);
    }

    const note = await this.db.queryOne<Note>('SELECT * FROM notes WHERE id = ?', [noteId]);
    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    await this.db.execute(
      'INSERT OR REPLACE INTO note_deletions (note_id, deleted_by, reason, deleted_at) VALUES (?, ?, ?, ?)',
      [noteId, userId, null, new Date().toISOString()]
    );
    await this.db.execute('DELETE FROM notes WHERE id = ?', [noteId]);

    await this.cache.invalidateNote(noteId);
    await this.cache.invalidatePattern(`notes:list:${userId}`);
    await this.cache.invalidatePattern(`notes:list:anon`);
    await this.cache.invalidatePublicNoteMeta(noteId, note.owner_id);
  }

  async checkNoteAccess(
    noteId: NoteId,
    userId: UserId | null
  ): Promise<{ permission_level: PermissionLevel } | null> {
    if (!userId) return null;

    const cacheKey = this.cache.accessKey(noteId, userId);
    const cached = await this.cache.get<{ permission_level: PermissionLevel }>(
      cacheKey
    );
    if (cached) {
      return cached;
    }

    const noteOwner = await this.db.queryOne<{ owner_id: string | null }>(
      'SELECT owner_id FROM notes WHERE id = ?',
      [noteId]
    );

    if (noteOwner?.owner_id === userId) {
      const result = { permission_level: 'owner' as PermissionLevel };
      await this.cache.set(cacheKey, result, CACHE_TTL.ACCESS_CHECK);
      return result;
    }

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

  private async recordView(noteId: NoteId, userId: UserId | null) {
    try {
      await this.db.execute(
        'INSERT INTO note_views (id, note_id, viewer_user_id, created_at) VALUES (?, ?, ?, ?)',
        [generateUUID(), noteId, userId, new Date().toISOString()]
      );
      await this.db.execute(
        'UPDATE notes SET view_count = view_count + 1 WHERE id = ?',
        [noteId]
      );
    } catch {
      // best-effort
    }
  }
}

