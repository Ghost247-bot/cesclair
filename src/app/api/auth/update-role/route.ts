import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    // Get session with error handling
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

    // Parse request body with error handling
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      return NextResponse.json(
        { error: 'Invalid request body', code: 'INVALID_BODY' },
        { status: 400 }
      );
    }

    const { role } = body;

    // Validate role
    const validRoles = ['member', 'admin', 'designer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: member, admin, designer', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Update user role in database with error handling
    try {
      await db
        .update(user)
        .set({ role, updatedAt: new Date() })
        .where(eq(user.id, session.user.id));
    } catch (dbError) {
      console.error('Database error updating role:', dbError);
      return NextResponse.json(
        { 
          error: 'Failed to update role',
          code: 'DATABASE_ERROR'
        },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Role updated successfully',
        role
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST update role error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    // Return appropriate error based on error type
    if (errorMessage.includes('auth') || errorMessage.includes('session') || errorMessage.includes('unauthorized')) {
      return NextResponse.json(
        { 
          error: 'Not authenticated',
          code: 'UNAUTHORIZED' 
        },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}
