import { describe, it, expect, beforeEach } from 'vitest';
import { AuthService } from '../../src/services/auth.service';
import { DbService } from '../../src/services/db.service';
import { D1Database } from '@cloudflare/workers-types';
import { toUserId } from '../../src/utils/types';

describe('AuthService', () => {
  let authService: AuthService;
  let dbService: DbService;
  let mockResults: any[] = [];
  let executeCalls: { sql: string; params: any[] }[] = [];

  beforeEach(() => {
    mockResults = [];
    executeCalls = [];

    const mockDb = {
      prepare: (sql: string) => ({
        bind: (...params: unknown[]) => ({
          all: async () => {
            executeCalls.push({ sql, params });
            return { results: mockResults };
          },
          run: async () => {
            executeCalls.push({ sql, params });
            return { success: true };
          },
        }),
        all: async () => {
          executeCalls.push({ sql, params: [] });
          return { results: mockResults };
        },
        run: async () => {
          executeCalls.push({ sql, params: [] });
          return { success: true };
        },
      }),
    } as unknown as D1Database;

    dbService = new DbService(mockDb);
    authService = new AuthService(dbService);
  });

  it('should return user when getUserByClerkId finds one', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      clerk_user_id: 'clerk-123',
      created_at: '2026-06-06T00:00:00Z',
      updated_at: '2026-06-06T00:00:00Z',
    };
    mockResults = [mockUser];

    const user = await authService.getUserByClerkId('clerk-123');
    expect(user).toEqual(mockUser);
    expect(executeCalls[0].sql).toContain('SELECT * FROM users WHERE clerk_user_id = ?');
    expect(executeCalls[0].params).toEqual(['clerk-123']);
  });

  it('should return user when getUserById finds one', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      clerk_user_id: 'clerk-123',
      created_at: '2026-06-06T00:00:00Z',
      updated_at: '2026-06-06T00:00:00Z',
    };
    mockResults = [mockUser];

    const user = await authService.getUserById(toUserId('user-123'));
    expect(user).toEqual(mockUser);
    expect(executeCalls[0].sql).toContain('SELECT * FROM users WHERE id = ?');
    expect(executeCalls[0].params).toEqual(['user-123']);
  });

  it('should return existing user in getOrCreateUserFromClerk if found by clerk id', async () => {
    const mockUser = {
      id: 'user-123',
      email: 'test@example.com',
      clerk_user_id: 'clerk-123',
      created_at: '2026-06-06T00:00:00Z',
      updated_at: '2026-06-06T00:00:00Z',
    };
    mockResults = [mockUser];

    const user = await authService.getOrCreateUserFromClerk('clerk-123', 'test@example.com');
    expect(user).toEqual(mockUser);
    expect(executeCalls.length).toBe(1);
  });
});
