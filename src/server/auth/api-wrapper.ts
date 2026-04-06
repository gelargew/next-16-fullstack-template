import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/server/auth';
import type { Session, User } from '@/server/db/schema/auth';
import type { AuthOptions } from './types';

// Better-auth returns session wrapped with user
export type BetterAuthSession = {
  session: Omit<Session, 'ipAddress' | 'userAgent'> & {
    ipAddress?: string | null;
    userAgent?: string | null;
  };
  user: Omit<User, 'image'> & {
    image?: string | null;
  };
};

// Higher-order function to protect API routes
export function withAuth<T extends any[] = []>(
  handler: (request: NextRequest, session: BetterAuthSession, ...args: T) => Promise<NextResponse>,
  options: AuthOptions = {}
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    // 🚫 DISABLE AUTH: Comment the try-catch block below (lines 26-79)
    // ✅ ENABLE AUTH: Uncomment the try-catch block below

    /* AUTH ENABLED - Remove /* to enable
    try {
      // Get authenticated session
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Check if session exists
      if (!session) {
        return NextResponse.json(
          {
            error: options.unauthorizedMessage || 'Unauthorized - Please sign in',
            code: 'UNAUTHORIZED'
          },
          { status: 401 }
        );
      }

      // Check session expiration
      if (session.session?.expiresAt && new Date(session.session.expiresAt) < new Date()) {
        return NextResponse.json(
          {
            error: 'Session expired - Please sign in again',
            code: 'SESSION_EXPIRED'
          },
          { status: 401 }
        );
      }

      // Call the original handler with authenticated session
      return await handler(request, session, ...args);
    } catch (error) {
      console.error('Authentication error:', error);

      // Handle specific authentication errors
      if (error instanceof Error) {
        if (error.message.includes('JWT') || error.message.includes('token')) {
          return NextResponse.json(
            {
              error: 'Invalid authentication token',
              code: 'INVALID_TOKEN'
            },
            { status: 401 }
          );
        }
      }

      return NextResponse.json(
        {
          error: options.errorMessage || 'Authentication failed',
          code: 'AUTH_ERROR'
        },
        { status: 500 }
      );
    }
    */

    // 🔓 AUTH DISABLED - This runs when auth is commented out above
    try {
      // Bypass auth - pass null session
      const mockSession = null as any;
      return await handler(request, mockSession, ...args);
    } catch (error) {
      console.error('Handler error:', error);
      return NextResponse.json(
        { error: 'Internal server error', code: 'INTERNAL_ERROR' },
        { status: 500 }
      );
    }
  };
}

// Convenience wrapper for admin-only routes
export function withAdmin<T extends any[] = []>(
  handler: (request: NextRequest, session: BetterAuthSession, ...args: T) => Promise<NextResponse>
) {
  return withAuth(handler, {
    requiredRole: 'admin',
    unauthorizedMessage: 'Admin access required',
  });
}

// Convenience wrapper for routes that don't require strict auth
export function withOptionalAuth<T extends any[] = []>(
  handler: (request: NextRequest, session: BetterAuthSession | null, ...args: T) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...args: T): Promise<NextResponse> => {
    try {
      // Get session but don't require it
      const session = await auth.api.getSession({
        headers: request.headers,
      });

      // Call handler with session (could be null)
      return await handler(request, session, ...args);
    } catch (error) {
      console.error('Optional auth error:', error);

      // For optional auth, we still want to handle errors gracefully
      return NextResponse.json(
        {
          error: 'Authentication check failed',
          code: 'AUTH_CHECK_ERROR'
        },
        { status: 500 }
      );
    }
  };
}

// Extract user from request with validation
export async function getUserFromRequest(request: NextRequest): Promise<BetterAuthSession | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    // Validate session is not expired
    if (session && session.session?.expiresAt && new Date(session.session.expiresAt) < new Date()) {
      return null;
    }

    return session;
  } catch (error) {
    console.error('Error extracting user from request:', error);
    return null;
  }
}

// Check if user has specific permission
export function hasPermission(session: BetterAuthSession | null, permission: string): boolean {
  if (!session) return false;

  // This is a placeholder - implement your permission logic here
  // For example, you might have permissions stored in the user object
  const userPermissions = (session.user as any)?.permissions || [];
  return userPermissions.includes(permission);
}

// Rate limiting helper (can be used with withAuth)
export function withRateLimit<T extends any[] = []>(
  handler: (request: NextRequest, session: BetterAuthSession, ...args: T) => Promise<NextResponse>,
  options: {
    maxRequests?: number;
    windowMs?: number;
    keyGenerator?: (request: NextRequest, session: BetterAuthSession) => string;
  } = {}
) {
  const { maxRequests = 100, windowMs = 60 * 1000, keyGenerator } = options;

  // In-memory rate limit store (in production, use Redis or similar)
  const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

  return withAuth(async (request: NextRequest, session: BetterAuthSession, ...args: T) => {
    const key = keyGenerator
      ? keyGenerator(request, session)
      : `rate-limit:${session.user.id}`;

    const now = Date.now();
    const limit = rateLimitStore.get(key);

    if (!limit || now > limit.resetTime) {
      // First request or window expired
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs,
      });
      return await handler(request, session, ...args);
    }

    if (limit.count >= maxRequests) {
      return NextResponse.json(
        {
          error: 'Too many requests',
          code: 'RATE_LIMIT_EXCEEDED',
          resetTime: limit.resetTime
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': limit.resetTime.toString(),
          }
        }
      );
    }

    // Increment count
    limit.count++;
    rateLimitStore.set(key, limit);

    const response = await handler(request, session, ...args);

    // Add rate limit headers
    response.headers.set('X-RateLimit-Limit', maxRequests.toString());
    response.headers.set('X-RateLimit-Remaining', (maxRequests - limit.count).toString());
    response.headers.set('X-RateLimit-Reset', limit.resetTime.toString());

    return response;
  });
}