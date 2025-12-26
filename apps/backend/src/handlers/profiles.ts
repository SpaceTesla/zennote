import { ProfileService } from '../services/profile.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { parseBody } from '../utils/validation';
import {
  updateProfileSchema,
  updateSocialLinksSchema,
} from '../schemas/profile.schema';
import { toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';

export async function handleGetProfile(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, params } = context;
    const userId = toUserId(params.userId);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const profile = await profileService.getProfile(userId);

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

export async function handleUpdateSocialLinks(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user, request } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const input = await parseBody(request, updateSocialLinksSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const userId = toUserId(user.id);
    const socials = await profileService.updateSocialLinks(userId, input);

    return responseFormatter(context, { socials }, 200);
  } catch (error) {
    return errorFormatter(context, error);
  }
}

