import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contracts, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    // Get session with error handling
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

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if contract exists
    const existingContract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { title, description, amount, status, designId, designerId } = body;

    // Prepare update data
    const updates: {
      title?: string;
      description?: string;
      amount?: string;
      status?: string;
      designId?: number | null;
      designerId?: number;
      awardedAt?: string;
      completedAt?: string;
    } = {};

    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (amount !== undefined) updates.amount = amount || null;
    if (designId !== undefined) updates.designId = designId;
    if (designerId !== undefined) {
      const designerIdInt = parseInt(designerId);
      if (isNaN(designerIdInt)) {
        return NextResponse.json(
          { error: 'designerId must be a valid integer', code: 'INVALID_DESIGNER_ID' },
          { status: 400 }
        );
      }
      updates.designerId = designerIdInt;
    }

    // Handle status updates with timestamp logic
    if (status !== undefined) {
      updates.status = status;

      // Set awardedAt when status changes to 'awarded'
      if (status === 'awarded' && existingContract[0].status !== 'awarded') {
        updates.awardedAt = new Date().toISOString();
      }

      // Set completedAt when status changes to 'completed'
      if (status === 'completed' && existingContract[0].status !== 'completed') {
        updates.completedAt = new Date().toISOString();
      }
    }

    // Validate that we have at least one field to update
    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Perform update
    const updated = await db
      .update(contracts)
      .set(updates)
      .where(eq(contracts.id, parseInt(id)))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const id = params.id;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if contract exists before deleting
    const existingContract = await db
      .select()
      .from(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);

    if (existingContract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete contract
    const deleted = await db
      .delete(contracts)
      .where(eq(contracts.id, parseInt(id)))
      .returning();

    return NextResponse.json(
      {
        message: 'Contract deleted successfully',
        contract: deleted[0]
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

