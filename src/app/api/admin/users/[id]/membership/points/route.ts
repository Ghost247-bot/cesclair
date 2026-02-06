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

// PUT update points and spending for a user's membership
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
    const { points, annualSpending } = body;

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
    const oldPoints = existingMembership.length > 0 ? existingMembership[0].points : 0;
    const oldSpending = existingMembership.length > 0 ? existingMembership[0].annualSpending : '0.00';

    // Validate points if provided
    if (points !== undefined) {
      if (typeof points !== 'number' || points < 0 || !Number.isInteger(points)) {
        return NextResponse.json(
          { error: 'Points must be a valid non-negative integer', code: 'INVALID_POINTS' },
          { status: 400 }
        );
      }
    }

    // Validate annualSpending if provided
    if (annualSpending !== undefined) {
      const spendingAmount = parseFloat(annualSpending);
      if (isNaN(spendingAmount) || spendingAmount < 0) {
        return NextResponse.json(
          { error: 'Annual spending must be a valid non-negative number', code: 'INVALID_SPENDING' },
          { status: 400 }
        );
      }
    }

    const updateData: any = {};

    if (points !== undefined) {
      updateData.points = points;
    }

    if (annualSpending !== undefined) {
      updateData.annualSpending = parseFloat(annualSpending).toFixed(2);
      
      // Recalculate tier based on annual spending
      const spendingAmount = parseFloat(annualSpending);
      let calculatedTier: string;
      if (spendingAmount < 500) {
        calculatedTier = 'member';
      } else if (spendingAmount < 1000) {
        calculatedTier = 'plus';
      } else {
        calculatedTier = 'premier';
      }

      // Update tier if it changed
      if (existingMembership.length === 0 || existingMembership[0].tier !== calculatedTier) {
        updateData.tier = calculatedTier;
        updateData.lastTierUpdate = sql`now()`;
      }
    }

    if (existingMembership.length === 0) {
      // Create new membership if it doesn't exist
      const newMembership = await db
        .insert(CesworldMembers)
        .values({
          userId: userId,
          tier: updateData.tier || 'member',
          points: updateData.points !== undefined ? updateData.points : 0,
          annualSpending: updateData.annualSpending || '0.00',
          joinedAt: sql`now()`,
          lastTierUpdate: sql`now()`,
        })
        .returning();

      updatedMembership = newMembership[0];
    } else {
      // Update existing membership
      const updated = await db
        .update(CesworldMembers)
        .set(updateData)
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
      
      const auditDetails: any = {
        targetUserEmail: targetUser[0].email,
        targetUserName: targetUser[0].name,
      };

      if (points !== undefined && points !== oldPoints) {
        auditDetails.oldPoints = oldPoints;
        auditDetails.newPoints = points;
      }

      if (annualSpending !== undefined && annualSpending !== oldSpending) {
        auditDetails.oldSpending = oldSpending;
        auditDetails.newSpending = updateData.annualSpending;
      }

      await db.insert(auditLogs).values({
        action: 'membership_points_spending_update',
        performedBy: accessCheck.userId!,
        targetUserId: userId,
        details: JSON.stringify(auditDetails),
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
        message: 'Membership points and spending updated successfully' 
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('PUT points/spending error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error.message },
      { status: 500 }
    );
  }
}

