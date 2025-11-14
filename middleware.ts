import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Simple in-memory cache for user roles (cleared on server restart)
// In production, consider using Redis or similar
const roleCache = new Map<string, { role: string | null; timestamp: number }>();
const DESIGNER_CACHE_TTL = 5 * 60 * 1000; // 5 minutes
const ROLE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Rate limiting for anti-clone protection
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60; // 60 requests per minute

function getRateLimitKey(request: NextRequest): string {
  const ip = request.ip || 
    request.headers.get('x-forwarded-for')?.split(',')[0] || 
    request.headers.get('x-real-ip') || 
    'unknown';
  return `rate_limit_${ip}`;
}

function checkRateLimit(request: NextRequest): boolean {
  const key = getRateLimitKey(request);
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  record.count++;
  return true;
}

// Clean up old rate limit entries periodically
// Only run cleanup if not in serverless environment (middleware runs in Edge runtime)
// Note: setInterval may not work in all edge environments, so we also clean up on each request
if (typeof setInterval !== 'undefined') {
  try {
    setInterval(() => {
      const now = Date.now();
      for (const [key, record] of rateLimitMap.entries()) {
        if (now > record.resetTime) {
          rateLimitMap.delete(key);
        }
      }
    }, RATE_LIMIT_WINDOW);
  } catch (e) {
    // setInterval not available in this environment, rely on per-request cleanup
  }
}

// Clean up expired entries on each request (for serverless compatibility)
function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export async function middleware(request: NextRequest) {
  try {
    const pathname = request.nextUrl.pathname;
    
    // Skip redirect checks for API routes, static files, and auth routes
    if (
      pathname.startsWith('/api') ||
      pathname.startsWith('/_next') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon') ||
      pathname.startsWith('/auth')
    ) {
      return NextResponse.next();
    }

    // Clean up expired rate limit entries
    cleanupExpiredEntries();
    
    // Rate limiting for anti-clone protection
    if (!checkRateLimit(request)) {
      return new NextResponse('Too Many Requests', { status: 429 });
    }

    // Add security headers for anti-clone protection
    const response = NextResponse.next();
    
    // Security headers
    response.headers.set('X-Content-Type-Options', 'nosniff');
    response.headers.set('X-Frame-Options', 'DENY');
    response.headers.set('X-XSS-Protection', '1; mode=block');
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
    response.headers.set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
    
    // Anti-clone headers
    response.headers.set('X-Robots-Tag', 'noindex, nofollow, noarchive, nosnippet');
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');

    const session = await auth.api.getSession({ headers: request.headers });
    
    // Redirect authenticated designers to their dashboard
    if (session?.user) {
      // Get role from session first (fastest)
      let userRole = (session.user as any)?.role;
      
      // Only check database if role is missing and we haven't cached it recently
      if (!userRole) {
        const cacheKey = `role_${session.user.id}`;
        const cached = roleCache.get(cacheKey);
        const now = Date.now();
        
        if (cached && (now - cached.timestamp) < ROLE_CACHE_TTL) {
          userRole = cached.role;
        } else {
          // Skip DB query in middleware for performance - let page handle it
          // This reduces middleware latency significantly
        }
      }
      
      // For designer routes, check if user is approved designer
      // But skip expensive DB queries in middleware - let page components handle authorization
      // This significantly improves page load times
      
      // If designer is authenticated (by role), handle routing
      if (userRole === 'designer') {
        // If on root page, redirect to designer dashboard
        if (pathname === '/') {
          return NextResponse.redirect(new URL("/designers/dashboard", request.url));
        }
        
        // Allow access to designer routes (login, apply, dashboard, etc.)
        if (pathname.startsWith('/designers')) {
          return response;
        }
        
        // Redirect designers away from cesworld/everworld dashboards
        if (pathname.startsWith('/cesworld/dashboard') || pathname.startsWith('/everworld/dashboard')) {
          return NextResponse.redirect(new URL("/designers/dashboard", request.url));
        }
        
        // Redirect designers away from admin pages
        if (pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL("/designers/dashboard", request.url));
        }
      }
      
      // Check authentication for admin routes
      if (pathname.startsWith("/admin")) {
        // Only redirect if user is not authenticated at all
        // Let the page component handle role-based authorization
        if (!session?.user) {
          return NextResponse.redirect(new URL("/cesworld/login", request.url));
        }
        
        // For authenticated users, allow the request through
        // The page component will check the role and redirect if necessary
        // This prevents middleware from blocking access due to timing issues or DB errors
      }
    }
    
    return response;
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request through - let the page handle authorization
    // This prevents blocking legitimate access due to transient errors
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