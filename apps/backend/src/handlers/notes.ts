import { NoteService } from '../services/note.service';
import { AccessService } from '../services/access.service';
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
import { createError, ErrorCode } from '../utils/errors';
import { paginationMeta } from '../utils/response';

const querySchema = z.object({
  page: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .nullable()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 20)),
  search: z.string().nullable().optional(),
  sortBy: z
    .enum(['created_at', 'updated_at', 'title'])
    .nullable()
    .optional()
    .default('created_at'),
  sortOrder: z
    .string()
    .nullable()
    .optional()
    .transform((val): 'ASC' | 'DESC' => {
      if (!val) return 'DESC';
      const upper = val.toUpperCase();
      return (upper === 'ASC' || upper === 'DESC' ? upper : 'DESC') as 'ASC' | 'DESC';
    })
    .default('DESC'),
  userId: z.string().uuid().nullable().optional(),
});

export async function handleGetNotes(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user } = context;
    const url = new URL(context.request.url);
    const params = validateQueryParams(
      {
        page: url.searchParams.get('page'),
        limit: url.searchParams.get('limit'),
        search: url.searchParams.get('search'),
        sortBy: url.searchParams.get('sortBy'),
        sortOrder: url.searchParams.get('sortOrder'),
        userId: url.searchParams.get('userId'),
      },
      querySchema
    );

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const currentUserId = user ? toUserId(user.id) : null;
    const filterByUserId = params.userId ? toUserId(params.userId) : undefined;

    const result = await noteService.getAllNotes(
      currentUserId,
      params.page,
      params.limit,
      params.search,
      params.sortBy,
      params.sortOrder,
      filterByUserId
    );

    return responseFormatter(
      context,
      result.notes,
      200,
      {
        pagination: paginationMeta(params.page, params.limit, result.total),
        isPublic: true,
        maxAge: 300,
      }
    );
  } catch (error) {
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

    const userId = user ? toUserId(user.id) : null;
    const note = await noteService.getNoteById(noteId, userId);

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
    const input = await parseBody(request, createNoteSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const noteService = new NoteService(dbService, cacheService);

    const userId = user ? toUserId(user.id) : null;
    const note = await noteService.createNote(input, userId);

    return responseFormatter(context, note, 201, { cacheControl: 'no-store' });
  } catch (error) {
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

    const userId = toUserId(user.id);
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

    const userId = toUserId(user.id);
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

    const userId = toUserId(user.id);
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

    const userId = toUserId(user.id);
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

