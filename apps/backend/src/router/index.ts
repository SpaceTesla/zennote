import { Env } from '../types/env';
import { MiddlewareContext } from '../middleware/cors';
import { corsMiddleware } from '../middleware/cors';
import { authMiddleware } from '../middleware/auth';
import { rateLimitMiddleware } from '../middleware/rateLimit';
import { loggerMiddleware } from '../middleware/logger';
import { cacheMiddleware } from '../middleware/cache';
import { versioningMiddleware } from '../middleware/versioning';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { createError, ErrorCode } from '../utils/errors';
import { noteRoutes } from './routes/notes';
import { authRoutes } from './routes/auth';
import { profileRoutes } from './routes/profiles';
import { healthRoutes } from './routes/health';

export interface Route {
  method: string;
  path: string;
  handler: (context: MiddlewareContext) => Promise<Response>;
  authRequired: boolean;
}

const allRoutes: Route[] = [
  ...healthRoutes,
  ...authRoutes,
  ...noteRoutes,
  ...profileRoutes,
];

function matchRoute(
  method: string,
  path: string
): { route: Route; params: Record<string, string> } | null {
  for (const route of allRoutes) {
    if (route.method !== method) continue;

    const routeParts = route.path.split('/').filter(p => p !== '');
    const pathParts = path.split('/').filter(p => p !== '');

    if (routeParts.length !== pathParts.length) continue;

    const params: Record<string, string> = {};
    let matches = true;

    for (let i = 0; i < routeParts.length; i++) {
      if (routeParts[i].startsWith(':')) {
        params[routeParts[i].substring(1)] = pathParts[i];
      } else if (routeParts[i] !== pathParts[i]) {
        matches = false;
        break;
      }
    }

    if (matches) {
      return { route, params };
    }
  }

  return null;
}

export async function handleRequest(
  request: Request,
  env: Env
): Promise<Response> {
  const context: MiddlewareContext = {
    request,
    env,
    params: {},
    requestId: '',
  };

  try {
    // Apply middleware in order
    const corsResult = corsMiddleware(context);
    if (corsResult instanceof Response) {
      return corsResult;
    }

    loggerMiddleware(context);
    versioningMiddleware(context);

    const path = (context.path as string) || new URL(request.url).pathname;
    const method = request.method;

    // Debug logging
    console.log('[Router] Matching route:', { method, path, totalRoutes: allRoutes.length });
    console.log('[Router] Available routes:', allRoutes.map(r => `${r.method} ${r.path}`));

    // Handle root path
    if (path === '/' || path === '/v1' || path === '/v1/') {
      return responseFormatter(
        context,
        {
          message: 'Zennote API',
          version: context.apiVersion || '1',
          endpoints: {
            health: '/v1/health',
            auth: '/v1/auth',
            notes: '/v1/notes',
            profiles: '/v1/profiles',
          },
        },
        200
      );
    }

    // Find matching route
    const match = matchRoute(method, path);
    if (!match) {
      console.error('[Router] No match found for:', { method, path });
      throw createError(ErrorCode.NOT_FOUND, 'Route not found', 404);
    }

    const { route, params } = match;
    context.params = params;

    // Apply rate limiting
    await rateLimitMiddleware(context);

    // Apply caching middleware
    const cacheResult = await cacheMiddleware(context);
    if (cacheResult instanceof Response) {
      return cacheResult;
    }

    // Apply authentication if required
    if (route.authRequired) {
      await authMiddleware(context, true);
    } else {
      await authMiddleware(context, false);
    }

    // Execute handler
    const handlerResponse = await route.handler(context);

    // Ensure CORS headers are always present
    let response = handlerResponse;
    if (context.corsHeaders) {
      const newHeaders = new Headers(handlerResponse.headers);
      Object.entries(context.corsHeaders).forEach(([key, value]) => {
        newHeaders.set(key, value);
      });
      
      // Create new response with CORS headers
      response = new Response(handlerResponse.body, {
        status: handlerResponse.status,
        statusText: handlerResponse.statusText,
        headers: newHeaders,
      });
    }

    // Log response
    if (context.logResponse) {
      context.logResponse(response);
    }

    return response;
  } catch (error) {
    // Log error
    console.error('Request error:', error);

    // Log response
    if (context.logResponse) {
      const errorResponse = errorFormatter(context, error);
      context.logResponse(errorResponse);
      return errorResponse;
    }

    return errorFormatter(context, error);
  }
}

