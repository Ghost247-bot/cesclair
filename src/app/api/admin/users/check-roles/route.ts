import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user } from '@/db/schema';
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

// GET - Check all user roles and report issues
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Valid roles
    const validRoles = ['member', 'designer', 'admin'];
    
    // Fetch all users with their roles
    const users = await db
      .select({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .orderBy(user.createdAt);

    // Check for issues
    const issues: Array<{
      userId: string;
      email: string;
      name: string;
      currentRole: string | null;
      issue: string;
      suggestedFix: string;
    }> = [];

    const validUsers: Array<{
      userId: string;
      email: string;
      name: string;
      role: string;
    }> = [];

    users.forEach((userData) => {
      const currentRole = userData.role;
      
      if (!currentRole || currentRole.trim() === '') {
        issues.push({
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          currentRole: null,
          issue: 'Role is null or empty',
          suggestedFix: 'member',
        });
      } else if (!validRoles.includes(currentRole)) {
        issues.push({
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          currentRole: currentRole,
          issue: `Invalid role: "${currentRole}"`,
          suggestedFix: 'member',
        });
      } else {
        validUsers.push({
          userId: userData.id,
          email: userData.email,
          name: userData.name,
          role: currentRole,
        });
      }
    });

    // Count by role
    const roleCounts: Record<string, number> = {};
    users.forEach((u) => {
      const role = u.role || 'null';
      roleCounts[role] = (roleCounts[role] || 0) + 1;
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalUsers: users.length,
        validUsers: validUsers.length,
        usersWithIssues: issues.length,
        roleCounts,
      },
      issues,
      validUsers,
    });
  } catch (error) {
    console.error('Error checking user roles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to check user roles',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}

// POST - Fix user roles (set invalid/null roles to 'member')
export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fixAll = false, userIds = [] } = body;

    // Valid roles
    const validRoles = ['member', 'designer', 'admin'];
    
    let usersToFix: Array<{ id: string; email: string; currentRole: string | null }> = [];

    if (fixAll) {
      // Fetch all users with issues
      const allUsers = await db
        .select({
          id: user.id,
          email: user.email,
          role: user.role,
        })
        .from(user);

      usersToFix = allUsers
        .filter((u) => !u.role || u.role.trim() === '' || !validRoles.includes(u.role))
        .map((u) => ({
          id: u.id,
          email: u.email,
          currentRole: u.role || null,
        }));
    } else if (userIds.length > 0) {
      // Fix specific users
      const specificUsers = await db
        .select({
          id: user.id,
          email: user.email,
          role: user.role,
        })
        .from(user)
        .where(sql`${user.id} = ANY(${userIds})`);

      usersToFix = specificUsers
        .filter((u) => !u.role || u.role.trim() === '' || !validRoles.includes(u.role))
        .map((u) => ({
          id: u.id,
          email: u.email,
          currentRole: u.role || null,
        }));
    }

    // Fix users
    const fixedUsers: Array<{ userId: string; email: string; oldRole: string | null; newRole: string }> = [];
    const failedUsers: Array<{ userId: string; email: string; error: string }> = [];

    for (const userToFix of usersToFix) {
      try {
        await db
          .update(user)
          .set({
            role: 'member', // Default to member
            updatedAt: sql`now()`,
          })
          .where(eq(user.id, userToFix.id));

        fixedUsers.push({
          userId: userToFix.id,
          email: userToFix.email,
          oldRole: userToFix.currentRole,
          newRole: 'member',
        });
      } catch (error) {
        failedUsers.push({
          userId: userToFix.id,
          email: userToFix.email,
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }

    return NextResponse.json({
      success: true,
      fixed: fixedUsers.length,
      failed: failedUsers.length,
      fixedUsers,
      failedUsers,
    });
  } catch (error) {
    console.error('Error fixing user roles:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fix user roles',
        code: 'DATABASE_ERROR',
        details: process.env.NODE_ENV === 'development' 
          ? (error instanceof Error ? error.message : String(error))
          : undefined,
      },
      { status: 500 }
    );
  }
}

