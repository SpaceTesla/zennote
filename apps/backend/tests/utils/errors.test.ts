import { describe, it, expect } from 'vitest';
import { ApiError, ErrorCode, createError } from '../../src/utils/errors';

describe('Error Utils', () => {
  it('should create an ApiError with correct properties', () => {
    const error = new ApiError(
      ErrorCode.NOT_FOUND,
      'Resource not found',
      404,
      { resource: 'note' }
    );

    expect(error.code).toBe(ErrorCode.NOT_FOUND);
    expect(error.message).toBe('Resource not found');
    expect(error.statusCode).toBe(404);
    expect(error.details).toEqual({ resource: 'note' });
  });

  it('should convert ApiError to JSON', () => {
    const error = new ApiError(
      ErrorCode.BAD_REQUEST,
      'Invalid input',
      400
    );

    const json = error.toJSON();
    expect(json.code).toBe(ErrorCode.BAD_REQUEST);
    expect(json.message).toBe('Invalid input');
  });

  it('should create error using helper function', () => {
    const error = createError(
      ErrorCode.UNAUTHORIZED,
      'Unauthorized',
      401
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error.code).toBe(ErrorCode.UNAUTHORIZED);
    expect(error.statusCode).toBe(401);
  });
});

