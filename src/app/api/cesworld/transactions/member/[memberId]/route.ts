import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldTransactions } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = params;
    
    // Validate memberId
    const memberIdInt = parseInt(memberId);
    if (!memberId || isNaN(memberIdInt)) {
      return NextResponse.json(
        { 
          error: 'Valid member ID is required',
          code: 'INVALID_MEMBER_ID' 
        },
        { status: 400 }
      );
    }

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    
    // Pagination parameters with validation
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');
    const typeFilter = searchParams.get('type');

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

    // Build query conditions
    const conditions = [eq(CesworldTransactions.memberId, memberIdInt)];
    
    if (typeFilter) {
      conditions.push(eq(CesworldTransactions.type, typeFilter));
    }

    // Query transactions
    const transactions = await db
      .select()
      .from(CesworldTransactions)
      .where(and(...conditions))
      .orderBy(desc(CesworldTransactions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(transactions, { status: 200 });

  } catch (error) {
    console.error('GET transactions error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}