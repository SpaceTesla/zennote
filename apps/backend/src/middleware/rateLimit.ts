import { KVNamespace } from '@cloudflare/workers-types';
import { createError, ErrorCode } from '../utils/errors';
import { MiddlewareContext } from './cors';

interface RateLimitConfig {
  window: number; // seconds
  maxRequests: number;
}

const DEFAULT_LIMITS: Record<string, RateLimitConfig> = {
  '/v1/auth/login': { window: 60, maxRequests: 30 },
  '/v1/auth/register': { window: 60, maxRequests: 20 },
  default: { window: 60, maxRequests: 200 },
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
  const now = Math.floor(Date.now() / 1000);
  const current = await kv.get(key);

  let count: number;
  let windowStart: number;
  let resetTime: number;

  if (current) {
    try {
      const data = JSON.parse(current);
      count = data.count;
      windowStart = data.windowStart;
      
      // Check if window has expired
      if (now - windowStart >= config.window) {
        // Window expired, start a new one
        count = 1;
        windowStart = now;
        resetTime = now + config.window;
      } else {
        // Window still active
        if (count >= config.maxRequests) {
          resetTime = windowStart + config.window;
          throw createError(
            ErrorCode.RATE_LIMIT_EXCEEDED,
            'Rate limit exceeded. Please try again later.',
            429
          );
        }
        count += 1;
        resetTime = windowStart + config.window;
      }
    } catch {
      // Legacy format or invalid JSON, treat as new window
      count = 1;
      windowStart = now;
      resetTime = now + config.window;
    }
  } else {
    // New window
    count = 1;
    windowStart = now;
    resetTime = now + config.window;
  }

  // Store count and window start time
  await kv.put(
    key,
    JSON.stringify({ count, windowStart }),
    {
      expirationTtl: config.window,
    }
  );

  // Add rate limit headers
  context.rateLimitHeaders = {
    'X-RateLimit-Limit': config.maxRequests.toString(),
    'X-RateLimit-Remaining': (config.maxRequests - count).toString(),
    'X-RateLimit-Reset': resetTime.toString(),
  };
}

