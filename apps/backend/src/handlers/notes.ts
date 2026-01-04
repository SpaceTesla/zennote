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
    sortBy: raw.sortBy || 'created_at',
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
    const note = await noteService.getNoteById(noteId, userId);

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
    const note = await noteService.getNoteBySlug(username, slug, userId);

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
