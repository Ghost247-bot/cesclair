import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers, designs, contracts } from '@/db/schema';
import { eq, and, count } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ID is valid integer
    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        {
          error: 'Valid ID is required',
          code: 'INVALID_ID',
        },
        { status: 400 }
      );
    }

    const designerId = parseInt(id);

    // Check if designer exists
    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.id, designerId))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        {
          error: 'Designer not found',
          code: 'DESIGNER_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Query total designs count
    const totalDesignsResult = await db
      .select({ count: count() })
      .from(designs)
      .where(eq(designs.designerId, designerId));

    const totalDesigns = totalDesignsResult[0]?.count || 0;

    // Query contracts awarded count
    const contractsAwardedResult = await db
      .select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.designerId, designerId),
          eq(contracts.status, 'awarded')
        )
      );

    const contractsAwarded = contractsAwardedResult[0]?.count || 0;

    // Query contracts completed count
    const contractsCompletedResult = await db
      .select({ count: count() })
      .from(contracts)
      .where(
        and(
          eq(contracts.designerId, designerId),
          eq(contracts.status, 'completed')
        )
      );

    const contractsCompleted = contractsCompletedResult[0]?.count || 0;

    // Return statistics
    return NextResponse.json(
      {
        designerId: designer[0].id,
        designerName: designer[0].name,
        stats: {
          totalDesigns,
          contractsAwarded,
          contractsCompleted,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}