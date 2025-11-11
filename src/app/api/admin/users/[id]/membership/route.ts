import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, CesworldMembers, auditLogs } from '@/db/schema';
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

// GET membership info for a user
export async function GET(
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

    // Get membership info for this user
    const membership = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.userId, userId))
      .limit(1);

    if (membership.length === 0) {
      return NextResponse.json(
        { 
          membership: null,
          message: 'User is not a member' 
        },
        { status: 200 }
      );
    }

    return NextResponse.json({ membership: membership[0] }, { status: 200 });
  } catch (error: any) {
    console.error('GET membership error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

// PUT update membership tier for a user
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
    const { tier } = body;

    // Validate tier
    const validTiers = ['member', 'plus', 'premier'];
    if (!tier || !validTiers.includes(tier)) {
      return NextResponse.json(
        { error: 'Invalid tier. Must be one of: member, plus, premier', code: 'INVALID_TIER' },
        { status: 400 }
      );
    }

    // Check if user exists
    const targetUser = await db
      .select({ id: user.id, name: user.name, email: user.email })
      .from(user)
      .where(eq(user.id, userId))
      .limit(1);

    if (targetUser.length === 0) {
      return NextResponse.json(
        { error: 'User not found', code: 'USER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if membership exists
    const existingMembership = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.userId, userId))
      .limit(1);

    let updatedMembership;
    const oldTier = existingMembership.length > 0 ? existingMembership[0].tier : null;

    if (existingMembership.length === 0) {
      // Create new membership if it doesn't exist
      const newMembership = await db
        .insert(CesworldMembers)
        .values({
          userId: userId,
          tier: tier,
          points: 0,
          annualSpending: '0.00',
          joinedAt: sql`now()`,
          lastTierUpdate: sql`now()`,
        })
        .returning();

      updatedMembership = newMembership[0];
    } else {
      // Update existing membership
      const updated = await db
        .update(CesworldMembers)
        .set({
          tier: tier,
          lastTierUpdate: sql`now()`,
        })
        .where(eq(CesworldMembers.userId, userId))
        .returning();

      updatedMembership = updated[0];
    }

    // Create audit log entry
    try {
      const ipAddress = request.headers.get('x-forwarded-for') || 
                       request.headers.get('x-real-ip') || 
                       'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      const auditDetails = JSON.stringify({
        oldTier: oldTier || 'none',
        newTier: tier,
        targetUserEmail: targetUser[0].email,
        targetUserName: targetUser[0].name,
      });

      await db.insert(auditLogs).values({
        action: 'membership_tier_change',
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
        membership: updatedMembership,
        message: 'Membership tier updated successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT membership error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

