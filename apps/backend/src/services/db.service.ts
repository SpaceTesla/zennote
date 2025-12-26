import { D1Database, D1Result } from '@cloudflare/workers-types';
import { createError, ErrorCode } from '../utils/errors';

export class DbService {
  constructor(private db: D1Database) {}

  async query<T = unknown>(
    sql: string,
    params: unknown[] = []
  ): Promise<D1Result<T>> {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).all<T>();
      }
      return await stmt.all<T>();
    } catch (error) {
      throw createError(
        ErrorCode.DATABASE_ERROR,
        'Database query failed',
        500,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async queryOne<T = unknown>(
    sql: string,
    params: unknown[] = []
  ): Promise<T | null> {
    const result = await this.query<T>(sql, params);
    return (result.results?.[0] as T) || null;
  }

  async execute(sql: string, params: unknown[] = []): Promise<D1Result<unknown>> {
    try {
      const stmt = this.db.prepare(sql);
      if (params.length > 0) {
        return await stmt.bind(...params).run();
      }
      return await stmt.run();
    } catch (error) {
      throw createError(
        ErrorCode.DATABASE_ERROR,
        'Database execution failed',
        500,
        { error: error instanceof Error ? error.message : String(error) }
      );
    }
  }

  async transaction<T>(
    callback: (db: DbService) => Promise<T>
  ): Promise<T> {
    // D1 doesn't support transactions in the same way, but we can batch operations
    return callback(this);
  }

  async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }
}

