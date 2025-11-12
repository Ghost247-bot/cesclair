import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

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

    const session = await auth.api.getSession({ headers: request.headers });
    
    // Redirect authenticated designers to their dashboard
    if (session?.user) {
      // Get role from session, or fetch from database if not in session
      let userRole = (session.user as any)?.role;
      
      // If role is not in session, fetch from database
      if (!userRole) {
        try {
          const userRecord = await db
            .select({ role: user.role })
            .from(user)
            .where(eq(user.id, session.user.id))
            .limit(1);
          
          if (userRecord.length > 0) {
            userRole = userRecord[0].role;
          }
        } catch (dbError) {
          console.error('Error fetching user role in middleware:', dbError);
          // Continue without role check if DB fails
        }
      }
      
      // If designer is authenticated, handle routing
      if (userRole === 'designer') {
        // If on root page, redirect to designer dashboard (since they came from designer login)
        if (pathname === '/') {
          return NextResponse.redirect(new URL("/designers/dashboard", request.url));
        }
        
        // Allow access to designer routes (login, apply, dashboard, etc.)
        if (pathname.startsWith('/designers')) {
          // Allow access to all designer pages
          return NextResponse.next();
        }
        
        // Redirect designers away from admin pages
        if (pathname.startsWith('/admin')) {
          return NextResponse.redirect(new URL("/designers/dashboard", request.url));
        }
        
        // Allow access to all other public pages (products, collections, etc.)
        // Allow access to cesworld pages (they can access cesworld dashboard too)
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
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request through - let the page handle authorization
    // This prevents blocking legitimate access due to transient errors
  }
  
  return NextResponse.next();
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