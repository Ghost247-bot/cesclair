import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { CesworldMembers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  let trimmedUserId: string | null = null;
  
  try {
    // Parse params first (this might throw)
    try {
      const parsedParams = await params;
      trimmedUserId = parsedParams?.userId?.trim() || null;
    } catch (paramsError) {
      console.error('Error parsing params:', paramsError);
      return NextResponse.json(
        {
          error: 'Invalid request parameters',
          code: 'INVALID_PARAMS',
          details: process.env.NODE_ENV === 'development' 
            ? (paramsError instanceof Error ? paramsError.message : String(paramsError))
            : 'Invalid request',
        },
        { status: 400 }
      );
    }

    // Validate userId is provided
    if (!trimmedUserId || trimmedUserId === '') {
      return NextResponse.json(
        {
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Check authentication with error handling
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return NextResponse.json(
        {
          error: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
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

    // Security: Users can only access their own member data, unless they're an admin
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'admin';
    const isOwnData = session.user.id === trimmedUserId;

    if (!isAdmin && !isOwnData) {
      return NextResponse.json(
        {
          error: 'Forbidden: You can only access your own member data',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    // Query Cesworld_members table by userId
    let members;
    try {
      members = await db
        .select({
          id: CesworldMembers.id,
          userId: CesworldMembers.userId,
          tier: CesworldMembers.tier,
          points: CesworldMembers.points,
          annualSpending: CesworldMembers.annualSpending,
          birthdayMonth: CesworldMembers.birthdayMonth,
          birthdayDay: CesworldMembers.birthdayDay,
          joinedAt: CesworldMembers.joinedAt,
          lastTierUpdate: CesworldMembers.lastTierUpdate,
        })
        .from(CesworldMembers)
        .where(eq(CesworldMembers.userId, trimmedUserId))
        .limit(1);
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const errorStack = dbError instanceof Error ? dbError.stack : undefined;
      const errorCause = dbError instanceof Error && (dbError as any).cause ? (dbError as any).cause : null;
      
      console.error('Database query error:', {
        error: dbError,
        message: errorMessage,
        stack: errorStack,
        cause: errorCause,
        userId: trimmedUserId,
        userIdType: typeof trimmedUserId,
        userIdLength: trimmedUserId?.length,
      });
      
      // Check if it's a connection error
      const lowerErrorMessage = errorMessage.toLowerCase();
      if (lowerErrorMessage.includes('connection') || lowerErrorMessage.includes('timeout') || lowerErrorMessage.includes('econnrefused') || lowerErrorMessage.includes('connect econnrefused')) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            code: 'DATABASE_CONNECTION_ERROR',
            details: process.env.NODE_ENV === 'development' ? errorMessage : 'Unable to connect to database',
          },
          { status: 503 }
        );
      }
      
      // Check for table/column errors
      if (lowerErrorMessage.includes('does not exist') || lowerErrorMessage.includes('column') || lowerErrorMessage.includes('relation')) {
        return NextResponse.json(
          {
            error: 'Database schema error',
            code: 'DATABASE_SCHEMA_ERROR',
            details: process.env.NODE_ENV === 'development' ? errorMessage : 'Database schema issue',
          },
          { status: 500 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' 
            ? errorMessage
            : 'Failed to query member data',
        },
        { status: 500 }
      );
    }

    // Check if member exists
    if (!members || members.length === 0) {
      return NextResponse.json(
        {
          error: 'Member not found',
          code: 'MEMBER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Return first member object
    const member = members[0];
    return NextResponse.json(member, { status: 200 });
  } catch (error: unknown) {
    // Outer catch for all errors (including params parsing, etc.)
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('GET /api/cesworld/members/user/[userId] error:', {
      error,
      message: errorMessage,
      stack: errorStack,
      name: errorName,
    });
    
    // Check if it's a known error type
    if (errorMessage.includes('UNAUTHORIZED') || errorMessage.includes('Not authenticated')) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }
    
    // Return user-friendly error response
    return NextResponse.json(
      {
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : 'An error occurred while fetching member data',
      },
      { status: 500 }
    );
  }
}