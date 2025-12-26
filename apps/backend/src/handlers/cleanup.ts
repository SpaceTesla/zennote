import { CleanupService } from '../services/cleanup.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { createError, ErrorCode } from '../utils/errors';

export async function handleCleanup(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user } = context;
    
    // Only allow cleanup for authenticated users (you might want to add admin check)
    if (!user) {
      throw createError(ErrorCode.UNAUTHORIZED, 'Authentication required', 401);
    }

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const cleanupService = new CleanupService(dbService, cacheService);

    const deleted = await cleanupService.deleteExpiredNotes();

    return responseFormatter(
      context,
      {
        message: `Cleaned up ${deleted} expired notes`,
        deleted,
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

