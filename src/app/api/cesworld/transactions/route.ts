import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldTransactions, CesworldMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_TRANSACTION_TYPES = ['purchase', 'redeem', 'birthday_reward'] as const;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, type, amount, points, description, orderId } = body;

    // Validate required fields
    if (!memberId) {
      return NextResponse.json(
        { error: 'Member ID is required', code: 'MISSING_MEMBER_ID' },
        { status: 400 }
      );
    }

    if (!type) {
      return NextResponse.json(
        { error: 'Transaction type is required', code: 'MISSING_TYPE' },
        { status: 400 }
      );
    }

    if (!amount) {
      return NextResponse.json(
        { error: 'Amount is required', code: 'MISSING_AMOUNT' },
        { status: 400 }
      );
    }

    if (points === undefined || points === null) {
      return NextResponse.json(
        { error: 'Points is required', code: 'MISSING_POINTS' },
        { status: 400 }
      );
    }

    if (!description) {
      return NextResponse.json(
        { error: 'Description is required', code: 'MISSING_DESCRIPTION' },
        { status: 400 }
      );
    }

    // Validate memberId is valid integer
    const parsedMemberId = parseInt(memberId);
    if (isNaN(parsedMemberId)) {
      return NextResponse.json(
        { error: 'Member ID must be a valid integer', code: 'INVALID_MEMBER_ID' },
        { status: 400 }
      );
    }

    // Validate type is one of allowed values
    if (!VALID_TRANSACTION_TYPES.includes(type)) {
      return NextResponse.json(
        { 
          error: `Transaction type must be one of: ${VALID_TRANSACTION_TYPES.join(', ')}`, 
          code: 'INVALID_TYPE' 
        },
        { status: 400 }
      );
    }

    // Validate amount is valid decimal string
    const amountString = String(amount).trim();
    if (!/^\d+(\.\d{1,2})?$/.test(amountString)) {
      return NextResponse.json(
        { error: 'Amount must be a valid decimal string', code: 'INVALID_AMOUNT' },
        { status: 400 }
      );
    }

    // Validate points is integer
    const parsedPoints = parseInt(points);
    if (isNaN(parsedPoints)) {
      return NextResponse.json(
        { error: 'Points must be a valid integer', code: 'INVALID_POINTS' },
        { status: 400 }
      );
    }

    // Check if member exists
    const member = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.id, parsedMemberId))
      .limit(1);

    if (member.length === 0) {
      return NextResponse.json(
        { error: 'Member not found', code: 'MEMBER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Insert transaction record
    const newTransaction = await db
      .insert(CesworldTransactions)
      .values({
        memberId: parsedMemberId,
        type: type.trim(),
        amount: amountString,
        points: parsedPoints,
        description: description.trim(),
        orderId: orderId ? String(orderId).trim() : null,
        createdAt: new Date().toISOString(),
      })
      .returning();

    return NextResponse.json(newTransaction[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}