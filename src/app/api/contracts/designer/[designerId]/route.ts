import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { contracts } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { designerId: string } }
) {
  try {
    const { designerId } = params;

    // Validate designerId is a valid integer
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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const status = searchParams.get('status');

    // Build query
    let query = db
      .select()
      .from(contracts)
      .where(eq(contracts.designerId, designerIdInt));

    // Apply status filter if provided
    if (status) {
      query = query.where(
        and(
          eq(contracts.designerId, designerIdInt),
          eq(contracts.status, status)
        )
      );
    }

    // Apply pagination
    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET contracts by designer error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}