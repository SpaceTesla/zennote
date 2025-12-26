import { KVNamespace } from '@cloudflare/workers-types';
import { createError, ErrorCode } from '../utils/errors';
import { MiddlewareContext } from './cors';

interface RateLimitConfig {
  window: number; // seconds
  maxRequests: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  '/v1/auth/login': { window: 60, maxRequests: 5 },
  '/v1/auth/register': { window: 3600, maxRequests: 3 },
  default: { window: 60, maxRequests: 100 },
};

export async function rateLimitMiddleware(
  context: MiddlewareContext
): Promise<void> {
  const { request, env } = context;
  const kv = env.CACHE_KV;
  if (!kv) return; // Skip rate limiting if KV not available

  const path = new URL(request.url).pathname;
  const config =
    DEFAULT_LIMITS[path] ||
    Object.entries(DEFAULT_LIMITS).find(([key]) =>
      path.startsWith(key)
    )?.[1] ||
    DEFAULT_LIMITS.default;

  const clientId =
    request.headers.get('CF-Connecting-IP') ||
    request.headers.get('X-Forwarded-For') ||
    'unknown';

  const key = `ratelimit:${clientId}:${path}`;
  const current = await kv.get(key);

  if (current) {
    const count = parseInt(current, 10);
    if (count >= config.maxRequests) {
      throw createError(
        ErrorCode.RATE_LIMIT_EXCEEDED,
        'Rate limit exceeded. Please try again later.',
        429
      );
    }
    await kv.put(key, (count + 1).toString(), {
      expirationTtl: config.window,
    });
  } else {
    await kv.put(key, '1', {
      expirationTtl: config.window,
    });
  }

  // Add rate limit headers
  context.rateLimitHeaders = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': (
      config.maxRequests - (parseInt(current || '0', 10) + 1)
    ).toString(),
    'X-RateLimit-Reset': (
      Math.floor(Date.now() / 1000) + config.window
    ).toString(),
  };
}

