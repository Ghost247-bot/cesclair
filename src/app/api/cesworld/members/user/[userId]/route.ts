import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await params;

    // Validate userId is provided
    if (!userId || userId.trim() === '') {
      return NextResponse.json(
        {
          error: 'Valid userId is required',
          code: 'INVALID_USER_ID',
        },
        { status: 400 }
      );
    }

    // Trim and validate userId
    const trimmedUserId = userId.trim();

    // Query Cesworld_members table by userId
    // Using limit(1) to get only the first matching record
    try {
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
      return NextResponse.json(members[0], { status: 200 });
    } catch (dbError: unknown) {
      // Enhanced error logging for database errors
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const errorStack = dbError instanceof Error ? dbError.stack : undefined;
      const errorName = dbError instanceof Error ? dbError.name : 'UnknownError';
      
      console.error('Database query error:', {
        error: dbError,
        message: errorMessage,
        stack: errorStack,
        name: errorName,
        userId: trimmedUserId,
        table: 'Cesworld_members',
      });
      
      // Check for specific database errors and provide helpful messages
      if (errorMessage.includes('relation') || errorMessage.includes('does not exist')) {
        return NextResponse.json(
          {
            error: 'Database table not found. Please check database setup.',
            code: 'DATABASE_ERROR',
            details: errorMessage,
          },
          { status: 500 }
        );
      }

      if (errorMessage.includes('syntax error') || errorMessage.includes('invalid') || errorMessage.includes('Failed query')) {
        return NextResponse.json(
          {
            error: 'Database query error',
            code: 'QUERY_ERROR',
            details: errorMessage,
          },
          { status: 500 }
        );
      }

      // Generic database error - rethrow to be caught by outer catch
      throw dbError;
    }
  } catch (error: unknown) {
    // Outer catch for all errors
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    const errorName = error instanceof Error ? error.name : 'UnknownError';
    
    console.error('GET /api/cesworld/members/user/[userId] error:', {
      error,
      message: errorMessage,
      stack: errorStack,
      name: errorName,
    });
    
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