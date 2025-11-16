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
    // Get role from session if available, otherwise fetch from database
    let userRole = (session.user as any)?.role;
    
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
      } catch (roleError) {
        console.error('Error fetching role from database:', roleError);
        // Don't throw error, just use default role
        userRole = 'member';
      }
    }
    
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
      // Ensure trimmedUserId is a valid string before querying
      if (!trimmedUserId || typeof trimmedUserId !== 'string' || trimmedUserId.trim() === '') {
        return NextResponse.json(
          {
            error: 'Invalid userId parameter',
            code: 'INVALID_USER_ID',
            details: 'userId must be a valid non-empty string',
          },
          { status: 400 }
        );
      }

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
        .where(eq(CesworldMembers.userId, trimmedUserId.trim()))
        .limit(1);
    } catch (dbError: unknown) {
      const errorMessage = dbError instanceof Error ? dbError.message : String(dbError);
      const errorStack = dbError instanceof Error ? dbError.stack : undefined;
      const errorCause = dbError instanceof Error && (dbError as any).cause ? (dbError as any).cause : null;
      
      // Try to extract the actual database error from various error properties
      let cleanErrorMessage = errorMessage;
      
      // Check for nested error messages in common error properties
      const errorObj = dbError as any;
      if (errorObj?.cause?.message) {
        cleanErrorMessage = errorObj.cause.message;
      } else if (errorObj?.originalError?.message) {
        cleanErrorMessage = errorObj.originalError.message;
      } else if (errorObj?.error?.message) {
        cleanErrorMessage = errorObj.error.message;
      }
      
      // Remove query details from error message if present
      // Drizzle sometimes includes the query in the error message
      if (cleanErrorMessage.includes('select') && cleanErrorMessage.includes('limit')) {
        // Try to extract just the error part, not the query
        const queryMatch = cleanErrorMessage.match(/^(.*?)(?:select.*?limit.*?$|params:.*?$)/s);
        if (queryMatch && queryMatch[1]) {
          cleanErrorMessage = queryMatch[1].trim();
        }
        // If that didn't work, try to find error patterns
        const errorPatterns = [
          /relation\s+["']?(\w+)["']?\s+does\s+not\s+exist/i,
          /column\s+["']?(\w+)["']?\s+does\s+not\s+exist/i,
          /syntax\s+error/i,
          /permission\s+denied/i,
          /connection/i,
          /timeout/i,
        ];
        for (const pattern of errorPatterns) {
          const match = cleanErrorMessage.match(pattern);
          if (match) {
            cleanErrorMessage = match[0];
            break;
          }
        }
      }
      
      // Remove nested "Failed query:" prefixes
      if (cleanErrorMessage.includes('Failed query:')) {
        const parts = cleanErrorMessage.split('Failed query:');
        cleanErrorMessage = parts[parts.length - 1].trim();
      }
      
      // If we still have the query in the message, try to extract just the error
      if (cleanErrorMessage.includes('select') && cleanErrorMessage.length > 200) {
        // Likely contains the full query, try to find the actual error
        const lines = cleanErrorMessage.split('\n');
        for (const line of lines) {
          if (!line.includes('select') && !line.includes('params:') && line.trim().length > 0) {
            cleanErrorMessage = line.trim();
            break;
          }
        }
      }
      
      console.error('Database query error (fetch member):', {
        error: dbError,
        message: cleanErrorMessage,
        originalMessage: errorMessage,
        stack: errorStack,
        cause: errorCause,
        errorCode: errorObj?.code,
        errorName: errorObj?.name,
        errorDetails: errorObj?.details,
        userId: trimmedUserId,
        userIdType: typeof trimmedUserId,
        userIdLength: trimmedUserId?.length,
        fullError: JSON.stringify(dbError, Object.getOwnPropertyNames(dbError)),
      });
      
      // Check if it's a connection error
      const lowerErrorMessage = cleanErrorMessage.toLowerCase();
      if (lowerErrorMessage.includes('connection') || lowerErrorMessage.includes('timeout') || lowerErrorMessage.includes('econnrefused') || lowerErrorMessage.includes('connect econnrefused')) {
        return NextResponse.json(
          {
            error: 'Database connection error',
            code: 'DATABASE_CONNECTION_ERROR',
            details: process.env.NODE_ENV === 'development' ? cleanErrorMessage : 'Unable to connect to database',
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
            details: process.env.NODE_ENV === 'development' ? cleanErrorMessage : 'Database schema issue',
          },
          { status: 500 }
        );
      }
      
      // If we couldn't extract a meaningful error message, include more details in development
      let errorDetails = cleanErrorMessage;
      if (process.env.NODE_ENV === 'development') {
        // If the error message is just the query, include the full error object
        if (cleanErrorMessage.includes('select') && cleanErrorMessage.includes('limit') && cleanErrorMessage.length < 300) {
          errorDetails = {
            message: cleanErrorMessage,
            originalError: errorMessage,
            errorCode: errorObj?.code,
            errorName: errorObj?.name,
            hint: 'The error message appears to contain the SQL query. Check server logs for the actual database error.',
          };
        } else {
          errorDetails = cleanErrorMessage || errorMessage;
        }
      }
      
      // Return detailed error for development, generic for production
      return NextResponse.json(
        {
          error: 'Database error',
          code: 'DATABASE_ERROR',
          details: process.env.NODE_ENV === 'development' 
            ? errorDetails
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