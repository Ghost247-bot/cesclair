import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signWellClient } from '@/lib/signwell';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

// POST - Upload document to SignWell
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
          error: 'Only administrators can upload documents',
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

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const recipientsJson = formData.get('recipients') as string | null;

    if (!file) {
      return NextResponse.json(
        {
          error: 'File is required',
          code: 'MISSING_FILE',
        },
        { status: 400 }
      );
    }

    if (!name || !name.trim()) {
      return NextResponse.json(
        {
          error: 'Document name is required',
          code: 'MISSING_NAME',
        },
        { status: 400 }
      );
    }

    // Validate file type - allow common document types
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation', // .pptx
      'text/plain',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'image/gif',
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error: 'Invalid file type. Allowed types: PDF, Word, Excel, PowerPoint, Text, Images',
          code: 'INVALID_FILE_TYPE',
        },
        { status: 400 }
      );
    }

    // Validate file size (max 25MB for SignWell)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (file.size > maxSize) {
      return NextResponse.json(
        {
          error: 'File size exceeds 25MB limit',
          code: 'FILE_TOO_LARGE',
        },
        { status: 400 }
      );
    }

    // Parse recipients if provided
    let recipients: Array<{ email: string; name: string }> | undefined;
    if (recipientsJson) {
      try {
        recipients = JSON.parse(recipientsJson);
        if (!Array.isArray(recipients)) {
          recipients = undefined;
        }
      } catch {
        // Invalid JSON, ignore recipients
        recipients = undefined;
      }
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64Data = buffer.toString('base64');

    // Upload document to SignWell
    const result = await signWellClient.uploadDocument(base64Data, name.trim(), recipients);

    return NextResponse.json(
      {
        success: true,
        document: result,
        message: 'Document uploaded successfully to SignWell',
      },
      { status: 200 }
    );
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('POST /api/signwell/upload error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to upload document to SignWell',
        code: 'UPLOAD_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}

