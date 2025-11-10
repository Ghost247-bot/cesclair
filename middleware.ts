import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { user } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function middleware(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (request.nextUrl.pathname.startsWith("/admin")) {
      if (!session?.user) {
        return NextResponse.redirect(new URL("/cesworld/login", request.url));
      }
      
      let userRole = (session.user as any)?.role;
      
      if (!userRole) {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0) {
          userRole = dbUser[0].role;
        }
      }
      
      if (userRole !== "admin") {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  } catch (error) {
    console.error('Middleware error:', error);
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