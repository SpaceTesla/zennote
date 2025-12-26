import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from './cors';
import { Env } from '../types/env';

export async function cacheMiddleware(
  context: MiddlewareContext
): Promise<Response | void> {
  const { request, env } = context;
  const cacheService = new CacheService(env.CACHE_KV);

  // Only cache GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Check ETag
  const ifNoneMatch = request.headers.get('If-None-Match');
  if (ifNoneMatch) {
    context.ifNoneMatch = ifNoneMatch;
  }

  // Store cache service in context
  context.cacheService = cacheService;
}

