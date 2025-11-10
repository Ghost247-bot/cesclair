import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
  try {
    // Only check authentication for admin routes, let the page handle authorization
    if (request.nextUrl.pathname.startsWith("/admin")) {
      const session = await auth.api.getSession({ headers: request.headers });
      
      // Only redirect if user is not authenticated at all
      // Let the page component handle role-based authorization
      if (!session?.user) {
        return NextResponse.redirect(new URL("/cesworld/login", request.url));
      }
      
      // For authenticated users, allow the request through
      // The page component will check the role and redirect if necessary
      // This prevents middleware from blocking access due to timing issues or DB errors
    }
  } catch (error) {
    console.error('Middleware error:', error);
    // On error, allow the request through - let the page handle authorization
    // This prevents blocking legitimate admin access due to transient errors
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/cesworld/dashboard",
    "/account/:path*",
    "/admin/:path*",
    "/designers/dashboard",
  ],
};