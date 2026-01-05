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

  // If auth is not required and token looks invalid, skip verification
  if (!required && (!token || token.length < 10)) {
    console.log('[Auth] Token appears invalid, skipping verification (auth not required)');
    context.user = undefined;
    return;
  }

  try {
    console.log('[Auth] Verifying token with Clerk...');
    console.log('[Auth] Secret key present:', !!env.CLERK_SECRET_KEY);
    console.log('[Auth] Token length:', token.length);
    
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
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.log('[Auth] Token verification failed:', errorMessage);
    console.log('[Auth] Required:', required);
    console.log('[Auth] Error type:', error?.constructor?.name || typeof error);
    
    if (required) {
      throw createError(
        ErrorCode.UNAUTHORIZED,
        errorMessage || 'Invalid or expired token',
        401
      );
    }
    // Don't throw if auth is not required - just continue without user context
    // Clear any partial user data
    console.log('[Auth] Auth not required, continuing without user context');
    context.user = undefined;
  }
}

