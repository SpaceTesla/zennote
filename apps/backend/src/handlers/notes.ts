import { NoteService } from '../services/note.service';
import { AccessService } from '../services/access.service';
import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { parseBody, validateQueryParams } from '../utils/validation';
import {
  createNoteSchema,
  updateNoteSchema,
  shareNoteSchema,
} from '../schemas/note.schema';
import { z } from 'zod';
import { toNoteId, toUserId } from '../utils/types';
import { UserId } from '../types/note';
import { createError, ErrorCode } from '../utils/errors';
import { paginationMeta } from '../utils/response';
import { fetchClerkUserData } from '../utils/clerk';
import { generateExcerpt } from '../utils/excerpt';
import {
  CACHE_TTL,
  generatePublicNoteListPattern,
  generatePublicNoteMetaPattern,
  generatePublicNoteMetaSlugPattern,
} from '../utils/cache';

/**
 * Helper function to convert Clerk user ID to database user ID
 */
async function getDbUserId(
  clerkUserId: string | undefined,
  dbService: DbService
): Promise<UserId | null> {
  if (!clerkUserId) return null;

  const authService = new AuthService(dbService);
  const dbUser = await authService.getUserByClerkId(clerkUserId);
  return dbUser ? toUserId(dbUser.id) : null;
}

const rawQuerySchema = z.object({
  page: z.string().nullable().optional(),
  limit: z.string().nullable().optional(),
  search: z.string().nullable().optional(),
  sortBy: z.enum(['created_at', 'updated_at', 'title']).nullable().optional(),
  sortOrder: z.string().nullable().optional(),
  userId: z.string().uuid().nullable().optional(),
});

type RawQueryParams = z.infer<typeof rawQuerySchema>;

interface ParsedQueryParams {
  page: number;
  limit: number;
  search?: string;
  sortBy: 'created_at' | 'updated_at' | 'title';
  sortOrder: 'ASC' | 'DESC';
  userId?: string | null;
}

type PublicNoteMetadata = {
  id: string;
  title: string;
  contentExcerpt: string;
  visibility: 'public';
  slug: string | null;
  slug_owner_id: string | null;
  owner_username: string | null;
  updated_at: string;
  created_at: string;
};

type PublicNoteListItem = {
  id: string;
  title: string;
  slug: string | null;
  slug_owner_id: string | null;
  updated_at: string;
  owner_username: string | null;
};

type PublicNoteRecord = {
  id: string;
  title: string;
  content: string;
  visibility: string;
  slug: string | null;
  slug_owner_id: string | null;
  owner_id: string | null;
  updated_at: string;
  created_at: string;
  expires_at: string | null;
  username: string | null;
};

const PUBLIC_META_CACHE_CONTROL = 'public, max-age=600, stale-while-revalidate=1800';
const FALLBACK_TITLE = 'Untitled Note';
const FALLBACK_DESCRIPTION = 'A note shared on Zennote – calm, focused note-taking.';

function isPublicAndFresh(note: PublicNoteRecord): boolean {
  if (note.visibility !== 'public') return false;
  if (!note.expires_at) return true;
  return new Date(note.expires_at) > new Date();
}

function toPublicMetadata(note: PublicNoteRecord): PublicNoteMetadata {
  const title = note.title?.trim() || FALLBACK_TITLE;
  const excerpt = generateExcerpt(note.content || '', 160) || FALLBACK_DESCRIPTION;

  return {
    id: note.id,
    title,
    contentExcerpt: excerpt,
    visibility: 'public',
    slug: note.slug,
    slug_owner_id: note.slug_owner_id,
    owner_username: note.username,
    updated_at: note.updated_at,
    created_at: note.created_at,
  };
}

async function fetchPublicNoteMetadataById(
  dbService: DbService,
  noteId: string
): Promise<PublicNoteMetadata | null> {
  const note = await dbService.queryOne<PublicNoteRecord>(
    `SELECT n.id, n.title, n.content, n.visibility, n.slug, n.slug_owner_id, n.owner_id, n.updated_at, n.created_at, n.expires_at, up.username
     FROM notes n
     LEFT JOIN user_profiles up ON n.owner_id = up.user_id
     WHERE n.id = ?`,
    [noteId]
  );

  if (!note || !isPublicAndFresh(note)) {
    return null;
  }

  return toPublicMetadata(note);
}

async function fetchPublicNoteMetadataBySlug(
  dbService: DbService,
  username: string,
  slug: string
): Promise<PublicNoteMetadata | null> {
  const owner = await dbService.queryOne<{ user_id: string }>(
    'SELECT user_id FROM user_profiles WHERE username = ?',
    [username]
  );

  if (!owner) {
    return null;
  }

  const note = await dbService.queryOne<PublicNoteRecord>(
    `SELECT n.id, n.title, n.content, n.visibility, n.slug, n.slug_owner_id, n.owner_id, n.updated_at, n.created_at, n.expires_at, ? as username
     FROM notes n
     WHERE n.slug = ? AND n.slug_owner_id = ?`,
    [username, slug, owner.user_id]
  );

  if (!note || !isPublicAndFresh(note)) {
    return null;
  }

  return toPublicMetadata(note);
}

