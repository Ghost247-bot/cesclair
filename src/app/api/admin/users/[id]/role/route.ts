import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, auditLogs } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return { authorized: false, error: 'Not authenticated' };
    }
    
    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated' };
    }

    let userRole = (session.user as any)?.role;
    
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
        return { authorized: false, error: 'Failed to verify user role' };
      }
    }

    if (userRole !== 'admin') {
      return { authorized: false, error: 'Only administrators can access this endpoint' };
    }

    return { authorized: true, userId: session.user.id };
  } catch (error) {
    console.error('Error in checkAdminAccess:', error);
    return { authorized: false, error: 'Authentication check failed' };
  }
}

// PUT update user role
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { id: userId } = await params;
    const body = await request.json();
    const { role: newRole } = body;

    // Validate role
    const validRoles = ['member', 'designer', 'admin'];
    if (!newRole || !validRoles.includes(newRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be one of: member, designer, admin', code: 'INVALID_ROLE' },
        { status: 400 }
      );
    }

    // Prevent admins from removing their own admin role
    if (userId === accessCheck.userId && newRole !== 'admin') {
      return NextResponse.json(
        { error: 'Cannot remove your own admin role', code: 'SELF_ROLE_CHANGE_FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get current user role before update
    const currentUser = await db
      .select({ role: user.role, email: user.email, name: user.name })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (currentUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    const oldRole = currentUser[0].role;

    // Update user role
    const updated = await db
      .update(user)
      .set({ 
        role: newRole,
        updatedAt: sql`now()`,
      })
      .where(eq(user.id, userId))
      .returning();

    // Create audit log entry
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      const auditDetails = JSON.stringify({
        oldRole,
        newRole,
        targetUserEmail: currentUser[0].email,
        targetUserName: currentUser[0].name,
      });

      await db.insert(auditLogs).values({
        action: 'role_change',
        performedBy: accessCheck.userId!,
        targetUserId: userId,
        details: auditDetails,
        ipAddress,
        userAgent,
        createdAt: sql`now()`,
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
    }

    return NextResponse.json(
      { 
        user: updated[0],
        message: 'User role updated successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT role error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

