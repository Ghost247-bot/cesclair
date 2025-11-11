import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldRewards, CesworldMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { memberId, rewardType, pointsCost, amountOff } = body;

    // Validate required fields
    if (!memberId) {
      return NextResponse.json({ 
        error: "memberId is required",
        code: "MISSING_MEMBER_ID" 
      }, { status: 400 });
    }

    if (!rewardType) {
      return NextResponse.json({ 
        error: "rewardType is required",
        code: "MISSING_REWARD_TYPE" 
      }, { status: 400 });
    }

    if (!pointsCost) {
      return NextResponse.json({ 
        error: "pointsCost is required",
        code: "MISSING_POINTS_COST" 
      }, { status: 400 });
    }

    if (!amountOff) {
      return NextResponse.json({ 
        error: "amountOff is required",
        code: "MISSING_AMOUNT_OFF" 
      }, { status: 400 });
    }

    // Validate memberId is valid integer
    const memberIdInt = parseInt(memberId);
    if (isNaN(memberIdInt)) {
      return NextResponse.json({ 
        error: "memberId must be a valid integer",
        code: "INVALID_MEMBER_ID" 
      }, { status: 400 });
    }

    // Check if member exists
    const member = await db.select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.id, memberIdInt))
      .limit(1);

    if (member.length === 0) {
      return NextResponse.json({ 
        error: "Member not found",
        code: "MEMBER_NOT_FOUND" 
      }, { status: 404 });
    }

    // Validate rewardType
    const validRewardTypes = ['discount', 'free_shipping', 'birthday_gift'];
    if (!validRewardTypes.includes(rewardType)) {
      return NextResponse.json({ 
        error: "rewardType must be one of: discount, free_shipping, birthday_gift",
        code: "INVALID_REWARD_TYPE" 
      }, { status: 400 });
    }

    // Validate pointsCost is positive integer
    const pointsCostInt = parseInt(pointsCost);
    if (isNaN(pointsCostInt) || pointsCostInt <= 0) {
      return NextResponse.json({ 
        error: "pointsCost must be a positive integer",
        code: "INVALID_POINTS_COST" 
      }, { status: 400 });
    }

    // Validate amountOff is valid decimal string
    const amountOffStr = String(amountOff);
    const amountOffFloat = parseFloat(amountOffStr);
    if (isNaN(amountOffFloat) || amountOffFloat < 0) {
      return NextResponse.json({ 
        error: "amountOff must be a valid decimal string",
        code: "INVALID_AMOUNT_OFF" 
      }, { status: 400 });
    }

    // Generate timestamps
    const now = new Date();
    const redeemedAt = now.toISOString();
    
    // Calculate expiresAt (90 days from now)
    const expiresDate = new Date(now);
    expiresDate.setDate(expiresDate.getDate() + 90);
    const expiresAt = expiresDate.toISOString();

    // Insert reward record
    const newReward = await db.insert(CesworldRewards)
      .values({
        memberId: memberIdInt,
        rewardType,
        pointsCost: pointsCostInt,
        amountOff: amountOffStr,
        status: 'active',
        redeemedAt,
        usedAt: null,
        expiresAt
      })
      .returning();

    return NextResponse.json(newReward[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}