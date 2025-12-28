import { MiddlewareContext } from './cors';
import { ApiResponse, successResponse, errorResponse } from '../utils/response';
import { ApiError } from '../utils/errors';

type PaginationMeta = { page: number; limit: number; total: number };

type ResponseOptions = {
  pagination?: PaginationMeta;
  cacheControl?: string;
  isPublic?: boolean;
  maxAge?: number;
};

export function responseFormatter(
  context: MiddlewareContext,
  data: unknown,
  status: number = 200,
  options?: ResponseOptions
): Response {
  const response: ApiResponse = successResponse(data, {
    requestId: context.requestId as string,
    ...(options?.pagination && { pagination: options.pagination }),
  });

  const etag = data && context.cacheService?.generateETag(data);
  if (etag && context.ifNoneMatch === etag && status === 200) {
    return new Response(null, {
      status: 304,
      headers: {
        ETag: etag,
        ...getCorsHeaders(context),
      },
    });
  }

  const cacheControl = determineCacheControl(options);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(etag ? { ETag: etag } : {}),
    'Cache-Control': cacheControl,
    Vary: 'Authorization, Accept-Encoding',
    'X-Request-ID': (context.requestId as string) || '',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    ...getCorsHeaders(context),
    ...getRateLimitHeaders(context),
  };

  const responsePayload = JSON.stringify(response);
  const result = new Response(responsePayload, {
    status,
    headers,
  });

  if (context.edgeCacheService && cacheControl.includes('public')) {
    context.edgeCacheService.put(context.request, result.clone());
  }

  return result;
}

export function errorFormatter(
  context: MiddlewareContext,
  error: unknown
): Response {
  let status = 500;
  let code = 'INTERNAL_ERROR';
  let message = 'An unexpected error occurred';
  let details: Record<string, unknown> | undefined;

  if (error instanceof ApiError) {
    status = error.statusCode;
    code = error.code;
    message = error.message;
    details = error.details;
  } else if (error instanceof Error) {
    message = error.message;
  }

  const response = errorResponse(code, message, details, context.requestId as string);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(context.corsHeaders as Record<string, string>),
    'X-Request-ID': (context.requestId as string) || '',
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  };

  return new Response(JSON.stringify(response), {
    status,
    headers,
  });
}

function determineCacheControl(options?: ResponseOptions): string {
  if (options?.cacheControl) return options.cacheControl;
  if (options?.isPublic) {
    const maxAge = options?.maxAge || 3600;
    return `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=60`;
  }
  return 'private, max-age=300, must-revalidate';
}

function getCorsHeaders(context: MiddlewareContext): Record<string, string> {
  return (context.corsHeaders as Record<string, string>) || {};
}

function getRateLimitHeaders(
  context: MiddlewareContext
): Record<string, string> {
  return (context.rateLimitHeaders as Record<string, string>) || {};
}


