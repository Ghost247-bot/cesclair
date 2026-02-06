import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Routes that need session checks (protected routes)
const PROTECTED_PREFIXES = ['/admin', '/account', '/designers/dashboard', '/cesworld/dashboard', '/everworld/dashboard'];

function needsAuth(pathname: string): boolean {
  return PROTECTED_PREFIXES.some(prefix => pathname.startsWith(prefix));
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;

    // Skip for API routes, static files, auth routes
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/auth')
    ) {
      return NextResponse.next();
    }

    const response = NextResponse.next();

    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Only call getSession for protected routes — public pages skip the DB round-trip entirely
    if (!needsAuth(pathname)) {
      return response;
    }

    const session = await auth.api.getSession({ headers: request.headers });

    if (session?.user) {
      const userRole = (session.user as any)?.role;

      if (userRole === 'designer') {
          if (pathname.startsWith('/cesworld/dashboard') || pathname.startsWith('/everworld/dashboard')) {
            return NextResponse.redirect(new URL("/designers/dashboard", request.url));
          }
          if (pathname.startsWith('/admin')) {
            return NextResponse.redirect(new URL("/designers/dashboard", request.url));
          }
        }
    } else {
      // Not authenticated — redirect away from protected routes
      if (pathname.startsWith('/admin') || pathname.startsWith('/account')) {
        return NextResponse.redirect(new URL("/cesworld/login", request.url));
      }
    }

    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public folder)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};