import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signWellClient, isSignWellNotConfiguredError, toSignWellApiErrorResponse } from '@/lib/signwell';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST - Send document to users
export async function POST(request: NextRequest) {
  try {
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
        return NextResponse.json(
          {
            error: 'Failed to verify user role',
            code: 'ROLE_CHECK_ERROR',
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
      return NextResponse.json(
        { error: 'SignWell API is not configured. Set SIGNWELL_API_KEY in your environment.', code: 'SIGNWELL_NOT_CONFIGURED' },
        { status: 503 }
      );
    }

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('Error parsing request body:', parseError);
      return NextResponse.json(
        {
          error: 'Invalid JSON in request body',
          code: 'INVALID_JSON',
        },
        { status: 400 }
      );
    }

    const { documentId, userIds, message, subject } = body;

    // Validate required fields
    if (!documentId || typeof documentId !== 'string') {
      return NextResponse.json(
        {
          error: 'Document ID is required',
          code: 'MISSING_DOCUMENT_ID',
        },
        { status: 400 }
      );
    }

    if (!userIds || !Array.isArray(userIds) || userIds.length === 0) {
      return NextResponse.json(
        {
          error: 'User IDs array is required and must not be empty',
          code: 'MISSING_USER_IDS',
        },
        { status: 400 }
      );
    }

    // Fetch users from database
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
      })
      .from(user)
      .where(inArray(user.id, userIds));

    if (users.length === 0) {
      return NextResponse.json(
        {
          error: 'No valid users found',
          code: 'NO_USERS_FOUND',
        },
        { status: 404 }
      );
    }

    // Get document status first to verify it exists
    try {
      await signWellClient.getDocumentStatus(documentId);
    } catch (error) {
      console.error('Error getting document status from SignWell:', error);
      const { body, status } = toSignWellApiErrorResponse(error);
      return NextResponse.json(body, { status });
    }

    // Prepare recipients
    const recipients = users.map((u) => ({
      email: u.email,
      name: u.name || u.email,
    }));

    // Send document to users
    let result;
    try {
      console.log(`Sending document ${documentId} to ${recipients.length} recipients`);
      result = await signWellClient.sendDocumentToUsers(documentId, recipients);
      console.log(`Successfully sent document: id=${result.id}`);
    } catch (signWellError) {
      console.error('SignWell API error during send:', signWellError);
      const { body, status } = toSignWellApiErrorResponse(signWellError);
      return NextResponse.json(body, { status });
    }

    return NextResponse.json(
      {
        success: true,
        documentId: result.id,
        recipients: users.map((u) => ({
          userId: u.id,
          email: u.email,
          name: u.name,
        })),
        message: 'Document sent successfully',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('POST /api/signwell/send error:', errorMessage);
    if (isSignWellNotConfiguredError(error)) {
      const { body, status } = toSignWellApiErrorResponse(error);
      return NextResponse.json(body, { status });
    }
    return NextResponse.json(
      {
        error: 'Failed to send document',
        code: 'SEND_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
