import { describe, it, expect } from 'vitest';
import { z } from 'zod';
import { parseBody, validateQueryParams } from '../../src/utils/validation';
import { ErrorCode } from '../../src/utils/errors';

describe('Validation Utils', () => {
  const testSchema = z.object({
    name: z.string(),
    age: z.number(),
  });

  it('should parse valid request body', async () => {
    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test', age: 25 }),
      headers: { 'Content-Type': 'application/json' },
    });

    const result = await parseBody(request, testSchema);
    expect(result.name).toBe('Test');
    expect(result.age).toBe(25);
  });

  it('should throw validation error for invalid body', async () => {
    const request = new Request('http://example.com', {
      method: 'POST',
      body: JSON.stringify({ name: 'Test' }), // missing age
      headers: { 'Content-Type': 'application/json' },
    });

    await expect(parseBody(request, testSchema)).rejects.toThrow();
  });

  it('should validate query parameters', () => {
    const querySchema = z.object({
      page: z.string().transform((val) => parseInt(val, 10)),
      limit: z.string().transform((val) => parseInt(val, 10)),
    });

    const params = {
      page: '1',
      limit: '20',
    };

    const result = validateQueryParams(params, querySchema);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(20);
  });

  it('should throw validation error for invalid query params', () => {
    const querySchema = z.object({
      page: z
        .string()
        .refine((val) => !isNaN(parseInt(val, 10)), {
          message: 'Must be a valid number',
        })
        .transform((val) => parseInt(val, 10)),
    });

    const params = {
      page: 'invalid',
    };

    expect(() => validateQueryParams(params, querySchema)).toThrow();
  });
});

