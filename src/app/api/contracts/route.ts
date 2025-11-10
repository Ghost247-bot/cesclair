import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts, designers, designs } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');
    const designerId = searchParams.get('designerId');

    let query = db.select().from(contracts);

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

    const results = await query.limit(limit).offset(offset);

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