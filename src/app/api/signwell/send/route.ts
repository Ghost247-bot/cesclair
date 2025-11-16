import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST - Send document to users
export async function POST(request: NextRequest) {
  try {
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

    // Check if user is admin
    const userRole = (session.user as any)?.role;
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
        { error: 'SignWell API is not configured' },
        { status: 500 }
      );
    }

    const body = await request.json();
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
      return NextResponse.json(
        {
          error: 'Document not found in SignWell',
          code: 'DOCUMENT_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Prepare recipients
    const recipients = users.map((u) => ({
      email: u.email,
      name: u.name || u.email,
    }));

    // Send document to users
    // Note: SignWell API structure may vary - adjust based on actual API
    const result = await signWellClient.sendDocumentToUsers(documentId, recipients);

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
    console.error('POST /api/signwell/send error:', error);
    
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
