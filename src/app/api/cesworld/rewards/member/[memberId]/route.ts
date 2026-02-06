import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldRewards } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ memberId: string }> }
) {
  try {
    const { memberId } = await params;
    
    // Validate memberId
    const memberIdInt = parseInt(memberId);
    if (!memberId || isNaN(memberIdInt) || memberIdInt <= 0) {
      return NextResponse.json(
        { 
          error: 'Valid member ID is required',
          code: 'INVALID_MEMBER_ID'
        },
        { status: 400 }
      );
    }

    // Extract query parameters
    const searchParams = request.nextUrl.searchParams;
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const statusParam = searchParams.get('status');

    // Validate and parse limit (default 50, max 200)
    let limit = 50;
    if (limitParam) {
      const parsedLimit = parseInt(limitParam);
      if (isNaN(parsedLimit) || parsedLimit <= 0) {
        return NextResponse.json(
          {
            error: 'Limit must be a positive integer',
            code: 'INVALID_LIMIT'
          },
          { status: 400 }
        );
      }
      limit = Math.min(parsedLimit, 200);
    }

    // Validate and parse offset (default 0)
    let offset = 0;
    if (offsetParam) {
      const parsedOffset = parseInt(offsetParam);
      if (isNaN(parsedOffset) || parsedOffset < 0) {
        return NextResponse.json(
          {
            error: 'Offset must be a non-negative integer',
            code: 'INVALID_OFFSET'
          },
          { status: 400 }
        );
      }
      offset = parsedOffset;
    }

    // Validate status filter if provided
    const validStatuses = ['active', 'used', 'expired'];
    if (statusParam && !validStatuses.includes(statusParam)) {
      return NextResponse.json(
        {
          error: 'Status must be one of: active, used, expired',
          code: 'INVALID_STATUS'
        },
        { status: 400 }
      );
    }

    // Build query with memberId filter
    let query = db
      .select()
      .from(CesworldRewards)
      .where(eq(CesworldRewards.memberId, memberIdInt));

    // Apply status filter if provided
    if (statusParam) {
      query = db
        .select()
        .from(CesworldRewards)
        .where(
          and(
            eq(CesworldRewards.memberId, memberIdInt),
            eq(CesworldRewards.status, statusParam)
          )
        );
    }

    // Execute query with ordering and pagination
    const rewards = await query
      .orderBy(desc(CesworldRewards.redeemedAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(rewards, { status: 200 });

  } catch (error) {
    console.error('GET rewards error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}