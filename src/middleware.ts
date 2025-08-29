import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { validateKaistEmail } from './lib/sanitize';

export async function middleware(req: NextRequest) {
  // Skip middleware for static files and API auth routes
  if (
    req.nextUrl.pathname.startsWith('/_next') ||
    req.nextUrl.pathname.startsWith('/api/auth') ||
    req.nextUrl.pathname === '/favicon.ico'
  ) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();

    // If there's an error getting the session, let the page handle it
    if (error) {
      console.error('Middleware session error:', error);
      return res;
    }

    // Protected routes that require authentication
    const protectedPaths = ['/dashboard', '/api/events', '/api/upload-url'];
    const isProtectedPath = protectedPaths.some(path => 
      req.nextUrl.pathname.startsWith(path)
    );

    if (isProtectedPath) {
      if (!session) {
        // Only redirect if we're sure there's no session
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/login';
        redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname);
        return NextResponse.redirect(redirectUrl);
      }

      // Check if user has KAIST email
      if (session.user.email && !validateKaistEmail(session.user.email)) {
        const redirectUrl = req.nextUrl.clone();
        redirectUrl.pathname = '/auth/invalid-email';
        return NextResponse.redirect(redirectUrl);
      }
    }

    return res;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, let the page handle authentication
    return res;
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
};
