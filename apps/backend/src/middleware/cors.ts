import { Env } from '../types/env';

export interface MiddlewareContext {
  request: Request;
  env: Env;
  params: Record<string, string>;
  user?: { id: string; email: string };
  requestId: string;
  [key: string]: unknown;
}

export type Middleware = (
  context: MiddlewareContext
) => Promise<Response | void>;

export function corsMiddleware(context: MiddlewareContext): Response | void {
  const { request, env } = context;
  const origin = request.headers.get('Origin');
  
  let allowedOrigin: string;
  
  // Priority: env.CORS_ORIGIN > origin (if localhost/127.0.0.1) > origin > '*'
  if (env.CORS_ORIGIN) {
    allowedOrigin = env.CORS_ORIGIN;
  } else if (origin && (origin.includes('localhost') || origin.includes('127.0.0.1'))) {
    allowedOrigin = origin;
  } else if (origin) {
    allowedOrigin = origin;
  } else {
    allowedOrigin = '*';
  }

  const corsHeaders = {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS, PATCH',
    'Access-Control-Allow-Headers':
      'Content-Type, Authorization, X-API-Version',
  };

  // Handle preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        ...corsHeaders,
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Add CORS headers to context for response
  context.corsHeaders = corsHeaders;
}

