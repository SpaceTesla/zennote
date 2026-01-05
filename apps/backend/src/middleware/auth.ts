import { createClerkClient, verifyToken } from '@clerk/backend';
import { createError, ErrorCode } from '../utils/errors';
import { MiddlewareContext } from './cors';

export async function authMiddleware(
  context: MiddlewareContext,
  required: boolean = false
): Promise<void> {
  const { request, env } = context;
  const authHeader = request.headers.get('Authorization');

  console.log('[Auth] Auth header present:', !!authHeader, 'Required:', required);

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    if (required) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Authentication required',
        401
      );
    }
    console.log('[Auth] No auth header, skipping authentication');
    return;
  }

  const token = authHeader.substring(7);

  try {
    console.log('[Auth] Verifying token with Clerk...');
    console.log('[Auth] Secret key present:', !!env.CLERK_SECRET_KEY);
    console.log('[Auth] Publishable key present:', !!env.CLERK_PUBLISHABLE_KEY);
    
    // Use the standalone verifyToken function from @clerk/backend
    const payload = await verifyToken(token, {
      secretKey: env.CLERK_SECRET_KEY,
    });
    
    console.log('[Auth] Token payload:', JSON.stringify(payload, null, 2));
    
    const userId = payload?.sub;
    // Try multiple possible email fields in the JWT
    const email = (payload as any)?.email || 
                  (payload as any)?.email_address || 
                  (payload as any)?.primary_email_address_id ||
                  '';

    if (!userId) {
      console.log('[Auth] Token payload missing userId');
      throw createError(
        ErrorCode.UNAUTHORIZED,
        'Invalid or expired token',
        401
      );
    }

    console.log('[Auth] Token verified successfully for user:', userId, 'email:', email);
    context.user = {
      id: userId,
      email,
    };
  } catch (error) {
    console.log('[Auth] Token verification failed:', error);
    console.log('[Auth] Required:', required);
    
    if (required) {
      const errorMessage = error instanceof Error ? error.message : 'Invalid or expired token';
      throw createError(
        ErrorCode.UNAUTHORIZED,
        errorMessage,
        401
      );
    }
    // Don't throw if auth is not required - just continue without user context
    // Clear any partial user data
    context.user = undefined;
  }
}

