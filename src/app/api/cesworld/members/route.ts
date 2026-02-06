import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldMembers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, birthdayMonth, birthdayDay } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate userId is a non-empty string
    if (typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userId must be a valid non-empty string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate birthdayMonth if provided
    if (birthdayMonth !== undefined && birthdayMonth !== null) {
      const monthNum = parseInt(String(birthdayMonth));
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return NextResponse.json(
          { 
            error: 'birthdayMonth must be between 1 and 12',
            code: 'INVALID_BIRTHDAY_MONTH'
          },
          { status: 400 }
        );
      }
    }

    // Validate birthdayDay if provided
    if (birthdayDay !== undefined && birthdayDay !== null) {
      const dayNum = parseInt(String(birthdayDay));
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        return NextResponse.json(
          { 
            error: 'birthdayDay must be between 1 and 31',
            code: 'INVALID_BIRTHDAY_DAY'
          },
          { status: 400 }
        );
      }
    }

    // Trim userId once and use it throughout
    const trimmedUserId = userId.trim();

    // First, verify the user exists in the user table
    // This prevents foreign key constraint errors
    try {
      const userExists = await db.select()
        .from(user)
        .where(eq(user.id, trimmedUserId))
        .limit(1);
      
      if (userExists.length === 0) {
        return NextResponse.json(
          {
            error: 'User not found',
            code: 'USER_NOT_FOUND',
            details: `User with id ${userId} does not exist in the user table`,
          },
          { status: 404 }
        );
      }
    } catch (userCheckError: unknown) {
      const errorMessage = userCheckError instanceof Error ? userCheckError.message : String(userCheckError);
      
      // Extract the actual error message (remove nested "Failed query:" prefixes)
      let cleanErrorMessage = errorMessage;
      if (cleanErrorMessage.includes('Failed query:') || cleanErrorMessage.includes('Failed to verify')) {
        const parts = cleanErrorMessage.split(/Failed (query|to verify):/);
        cleanErrorMessage = parts[parts.length - 1].trim();
      }
      
      console.error('Database query error (check user exists):', {
        error: userCheckError,
        message: cleanErrorMessage,
        originalMessage: errorMessage,
        userId,
      });
      
      // Check if it's a connection error
      const lowerErrorMessage = cleanErrorMessage.toLowerCase();
      if (lowerErrorMessage.includes('connection') || lowerErrorMessage.includes('timeout') || lowerErrorMessage.includes('econnrefused')) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            code: 'DATABASE_CONNECTION_ERROR',
            details: process.env.NODE_ENV === 'development' ? cleanErrorMessage : 'Unable to connect to database',
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' 
            ? cleanErrorMessage
            : 'Failed to verify user',
        },
        { status: 500 }
      );
    }

    // Check if member with this userId already exists
    let existingMember;
    try {
      existingMember = await db.select()
        .from(CesworldMembers)
        .where(eq(CesworldMembers.userId, trimmedUserId))
        .limit(1);
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const errorStack = dbError instanceof Error ? dbError.stack : undefined;
      
      // Extract the actual error message (remove nested "Failed query:" prefixes)
      let cleanErrorMessage = errorMessage;
      if (cleanErrorMessage.includes('Failed query:')) {
        const parts = cleanErrorMessage.split('Failed query:');
        cleanErrorMessage = parts[parts.length - 1].trim();
      }
      
      console.error('Database query error (check existing member):', {
        error: dbError,
        message: cleanErrorMessage,
        originalMessage: errorMessage,
        stack: errorStack,
        userId,
        errorType: dbError?.constructor?.name,
      });
      
      // Check for specific error types
      const lowerErrorMessage = cleanErrorMessage.toLowerCase();
      const isConnectionError = 
        lowerErrorMessage.includes('connection') ||
        lowerErrorMessage.includes('econnrefused') ||
        lowerErrorMessage.includes('enotfound') ||
        lowerErrorMessage.includes('timeout') ||
        lowerErrorMessage.includes('pool');
      
      const isSchemaError = 
        lowerErrorMessage.includes('does not exist') ||
        lowerErrorMessage.includes('relation') ||
        lowerErrorMessage.includes('column');
      
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' 
            ? (isConnectionError 
                ? `Database connection failed: ${cleanErrorMessage}`
                : isSchemaError
                ? `Database schema error: ${cleanErrorMessage}`
                : cleanErrorMessage)
            : (isConnectionError 
                ? 'Failed to connect to database'
                : 'Failed to check existing member'),
        },
        { status: 500 }
      );
    }

    if (existingMember.length > 0) {
      return NextResponse.json(
        { 
          error: 'Member with this userId already exists',
          code: 'DUPLICATE_USER_ID'
        },
        { status: 409 }
      );
    }

    // Generate timestamps as Date objects
    const now = new Date();

    // Prepare insert data
    const insertData: any = {
      userId: trimmedUserId,
      tier: 'member',
      points: 0,
      annualSpending: '0.00',
      joinedAt: now,
      lastTierUpdate: now,
    };

    // Add optional birthday fields if provided
    if (birthdayMonth !== undefined && birthdayMonth !== null) {
      insertData.birthdayMonth = parseInt(String(birthdayMonth));
    }

    if (birthdayDay !== undefined && birthdayDay !== null) {
      insertData.birthdayDay = parseInt(String(birthdayDay));
    }

    // Insert new member
    let newMember;
    try {
      newMember = await db.insert(CesworldMembers)
        .values(insertData)
        .returning();
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      
      // Extract the actual error message (remove nested "Failed query:" or "Failed insert:" prefixes)
      let cleanErrorMessage = errorMessage;
      if (cleanErrorMessage.includes('Failed query:') || cleanErrorMessage.includes('Failed insert:')) {
        const parts = cleanErrorMessage.split(/Failed (query|insert):/);
        cleanErrorMessage = parts[parts.length - 1].trim();
      }
      
      console.error('Database insert error:', {
        error: dbError,
        message: cleanErrorMessage,
        originalMessage: errorMessage,
        userId,
        insertData,
      });
      
      // Check for specific database errors
      const lowerErrorMessage = cleanErrorMessage.toLowerCase();
      if (lowerErrorMessage.includes('does not exist') || lowerErrorMessage.includes('relation')) {
        return NextResponse.json(
          {
            error: 'Database schema error',
            code: 'DATABASE_SCHEMA_ERROR',
            details: process.env.NODE_ENV === 'development' 
              ? `Table or column does not exist: ${cleanErrorMessage}`
              : 'Database schema issue',
          },
          { status: 500 }
        );
      }
      
      // Check for connection errors
      if (lowerErrorMessage.includes('connection') || lowerErrorMessage.includes('timeout') || lowerErrorMessage.includes('econnrefused')) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            code: 'DATABASE_CONNECTION_ERROR',
            details: process.env.NODE_ENV === 'development' ? cleanErrorMessage : 'Unable to connect to database',
          },
          { status: 503 }
        );
      }
      
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' 
            ? cleanErrorMessage
            : 'Failed to create member',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(newMember[0], { status: 201 });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('POST /api/cesworld/members error:', {
      error,
      message: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' 
          ? errorMessage
          : 'An error occurred while creating member',
      },
      { status: 500 }
    );
  }
}