async function fetchPublicNotesList(dbService: DbService): Promise<PublicNoteListItem[]> {
  const now = new Date().toISOString();
  const notes = await dbService.query<PublicNoteListItem>(
    `SELECT n.id, n.title, n.slug, n.slug_owner_id, n.updated_at, up.username as owner_username
     FROM notes n
     LEFT JOIN user_profiles up ON n.owner_id = up.user_id
     WHERE visibility = "public" AND (expires_at IS NULL OR expires_at > ?)
     ORDER BY n.updated_at DESC
     LIMIT 5000`,
    [now]
  );

  return notes.results || [];
}

function validateSortBy(
  value: string | null | undefined
): 'created_at' | 'updated_at' | 'title' {
  if (value === 'created_at' || value === 'updated_at' || value === 'title') {
    return value;
  }
  return 'created_at';
}

function parseQueryParams(raw: RawQueryParams): ParsedQueryParams {
  return {
    page: raw.page
      ? isNaN(parseInt(raw.page, 10))
        ? 1
        : parseInt(raw.page, 10)
      : 1,
    limit: raw.limit
      ? isNaN(parseInt(raw.limit, 10))
        ? 20
        : parseInt(raw.limit, 10)
      : 20,
    search:
      raw.search === null || raw.search === undefined ? undefined : raw.search,
    sortBy: validateSortBy(raw.sortBy),
    sortOrder: (() => {
      if (!raw.sortOrder) return 'DESC';
      const upper = raw.sortOrder.toUpperCase();
      return (upper === 'ASC' || upper === 'DESC' ? upper : 'DESC') as
        | 'ASC'
        | 'DESC';
    })(),
    userId: raw.userId,
  };
}

export async function handleGetPublicNoteMetadata(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, params } = context;
    const noteId = params.id;

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);

    const cacheKey = cacheService.publicNoteMetaKeyById(toNoteId(noteId));
    const cached = await cacheService.get<PublicNoteMetadata>(cacheKey);
    if (cached) {
      return responseFormatter(context, cached, 200, {
        cacheControl: PUBLIC_META_CACHE_CONTROL,
        isPublic: true,
        maxAge: CACHE_TTL.PUBLIC_NOTE_META,
      });
    }

    const metadata = await fetchPublicNoteMetadataById(dbService, noteId);
    if (!metadata) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    await cacheService.setWithPattern(
      cacheKey,
      metadata,
      CACHE_TTL.PUBLIC_NOTE_META,
      generatePublicNoteMetaPattern(toNoteId(metadata.id))
    );

    return responseFormatter(context, metadata, 200, {
      cacheControl: PUBLIC_META_CACHE_CONTROL,
      isPublic: true,
      maxAge: CACHE_TTL.PUBLIC_NOTE_META,
    });
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetPublicNoteMetadataBySlug(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, params } = context;
    const { username, slug } = params;

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);

    const owner = await dbService.queryOne<{ user_id: string }>(
      'SELECT user_id FROM user_profiles WHERE username = ?',
      [username]
    );

    if (!owner) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    const cacheKey = cacheService.publicNoteMetaKeyBySlug(owner.user_id, slug);
    const cached = await cacheService.get<PublicNoteMetadata>(cacheKey);
    if (cached) {
      return responseFormatter(context, cached, 200, {
        cacheControl: PUBLIC_META_CACHE_CONTROL,
        isPublic: true,
        maxAge: CACHE_TTL.PUBLIC_NOTE_META,
      });
    }

    const metadata = await fetchPublicNoteMetadataBySlug(dbService, username, slug);
    if (!metadata) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    await cacheService.setWithPattern(
      cacheKey,
      metadata,
      CACHE_TTL.PUBLIC_NOTE_META,
      generatePublicNoteMetaSlugPattern(owner.user_id)
    );

    return responseFormatter(context, metadata, 200, {
      cacheControl: PUBLIC_META_CACHE_CONTROL,
      isPublic: true,
      maxAge: CACHE_TTL.PUBLIC_NOTE_META,
    });
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleListPublicNotes(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env } = context;

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);

    const listKey = cacheService.publicNoteListKey();
    const cached = await cacheService.getList<{ notes: PublicNoteListItem[] }>(listKey);
    if (cached) {
      return responseFormatter(context, cached, 200, {
        cacheControl: PUBLIC_META_CACHE_CONTROL,
        isPublic: true,
        maxAge: CACHE_TTL.PUBLIC_NOTE_META,
      });
    }

    const notes = await fetchPublicNotesList(dbService);
    const payload = { notes };

    await cacheService.setWithPattern(
      listKey,
      payload,
      CACHE_TTL.PUBLIC_NOTE_META,
      generatePublicNoteListPattern()
    );

    return responseFormatter(context, payload, 200, {
      cacheControl: PUBLIC_META_CACHE_CONTROL,
      isPublic: true,
      maxAge: CACHE_TTL.PUBLIC_NOTE_META,
    });
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetNotes(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user } = context;
    console.log('[GetNotes] User from context:', user);

    const url = new URL(context.request.url);
    const rawParams = validateQueryParams(
      {
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
        search: url.searchParams.get('search'),
        sortBy: url.searchParams.get('sortBy'),
        sortOrder: url.searchParams.get('sortOrder'),
        userId: url.searchParams.get('userId'),
      },
      rawQuerySchema
    );
    const params = parseQueryParams(rawParams);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    // Convert Clerk user ID to database user ID if user is authenticated
    const currentUserId = await getDbUserId(user?.id, dbService);
    console.log('[GetNotes] Current DB user ID:', currentUserId);

    const filterByUserId = params.userId ? toUserId(params.userId) : undefined;
    console.log('[GetNotes] Filter by user ID:', filterByUserId);

    const result = await noteService.getAllNotes(
      currentUserId,
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
      filterByUserId
    );

    console.log(
      '[GetNotes] Found notes:',
      result.notes.length,
      'Total:',
      result.total
    );

    return responseFormatter(context, result.notes, 200, {
      pagination: paginationMeta(params.page, params.limit, result.total),
      isPublic: true,
      maxAge: 120,
    });
  } catch (error) {
    console.error('[GetNotes] Error:', error);
    return errorFormatter(context, error);
  }
}

