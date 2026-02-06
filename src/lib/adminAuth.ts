import "server-only";
import { NextRequest, NextResponse } from 'next/server';
import { getAdminAuth } from './firebaseAdmin';

interface AuthResult {
  ok: boolean;
  status: number;
  message: string;
  decodedToken?: any;
}

/**
 * Verify admin authentication for API routes
 * @param request - Next.js request object
 * @returns AuthResult with decoded token if successful
 */
export async function requireAdmin(request: NextRequest): Promise<AuthResult> {
  // Verify Firebase ID token from Authorization header
  const authHeader = request.headers.get('authorization');
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[ADMIN-AUTH] Auth header:', authHeader ? 'Present' : 'Missing');
  }
  
  if (!authHeader?.startsWith('Bearer ')) {
    return {
      ok: false,
      status: 401,
      message: 'Missing token'
    };
  }

  const token = authHeader.split('Bearer ')[1];
  
  if (process.env.NODE_ENV === 'development') {
    console.log('[ADMIN-AUTH] Token extracted, length:', token.length);
  }
  
  try {
    const adminAuth = getAdminAuth();
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    if (process.env.NODE_ENV === 'development') {
      console.log('[ADMIN-AUTH] Token verified for UID:', decodedToken.uid);
      console.log('[ADMIN-AUTH] User admin claim:', decodedToken.admin);
    }
    
    // Check admin claim - use admin:true consistently
    if (decodedToken.admin !== true) {
      return {
        ok: false,
        status: 403,
        message: 'Admin required'
      };
    }
    
    return {
      ok: true,
      status: 200,
      message: 'Admin access confirmed',
      decodedToken
    };
  } catch (tokenError) {
    if (process.env.NODE_ENV === 'development') {
      console.error('[ADMIN-AUTH] Token verification failed:', tokenError);
    }
    
    // Check for common token errors
    const errorMessage = tokenError instanceof Error ? tokenError.message : 'Unknown error';
    
    if (errorMessage.includes('id-token-expired')) {
      return {
        ok: false,
        status: 401,
        message: 'Token expired'
      };
    }
    
    if (errorMessage.includes('id-token-revoked')) {
      return {
        ok: false,
        status: 401,
        message: 'Token revoked'
      };
    }
    
    return {
      ok: false,
      status: 401,
      message: 'Invalid token'
    };
  }
}

/**
 * Standardized error response for admin routes
 */
export function createAdminErrorResponse(error: unknown, status: number = 500) {
  // Safely normalize error to string message
  let message: string;
  let detail: string | undefined;
  
  if (error instanceof Error) {
    message = error.message;
    detail = process.env.NODE_ENV === 'development' ? error.stack : undefined;
  } else if (typeof error === 'string') {
    message = error;
  } else {
    message = 'Internal server error';
  }
  
  const responsePayload: any = {
    success: false,
    error: message,
    timestamp: new Date().toISOString()
  };
  
  // Include detail only in development, never in production
  if (process.env.NODE_ENV === 'development' && detail) {
    responsePayload.detail = detail;
  }
  
  return NextResponse.json(responsePayload, { status });
}

/**
 * Standardized success response for admin routes
 */
export function createAdminSuccessResponse(data: any, status: number = 200) {
  return NextResponse.json({
    success: true,
    data,
    timestamp: new Date().toISOString()
  }, { status });
}
