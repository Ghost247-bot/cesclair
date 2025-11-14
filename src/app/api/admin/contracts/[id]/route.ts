import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contracts, user, designers } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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

    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Fetch contract by ID with designer information
    const contract = await db
      .select({
        id: contracts.id,
        designerId: contracts.designerId,
        designId: contracts.designId,
        title: contracts.title,
        description: contracts.description,
        amount: contracts.amount,
        status: contracts.status,
        awardedAt: contracts.awardedAt,
        completedAt: contracts.completedAt,
        createdAt: contracts.createdAt,
        envelopeId: contracts.envelopeId,
        envelopeStatus: contracts.envelopeStatus,
        signedAt: contracts.signedAt,
        envelopeUrl: contracts.envelopeUrl,
        designer: {
          id: designers.id,
          name: designers.name,
          email: designers.email,
          bio: designers.bio,
          avatarUrl: designers.avatarUrl,
        },
      })
      .from(contracts)
      .leftJoin(designers, eq(contracts.designerId, designers.id))
      .where(eq(contracts.id, parseInt(id)))
      .limit(1);
    
    // Add contractFileUrl as null since column doesn't exist in database
    if (contract.length > 0) {
      (contract[0] as any).contractFileUrl = null;
    }

    if (contract.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(contract[0], { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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

    const { id } = await params;

    // Validate ID
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if contract exists - select only columns that exist
    const existingContract = await db
      .select({
        id: contracts.id,
        designerId: contracts.designerId,
        designId: contracts.designId,
        title: contracts.title,
        description: contracts.description,
        amount: contracts.amount,
        status: contracts.status,
        awardedAt: contracts.awardedAt,
        completedAt: contracts.completedAt,
        createdAt: contracts.createdAt,
        envelopeId: contracts.envelopeId,
        envelopeStatus: contracts.envelopeStatus,
        signedAt: contracts.signedAt,
        envelopeUrl: contracts.envelopeUrl,
      })
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
    let body;
    try {
      body = await request.json();
    } catch (jsonError) {
      console.error('JSON parse error:', jsonError);
      return NextResponse.json(
        { error: 'Invalid JSON in request body', code: 'INVALID_JSON' },
        { status: 400 }
      );
    }
    
    const { title, description, amount, status, designId, designerId, contractFileUrl } = body;

    // Prepare update data - use Record to allow sql template
    // Only include fields that exist in the database
    const updates: Record<string, any> = {};
    
    // Remove contractFileUrl if present (column doesn't exist in DB)
    if (contractFileUrl !== undefined) {
      console.warn('contractFileUrl field ignored - column does not exist in database');
    }

    if (title !== undefined && title !== null) {
      const trimmedTitle = String(title).trim();
      if (trimmedTitle.length === 0) {
        return NextResponse.json(
          { error: 'Title cannot be empty', code: 'INVALID_TITLE' },
          { status: 400 }
        );
      }
      updates.title = trimmedTitle;
    }
    if (description !== undefined) updates.description = description ? String(description).trim() || null : null;
    if (amount !== undefined) updates.amount = amount ? String(amount) : null;
    
    // Handle designId - can be number, string, or null/empty
    if (designId !== undefined) {
      if (designId === null || designId === '' || designId === 0) {
        updates.designId = null;
      } else {
        const designIdNum = typeof designId === 'number' ? designId : parseInt(String(designId));
        if (isNaN(designIdNum)) {
          return NextResponse.json(
            { error: 'designId must be a valid integer', code: 'INVALID_DESIGN_ID' },
            { status: 400 }
          );
        }
        updates.designId = designIdNum;
      }
    }
    
    // Handle designerId - can be number or string
    if (designerId !== undefined) {
      if (designerId === null || designerId === '' || designerId === 0) {
        return NextResponse.json(
          { error: 'designerId is required and cannot be empty', code: 'INVALID_DESIGNER_ID' },
          { status: 400 }
        );
      }
      const designerIdNum = typeof designerId === 'number' ? designerId : parseInt(String(designerId));
      if (isNaN(designerIdNum)) {
        return NextResponse.json(
          { error: 'designerId must be a valid integer', code: 'INVALID_DESIGNER_ID' },
          { status: 400 }
        );
      }
      
      // Verify designer exists
      try {
        const designerExists = await db
          .select({ id: designers.id })
          .from(designers)
          .where(eq(designers.id, designerIdNum))
          .limit(1);
        
        if (designerExists.length === 0) {
          return NextResponse.json(
            { error: 'Designer not found', code: 'DESIGNER_NOT_FOUND' },
            { status: 400 }
          );
        }
      } catch (verifyError) {
        console.error('Error verifying designer:', verifyError);
        // Continue with update if verification fails (non-critical)
      }
      
      updates.designerId = designerIdNum;
    }

    // Handle status updates with timestamp logic
    if (status !== undefined && status !== null) {
      const currentStatus = existingContract[0]?.status || 'pending';
      updates.status = String(status);

      // Set awardedAt when status changes to 'awarded' (only if not already set)
      if (status === 'awarded' && currentStatus !== 'awarded') {
        updates.awardedAt = sql`now()`;
      }

      // Set completedAt when status changes to 'completed' (only if not already set)
      if (status === 'completed' && currentStatus !== 'completed') {
        updates.completedAt = sql`now()`;
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
    try {
      // Log updates for debugging (handle sql templates and Date objects)
      const logUpdates: any = {};
      for (const [key, value] of Object.entries(updates)) {
        if (value && typeof value === 'object' && 'sql' in value) {
          logUpdates[key] = '[SQL Template]';
        } else if (value instanceof Date) {
          logUpdates[key] = value.toISOString();
        } else {
          logUpdates[key] = value;
        }
      }
      console.log('Updating contract ID:', id);
      console.log('Update data:', JSON.stringify(logUpdates, null, 2));
      console.log('Updates object keys:', Object.keys(updates));
      
      // Ensure we only update fields that exist in the database
      const safeUpdates: Record<string, any> = {};
      const allowedFields = ['title', 'description', 'amount', 'status', 'designId', 'designerId', 'awardedAt', 'completedAt'];
      
      for (const [key, value] of Object.entries(updates)) {
        if (allowedFields.includes(key)) {
          safeUpdates[key] = value;
        } else {
          console.warn(`Skipping field ${key} - not in allowed fields list`);
        }
      }
      
      if (Object.keys(safeUpdates).length === 0) {
        return NextResponse.json(
          { error: 'No valid fields to update after filtering', code: 'NO_VALID_UPDATES' },
          { status: 400 }
        );
      }
      
      const updated = await db
        .update(contracts)
        .set(safeUpdates)
        .where(eq(contracts.id, parseInt(id)))
        .returning({
          id: contracts.id,
          designerId: contracts.designerId,
          designId: contracts.designId,
          title: contracts.title,
          description: contracts.description,
          amount: contracts.amount,
          status: contracts.status,
          awardedAt: contracts.awardedAt,
          completedAt: contracts.completedAt,
          createdAt: contracts.createdAt,
          envelopeId: contracts.envelopeId,
          envelopeStatus: contracts.envelopeStatus,
          signedAt: contracts.signedAt,
          envelopeUrl: contracts.envelopeUrl,
        });
      
      // Add contractFileUrl as null since column doesn't exist
      if (updated.length > 0) {
        (updated[0] as any).contractFileUrl = null;
      }

      if (updated.length === 0) {
        return NextResponse.json(
          { error: 'Contract not found', code: 'NOT_FOUND' },
          { status: 404 }
        );
      }

      return NextResponse.json(updated[0], { status: 200 });
    } catch (dbError: any) {
      console.error('Database update error:', dbError);
      console.error('Error details:', {
        message: dbError?.message,
        code: dbError?.code,
        detail: dbError?.detail,
        constraint: dbError?.constraint,
        hint: dbError?.hint,
        position: dbError?.position,
        stack: dbError?.stack
      });
      
      // Check for missing column errors
      if (dbError?.code === '42703') {
        return NextResponse.json(
          { 
            error: 'Database schema error: ' + (dbError.message || 'Column does not exist'),
            code: 'SCHEMA_ERROR',
            dbCode: dbError.code
          },
          { status: 500 }
        );
      }
      
      // Check for constraint violations
      if (dbError?.code === '23503') {
        return NextResponse.json(
          { error: 'Invalid designer or design reference', code: 'FOREIGN_KEY_VIOLATION' },
          { status: 400 }
        );
      }
      
      // Check for other PostgreSQL errors
      if (dbError?.code) {
        return NextResponse.json(
          { 
            error: 'Database error: ' + (dbError.message || 'Unknown database error'),
            code: 'DATABASE_ERROR',
            dbCode: dbError.code,
            detail: dbError?.detail
          },
          { status: 500 }
        );
      }
      throw dbError; // Re-throw to be caught by outer catch
    }
  } catch (error) {
    console.error('PUT error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;
    console.error('Full error stack:', errorStack);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + errorMessage,
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
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

    const { id } = await params;

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

