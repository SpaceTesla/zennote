import { describe, it, expect } from 'vitest';
import {
  successResponse,
  errorResponse,
  paginationMeta,
} from '../../src/utils/response';

describe('Response Utils', () => {
  it('should create a success response', () => {
    const data = { id: '123', name: 'Test' };
    const response = successResponse(data);

    expect(response.success).toBe(true);
    expect(response.data).toEqual(data);
    expect(response.meta).toBeDefined();
    expect(response.meta?.timestamp).toBeDefined();
  });

  it('should create an error response', () => {
    const response = errorResponse('NOT_FOUND', 'Resource not found', {
      resource: 'note',
    });

    expect(response.success).toBe(false);
    expect(response.error?.code).toBe('NOT_FOUND');
    expect(response.error?.message).toBe('Resource not found');
    expect(response.error?.details).toEqual({ resource: 'note' });
    expect(response.meta?.timestamp).toBeDefined();
  });

  it('should create pagination metadata', () => {
    const meta = paginationMeta(1, 20, 100);

    expect(meta.page).toBe(1);
    expect(meta.limit).toBe(20);
    expect(meta.total).toBe(100);
    expect(meta.hasMore).toBe(true);
  });

  it('should set hasMore to false when on last page', () => {
    const meta = paginationMeta(5, 20, 100);

    expect(meta.hasMore).toBe(false);
  });
});

