import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { DbService } from '../../src/services/db.service';
import { D1Database } from '@cloudflare/workers-types';

describe('AuthService', () => {
  let authService: AuthService;
  let dbService: DbService;
  const jwtSecret = 'test-secret-key';

  beforeEach(() => {
    const mockDb = {
      prepare: (sql: string) => ({
        bind: (...args: unknown[]) => ({
          all: async () => ({ results: [] }),
          run: async () => ({ success: true }),
        }),
        all: async () => ({ results: [] }),
        run: async () => ({ success: true }),
      }),
    } as unknown as D1Database;

    dbService = new DbService(mockDb);
    authService = new AuthService(dbService, jwtSecret);
  });

  it('should hash a password', async () => {
    const password = 'test-password';
    const hash = await authService.hashPassword(password);

    expect(hash).toBeDefined();
    expect(typeof hash).toBe('string');
    expect(hash).toContain(':'); // PBKDF2 format: salt:hash
  });

  it('should verify a correct password', async () => {
    const password = 'test-password';
    const hash = await authService.hashPassword(password);

    const isValid = await authService.verifyPassword(password, hash);
    expect(isValid).toBe(true);
  });

  it('should reject an incorrect password', async () => {
    const password = 'test-password';
    const wrongPassword = 'wrong-password';
    const hash = await authService.hashPassword(password);

    const isValid = await authService.verifyPassword(wrongPassword, hash);
    expect(isValid).toBe(false);
  });

  it('should generate a JWT token', async () => {
    const userId = 'user-123';
    const email = 'test@example.com';

    const token = await authService.generateToken(userId as any, email);

    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
  });

  it('should verify a valid JWT token', async () => {
    const userId = 'user-123';
    const email = 'test@example.com';

    const token = await authService.generateToken(userId as any, email);
    const payload = await authService.verifyToken(token);

    expect(payload).not.toBeNull();
    expect(payload?.userId).toBe(userId);
    expect(payload?.email).toBe(email);
  });

  it('should reject an invalid JWT token', async () => {
    const invalidToken = 'invalid.token.here';
    const payload = await authService.verifyToken(invalidToken);

    expect(payload).toBeNull();
  });
});

