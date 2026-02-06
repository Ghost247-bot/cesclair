import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

function isSignWellNotConfiguredError(error: unknown): boolean {
  if (!(error instanceof Error)) return false;
  const message = error.message.toLowerCase();
  return message.includes('signwell_api_key') || 
         message.includes('not set') || 
         message.includes('not configured') ||
         message.includes('not initialized');
}

// GET - List all documents from SignWell
export async function GET(request: NextRequest) {
  try {
    // Check authentication with error handling
    let session = null;
    try {
      // Better Auth getSession may return null instead of throwing when not authenticated
      // So we catch errors but also check for null
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      // Only log actual errors, not "not authenticated" cases
      const errorMessage = sessionError instanceof Error ? sessionError.message : String(sessionError);
      // Check if it's a configuration error vs authentication error
      if (!errorMessage.toLowerCase().includes('not authenticated') && 
          !errorMessage.toLowerCase().includes('unauthorized') &&
          !errorMessage.toLowerCase().includes('no session')) {
        console.error('Error getting session:', sessionError);
      }
      // If getSession throws, treat as not authenticated
      session = null;
    }
    
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Check if user is admin - first check session, then database
    let userRole = (session.user as any)?.role;
    
    // If role is not in session, fetch from database
    if (!userRole) {
      try {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0) {
          userRole = dbUser[0].role;
        }
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        const dbErrorMessage = dbError instanceof Error ? dbError.message : String(dbError);
        
        if (isSignWellNotConfiguredError(dbError)) {
          return NextResponse.json(
            {
              error: 'SignWell API is not configured',
              code: 'SIGNWELL_NOT_CONFIGURED'
            },
            { status: 503 }
          );
        }
        
        return NextResponse.json(
          {
            error: 'Failed to verify user role',
            code: 'ROLE_CHECK_ERROR',
            details: process.env.NODE_ENV === 'development' ? dbErrorMessage : undefined,
          },
          { status: 500 }
        );
      }
    }

    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          error: 'Only administrators can access this endpoint',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    if (!signWellClient) {
      console.warn('SignWell client is not initialized. Check SIGNWELL_API_KEY environment variable.');
      return NextResponse.json(
        { 
          error: 'SignWell API is not configured',
          code: 'SIGNWELL_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    if (typeof signWellClient.listDocuments !== 'function') {
      console.error('SignWell client is not properly initialized. listDocuments method is missing.');
      return NextResponse.json(
        { 
          error: 'SignWell API is not configured',
          code: 'SIGNWELL_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);
    const status = searchParams.get('status') || undefined;

    console.log(`Fetching SignWell documents: page=${page}, per_page=${perPage}, status=${status || 'all'}`);

    // Fetch documents from SignWell
    let result;
    try {
      result = await signWellClient.listDocuments({
        page,
        per_page: perPage,
        status,
      });
      console.log(`Successfully fetched ${result?.documents?.length || 0} documents from SignWell`);
      
      if (!result || !result.documents) {
        return NextResponse.json(
          {
            documents: [],
            pagination: {
              page,
              per_page: perPage,
              total: 0,
              total_pages: 0,
            },
          },
          { status: 200 }
        );
      }
    } catch (signWellError) {
      console.error('SignWell API error:', signWellError);
      const errorMessage = signWellError instanceof Error ? signWellError.message : String(signWellError);
      
      if (isSignWellNotConfiguredError(signWellError)) {
        return NextResponse.json(
          {
            error: 'SignWell API is not configured',
            code: 'SIGNWELL_NOT_CONFIGURED'
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Failed to fetch documents from SignWell',
          code: 'SIGNWELL_API_ERROR',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(result || { documents: [] }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('GET /api/signwell/documents error:', errorMessage);
    if (errorStack) {
      console.error('Error stack:', errorStack);
    }
    
    if (isSignWellNotConfiguredError(error)) {
      return NextResponse.json(
        {
          error: 'SignWell API is not configured',
          code: 'SIGNWELL_NOT_CONFIGURED'
        },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        code: 'FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
