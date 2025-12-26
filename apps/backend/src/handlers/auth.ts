import { AuthService } from '../services/auth.service';
import { ProfileService } from '../services/profile.service';
import { DbService } from '../services/db.service';
import { CacheService } from '../services/cache.service';
import { MiddlewareContext } from '../middleware/cors';
import { responseFormatter, errorFormatter } from '../middleware/response';
import { parseBody } from '../utils/validation';
import { registerSchema, loginSchema } from '../schemas/auth.schema';
import { toUserId } from '../utils/types';

export async function handleRegister(
  context: MiddlewareContext
): Promise<Response> {
  // #region agent log
  fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'handlers/auth.ts:14',message:'handleRegister entry',data:{hasCorsHeaders:!!context.corsHeaders},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
  // #endregion
  try {
    const { env, request } = context;
    const input = await parseBody(request, registerSchema);

    const dbService = new DbService(env.DB);
    const authService = new AuthService(dbService, env.JWT_SECRET);

    const user = await authService.registerUser(input);
    const token = await authService.generateToken(user.id, user.email);

    const response = responseFormatter(
      context,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      201
    );
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'handlers/auth.ts:33',message:'handleRegister response created',data:{responseHeaders:Object.fromEntries(response.headers.entries())},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'C'})}).catch(()=>{});
    // #endregion
    return response;
  } catch (error) {
    // #region agent log
    fetch('http://127.0.0.1:7242/ingest/0e98af6b-b33b-4fbf-98ab-a0de336ec4fd',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'handlers/auth.ts:36',message:'handleRegister error caught',data:{errorType:error instanceof Error?error.constructor.name:'unknown'},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'E'})}).catch(()=>{});
    // #endregion
    return errorFormatter(context, error);
  }
}

export async function handleLogin(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, request } = context;
    const input = await parseBody(request, loginSchema);

    const dbService = new DbService(env.DB);
    const authService = new AuthService(dbService, env.JWT_SECRET);

    const user = await authService.loginUser(input);
    const token = await authService.generateToken(user.id, user.email);

    return responseFormatter(
      context,
      {
        token,
        user: {
          id: user.id,
          email: user.email,
        },
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

export async function handleMe(
  context: MiddlewareContext
): Promise<Response> {
  try {
    const { env, user } = context;
    if (!user) {
      throw new Error('User not authenticated');
    }

    const dbService = new DbService(env.DB);
    const cacheService = new CacheService(env.CACHE_KV);
    const profileService = new ProfileService(dbService, cacheService);

    const userId = toUserId(user.id);
    const profile = await profileService.getProfile(userId);

    return responseFormatter(
      context,
      {
        id: user.id,
        email: user.email,
        profile: profile || null,
      },
      200
    );
  } catch (error) {
    return errorFormatter(context, error);
  }
}

