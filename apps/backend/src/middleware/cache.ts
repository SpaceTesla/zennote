import { CacheService } from '../services/cache.service';
import { EdgeCacheService } from '../services/edge-cache.service';
import { MiddlewareContext } from './cors';

export async function cacheMiddleware(
  context: MiddlewareContext
): Promise<Response | void> {
  const { request, env } = context;
  const cacheService = new CacheService(env.CACHE_KV);
  const edgeCacheService = new EdgeCacheService();

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check edge cache first
  const edgeCached = await edgeCacheService.get(request);
  if (edgeCached) {
    return edgeCached;
  }

  // Check ETag
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch) {
    context.ifNoneMatch = ifNoneMatch;
  }

  // Store cache service in context
  context.cacheService = cacheService;
  context.edgeCacheService = edgeCacheService;
}

