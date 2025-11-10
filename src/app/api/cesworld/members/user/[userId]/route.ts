import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { CesworldMembers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
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
    const members = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.userId, trimmedUserId))
      .limit(1);

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