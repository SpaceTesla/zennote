import { Env } from './types/env';
import { handleRequest } from './router';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    // Cleanup expired notes
    if (event.cron === '0 0 * * *') {
      const { CleanupService } = await import('./services/cleanup.service');
      const { DbService } = await import('./services/db.service');
      const { CacheService } = await import('./services/cache.service');

      const dbService = new DbService(env.DB);
      const cacheService = new CacheService(env.CACHE_KV);
      const cleanupService = new CleanupService(dbService, cacheService);

      const deleted = await cleanupService.deleteExpiredNotes();
      console.log(`Cleaned up ${deleted} expired notes`);
    }
  },
};
