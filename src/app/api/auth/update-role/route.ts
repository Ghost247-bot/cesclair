import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, auditLogs } from '@/db/schema';
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

    const { role, userId: targetUserId } = body;

    // Validate role
    const validRoles = ['member', 'admin', 'designer'];
    if (!role || !validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: member, admin, designer', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // SECURITY: Only admins can update roles
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
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        return NextResponse.json(
          { 
            error: 'Failed to verify admin permissions',
            code: 'PERMISSION_CHECK_FAILED'
          },
          { status: 500 }
        );
      }
    }

    // Check if user is admin
    if (userRole !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Only administrators can update user roles',
          code: 'FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Determine which user's role to update
    // If targetUserId is provided, update that user's role (admin updating another user)
    // Otherwise, this shouldn't happen, but we'll default to the session user for safety
    const userIdToUpdate = targetUserId || session.user.id;

    // Prevent admins from removing their own admin role (safety check)
    if (userIdToUpdate === session.user.id && role !== 'admin') {
      return NextResponse.json(
        { 
          error: 'Cannot remove your own admin role',
          code: 'SELF_ROLE_CHANGE_FORBIDDEN'
        },
        { status: 403 }
      );
    }

    // Get current user role before update for audit log
    const currentUser = await db
      .select({ role: user.role, email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userIdToUpdate))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const oldRole = currentUser[0].role;

    // Update user role in database with error handling
    try {
      await db
        .update(user)
        .set({ role, updatedAt: new Date() })
        .where(eq(user.id, userIdToUpdate));
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

    // Create audit log entry
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      const auditDetails = JSON.stringify({
        oldRole,
        newRole: role,
        targetUserEmail: currentUser[0].email,
        targetUserName: currentUser[0].name,
      });

      await db.insert(auditLogs).values({
        action: 'role_change',
        performedBy: session.user.id,
        targetUserId: userIdToUpdate,
        details: auditDetails,
        ipAddress,
        userAgent,
        createdAt: new Date(),
      });
    } catch (auditError) {
      // Log error but don't fail the request
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Role updated successfully',
        role,
        userId: userIdToUpdate
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
