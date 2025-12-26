import { AuthService } from '../services/auth.service';
import { DbService } from '../services/db.service';
import { createError, ErrorCode } from '../utils/errors';
import { MiddlewareContext } from './cors';
import { toUserId } from '../utils/types';

export async function authMiddleware(
  context: MiddlewareContext,
  required: boolean = false
): Promise<void> {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (required) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
    }
    return;
  }

  const token = authHeader.substring(7);
  const dbService = new DbService(env.DB);
  const authService = new AuthService(dbService, env.JWT_SECRET);

  const payload = await authService.verifyToken(token);
  if (!payload) {
    if (required) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Invalid or expired token',
        401
      );
    }
    return;
  }

  context.user = {
    id: payload.userId,
    email: payload.email,
  };
}

