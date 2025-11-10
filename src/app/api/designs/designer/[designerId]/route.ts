import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designs } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { designerId: string } }
) {
  try {
    const { designerId } = params;

    // Validate designerId
    if (!designerId || isNaN(parseInt(designerId))) {
      return NextResponse.json(
        {
          error: 'Valid designer ID is required',
          code: 'INVALID_DESIGNER_ID',
        },
        { status: 400 }
      );
    }

    const designerIdInt = parseInt(designerId);
    const { searchParams } = new URL(request.url);

    // Pagination
    const limit = Math.min(
      parseInt(searchParams.get('limit') ?? '10'),
      100
    );
    const offset = parseInt(searchParams.get('offset') ?? '0');

    // Filters
    const status = searchParams.get('status');
    const category = searchParams.get('category');

    // Build query conditions
    const conditions = [eq(designs.designerId, designerIdInt)];

    if (status) {
      conditions.push(eq(designs.status, status));
    }

    if (category) {
      conditions.push(eq(designs.category, category));
    }

    // Execute query
    const results = await db
      .select()
      .from(designs)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET designs by designer error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}