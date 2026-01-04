import { ProfileService } from '../services/profile.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { parseBody } from '../utils/validation';
import {
  updateProfileSchema,
  updateSettingsSchema,
} from '../schemas/profile.schema';
import { toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';

export async function handleGetProfile(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, params } = context;
    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const identifier = params.userId;
    const profile =
      identifier.includes('@') || identifier.length > 30
        ? await profileService.getProfileByUserId(toUserId(identifier))
        : await profileService.getProfileByUsername(identifier.toLowerCase());

    if (!profile) {
      throw createError(ErrorCode.NOT_FOUND, 'Profile not found', 404);
    }

    return responseFormatter(context, profile, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleUpdateProfile(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, request } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const input = await parseBody(request, updateProfileSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const userId = toUserId(user.id);
    const profile = await profileService.updateProfile(userId, input);

    return responseFormatter(context, profile, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleGetSettings(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);
    const userId = toUserId(user.id);
    const settings = await profileService.getSettings(userId);

    if (!settings) {
      throw createError(ErrorCode.NOT_FOUND, 'Settings not found', 404);
    }

    return responseFormatter(context, settings, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleUpdateSettings(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, request } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const input = await parseBody(request, updateSettingsSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const userId = toUserId(user.id);
    const settings = await profileService.updateSettings(userId, input);

    return responseFormatter(context, settings, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

