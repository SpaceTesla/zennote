import { D1Database, KVNamespace } from '@cloudflare/workers-types';

export interface Env {
  DB: D1Database;
  CACHE_KV?: KVNamespace;
  JWT_SECRET: string;
  CORS_ORIGIN?: string;
  API_VERSION?: string;
}

