import { MiddlewareContext } from './cors';
import { ApiResponse, successResponse, errorResponse } from '../utils/response';
import { ApiError } from '../utils/errors';

export function responseFormatter(
  context: MiddlewareContext,
  data: unknown,
  status: number = 200,
  pagination?: { page: number; limit: number; total: number }
): Response {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'response.ts:11',message:'responseFormatter entry',data:{hasCorsHeaders:!!context.corsHeaders,corsHeaders:context.corsHeaders},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion
  const response: ApiResponse = successResponse(data, {
    requestId: context.requestId as string,
    ...(pagination && { pagination }),
  });

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(context.corsHeaders as Record<string, string>),
    ...(context.rateLimitHeaders as Record<string, string>),
    'X-Request-ID': (context.requestId as string) || '',
  };
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'response.ts:22',message:'responseFormatter headers before return',data:{headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
  // #endregion

  // Add ETag if cache service available
  if (context.cacheService && data) {
    const etag = (context.cacheService as any).generateETag(data);
    headers['ETag'] = etag;
    headers['Cache-Control'] = 'public, max-age=300';
  }

  return new Response(JSON.stringify(response), {
    status,
    headers,
  });
}

export function errorFormatter(
  context: MiddlewareContext,
  error: unknown
): Response {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'response.ts:39',message:'errorFormatter entry',data:{hasCorsHeaders:!!context.corsHeaders,corsHeaders:context.corsHeaders,errorType:error instanceof Error?error.constructor.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion
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
  };
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'response.ts:60',message:'errorFormatter headers before return',data:{headers},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
  // #endregion

  return new Response(JSON.stringify(response), {
    status,
    headers,
  });
}

