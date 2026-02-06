import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Admin page routes - let client-side handle auth (no cookie checks)
  if (pathname.startsWith('/admin') && !pathname.startsWith('/api/admin')) {
    // No server-side protection for admin pages - client-side handles auth
    return NextResponse.next();
  }

  // API routes protection - keep Bearer token check
  if (pathname.startsWith('/api/admin')) {
    // Protect admin API routes
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }

    // In production, verify the Firebase token here
    // For now, let the API routes handle their own auth verification
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};
