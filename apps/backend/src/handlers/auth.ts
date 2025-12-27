import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { parseBody } from '../utils/validation';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { toUserId } from '../utils/types';
import { createError, ErrorCode } from '../utils/errors';

export async function handleRegister(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, request } = context;
    const input = await parseBody(request, registerSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const authService = new AuthService(dbService, env.JWT_SECRET);
    const profileService = new ProfileService(dbService, cacheService);

    const user = await authService.registerUser(input);
    const token = await authService.generateToken(user.id, user.email);
    const profile = await profileService.getProfile(toUserId(user.id));

    return responseFormatter(
      context,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        profile: profile || null,
      },
      201
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleLogin(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, request } = context;
    const input = await parseBody(request, loginSchema);

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const authService = new AuthService(dbService, env.JWT_SECRET);
    const profileService = new ProfileService(dbService, cacheService);

    const user = await authService.loginUser(input);
    const token = await authService.generateToken(user.id, user.email);
    const profile = await profileService.getProfile(toUserId(user.id));

    return responseFormatter(
      context,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
        profile: profile || null,
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleMe(context: MiddlewareContext): Promise<Response> {
  try {
    const { env, user } = context;
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'User not authenticated', 401);
    }

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);
    const authService = new AuthService(dbService, env.JWT_SECRET);

    const userId = toUserId(user.id);

    const fullUser = await authService.getUserById(userId);
    if (!fullUser) {
      throw createError(ErrorCode.NOT_FOUND, 'User not found', 404);
    }

    const profile = await profileService.getProfile(userId);

    return responseFormatter(
      context,
      {
        user: {
          id: fullUser.id,
          email: fullUser.email,
          created_at: fullUser.created_at,
          updated_at: fullUser.updated_at,
        },
        profile: profile || null,
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}
