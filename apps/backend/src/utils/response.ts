export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  meta?: {
    requestId?: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      hasMore: boolean;
    };
  };
}

export function successResponse<T>(
  data: T,
  meta?: Omit<ApiResponse<T>['meta'], 'timestamp'>
): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: {
      ...meta,
      timestamp: new Date().toISOString(),
    },
  };
}

export function errorResponse(
  code: string,
  message: string,
  details?: Record<string, unknown>,
  requestId?: string
): ApiResponse {
  return {
    success: false,
    error: {
      code,
      message,
      ...(details && { details }),
    },
    meta: {
      ...(requestId && { requestId }),
      timestamp: new Date().toISOString(),
    },
  };
}

export function paginationMeta(
  page: number,
  limit: number,
  total: number
): ApiResponse['meta']['pagination'] {
  return {
    page,
    limit,
    total,
    hasMore: page * limit < total,
  };
}

