import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get session
    let session;
    try {
      session = await auth.api.getSession({ 
        headers: request.headers 
      });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    if (!session || !session.user) {
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }

    // Get role from session if available, otherwise fetch from database
    let userRole = (session.user as any).role;
    
    // If role is not in session, fetch from database
    if (!userRole) {
      try {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0 && dbUser[0].role) {
          userRole = dbUser[0].role;
        }
      } catch (dbError) {
        console.error('Error fetching role from database:', dbError);
        // Don't throw error, just use default role
        // This prevents 500 errors when database is unavailable
      }
    }

    // Default to 'member' if no role is found
    const role = userRole || 'member';

    return NextResponse.json(
      {
        role: role,
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email
        }
      },
      { status: 200 }
    );
  } catch (error) {
    // Only log unexpected errors, return 401 for authentication issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('GET role check error:', errorMessage);
    
    // If it's an authentication-related error, return 401
    if (errorMessage.includes('auth') || errorMessage.includes('session') || errorMessage.includes('unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }
    
    // For other errors, return 500 but with a safe error message
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}