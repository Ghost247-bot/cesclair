import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { contracts, designers, designs, user } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

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

export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const designerId = searchParams.get('designerId');

    // Build query with joins to include designer information
    let query = db
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
        },
      })
      .from(contracts)
      .leftJoin(designers, eq(contracts.designerId, designers.id));

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(contracts.title, `%${search}%`),
          like(contracts.description, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(contracts.status, status));
    }

    if (designerId) {
      const designerIdInt = parseInt(designerId);
      if (!isNaN(designerIdInt)) {
        conditions.push(eq(contracts.designerId, designerIdInt));
      }
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(contracts.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

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
    const { designerId, designId, title, description, amount, status } = body;

    // Validate required fields
    if (!designerId) {
      return NextResponse.json(
        { error: 'designerId is required', code: 'MISSING_DESIGNER_ID' },
        { status: 400 }
      );
    }

    if (!title || title.trim() === '') {
      return NextResponse.json(
        { error: 'title is required', code: 'MISSING_TITLE' },
        { status: 400 }
      );
    }

    // Validate designerId is a valid integer
    const designerIdInt = parseInt(designerId);
    if (isNaN(designerIdInt)) {
      return NextResponse.json(
        { error: 'designerId must be a valid integer', code: 'INVALID_DESIGNER_ID' },
        { status: 400 }
      );
    }

    // Validate designerId exists in designers table
    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.id, designerIdInt))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'DESIGNER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Validate designId if provided
    let designIdInt = null;
    if (designId !== undefined && designId !== null) {
      designIdInt = parseInt(designId);
      if (isNaN(designIdInt)) {
        return NextResponse.json(
          { error: 'designId must be a valid integer', code: 'INVALID_DESIGN_ID' },
          { status: 400 }
        );
      }

      const design = await db
        .select()
        .from(designs)
        .where(eq(designs.id, designIdInt))
        .limit(1);

      if (design.length === 0) {
        return NextResponse.json(
          { error: 'Design not found', code: 'DESIGN_NOT_FOUND' },
          { status: 404 }
        );
      }
    }

    // Prepare insert data
    const now = new Date().toISOString();
    const contractStatus = status || 'pending';
    
    const insertData: any = {
      designerId: designerIdInt,
      designId: designIdInt,
      title: title.trim(),
      description: description ? description.trim() : null,
      amount: amount || null,
      status: contractStatus,
      createdAt: now,
    };

    // Set awardedAt if status is 'awarded'
    if (contractStatus === 'awarded') {
      insertData.awardedAt = now;
    }

    // Set completedAt if status is 'completed'
    if (contractStatus === 'completed') {
      insertData.completedAt = now;
    }

    const newContract = await db
      .insert(contracts)
      .values(insertData)
      .returning();

    return NextResponse.json(newContract[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

