import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';

export async function handleMe(context: MiddlewareContext): Promise<Response> {
  try {
    const { env, user } = context;
    if (!user || !user.id) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not authenticated', 401);
    }
    if (!user.email) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Email not available for authenticated user',
        401
      );
    }

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);
    const authService = new AuthService(dbService);

    const dbUser = await authService.getOrCreateUserFromClerk(user.id, user.email);
    const userId = toUserId(dbUser.id);

    const profile = await profileService.getProfileByUserId(userId);
    const settings = await profileService.getSettings(userId);

    return responseFormatter(
      context,
      {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          clerk_user_id: dbUser.clerk_user_id,
          created_at: dbUser.created_at,
          updated_at: dbUser.updated_at,
        },
        profile: profile || null,
        settings: settings || null,
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}
