import { z, ZodSchema } from 'zod';
import { createError, ErrorCode } from './errors';

export async function parseBody<T>(
  request: Request,
  schema: ZodSchema<T>
): Promise<T> {
  try {
    const body = await request.json();
    return schema.parse(body);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError(
        ErrorCode.UNPROCESSABLE_ENTITY,
        'Invalid request body',
        422,
        { errors: error.errors }
      );
    }
    throw createError(
      ErrorCode.BAD_REQUEST,
      'Failed to parse request body',
      400
    );
  }
}

export function validateQueryParams<T>(
  params: Record<string, string | null>,
  schema: ZodSchema<T>
): T {
  try {
    return schema.parse(params);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw createError(
        ErrorCode.UNPROCESSABLE_ENTITY,
        'Invalid query parameters',
        422,
        { errors: error.errors }
      );
    }
    throw createError(
      ErrorCode.BAD_REQUEST,
      'Invalid query parameters',
      400
    );
  }
}