export async function handleGetNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    const noteId = toNoteId(params.id);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = await getDbUserId(user?.id, dbService);
    const note = await noteService.resolvePrivateNote(noteId, userId);

    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    return responseFormatter(context, note, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetNoteBySlug(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    const { username, slug } = params;

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = await getDbUserId(user?.id, dbService);
    const note = await noteService.resolvePublicNote(username, slug, userId);

    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    return responseFormatter(context, note, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetSharedNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    const noteId = toNoteId(params.id);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = await getDbUserId(user?.id, dbService);
    const note = await noteService.resolveSharedNote(noteId, userId);

    if (!note) {
      throw createError(ErrorCode.NOT_FOUND, 'Note not found', 404);
    }

    return responseFormatter(context, note, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleCreateNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, request } = context;
    console.log('[CreateNote] User from context:', user);

    const input = await parseBody(request, createNoteSchema);
    console.log('[CreateNote] Parsed input:', input);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);

    // If user is authenticated, ensure they exist in the database
    let userId: UserId | null = null;
    if (user) {
      try {
        const authService = new AuthService(dbService);

        // Fetch full user details from Clerk
        const clerkUserData = await fetchClerkUserData(
          user.id,
          env.CLERK_SECRET_KEY
        );
        const email =
          clerkUserData?.email || user.email || `${user.id}@clerk.placeholder`;

        const dbUser = await authService.getOrCreateUserFromClerk(
          user.id,
          email,
          clerkUserData
        );
        userId = toUserId(dbUser.id);
        console.log('[CreateNote] User ensured in DB:', userId);
      } catch (error) {
        console.error('[CreateNote] Error fetching/creating user:', error);
        // If we can't fetch user data, we can still create an anonymous note
        // But log the error for debugging
        console.warn('[CreateNote] Continuing without user authentication');
      }
    }

    const noteService = new NoteService(dbService, cacheService);
    console.log('[CreateNote] Creating note for userId:', userId);

    const note = await noteService.createNote(input, userId);
    console.log('[CreateNote] Note created successfully:', note.id);

    return responseFormatter(context, note, 201, { cacheControl: 'no-store' });
  } catch (error) {
    console.error('[CreateNote] Error:', error);
    return errorFormatter(context, error);
  }
}

export async function handleUpdateNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params, request } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const noteId = toNoteId(params.id);
    const input = await parseBody(request, updateNoteSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = await getDbUserId(user.id, dbService);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not found', 401);
    }
    const note = await noteService.updateNote(noteId, input, userId);

    return responseFormatter(context, note, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleDeleteNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const noteId = toNoteId(params.id);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = await getDbUserId(user.id, dbService);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not found', 401);
    }
    await noteService.deleteNote(noteId, userId);

    return new Response(null, {
      status: 204,
      headers: {
        ...(context.corsHeaders as Record<string, string>),
      },
    });
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleShareNote(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params, request } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const noteId = toNoteId(params.id);
    const input = await parseBody(request, shareNoteSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const accessService = new AccessService(dbService, cacheService);

    const userId = await getDbUserId(user.id, dbService);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not found', 401);
    }
    const targetUserId = toUserId(input.user_id);
    await accessService.grantAccess(
      noteId,
      targetUserId,
      input.permission_level,
      userId
    );

    return responseFormatter(
      context,
      { message: 'Access granted successfully' },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleRevokeAccess(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const noteId = toNoteId(params.id);
    const targetUserId = toUserId(params.userId);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const accessService = new AccessService(dbService, cacheService);

    const userId = await getDbUserId(user.id, dbService);
    if (!userId) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not found', 401);
    }
    await accessService.revokeAccess(noteId, targetUserId, userId);

    return responseFormatter(
      context,
      { message: 'Access revoked successfully' },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetCollaborators(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, params } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const noteId = toNoteId(params.id);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const accessService = new AccessService(dbService, cacheService);

    const collaborators = await accessService.getNoteCollaborators(noteId);

    return responseFormatter(context, collaborators, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}
