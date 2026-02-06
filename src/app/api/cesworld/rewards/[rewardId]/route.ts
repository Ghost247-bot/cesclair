import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldRewards } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function PUT(
  request: NextRequest,
  { params }: { params: { rewardId: string } }
) {
  try {
    const { rewardId } = params;

    // Validate rewardId is valid integer
    if (!rewardId || isNaN(parseInt(rewardId))) {
      return NextResponse.json(
        {
          error: 'Valid reward ID is required',
          code: 'INVALID_REWARD_ID',
        },
        { status: 400 }
      );
    }

    const id = parseInt(rewardId);

    // Check if reward exists
    const existingReward = await db
      .select()
      .from(CesworldRewards)
      .where(eq(CesworldRewards.id, id))
      .limit(1);

    if (existingReward.length === 0) {
      return NextResponse.json(
        {
          error: 'Reward not found',
          code: 'REWARD_NOT_FOUND',
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { status } = body;

    // Validate status is required
    if (!status) {
      return NextResponse.json(
        {
          error: 'Status is required',
          code: 'MISSING_STATUS',
        },
        { status: 400 }
      );
    }

    // Validate status is one of allowed values
    const validStatuses = ['active', 'used', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        {
          error: 'Status must be one of: active, used, expired',
          code: 'INVALID_STATUS',
        },
        { status: 400 }
      );
    }

    // Build update object
    const updateData: {
      status: string;
      usedAt?: string;
    } = {
      status,
    };

    // If status is 'used' and usedAt is currently null, set usedAt to current timestamp
    if (status === 'used' && !existingReward[0].usedAt) {
      updateData.usedAt = new Date().toISOString();
    }

    // Update reward record
    const updatedReward = await db
      .update(CesworldRewards)
      .set(updateData)
      .where(eq(CesworldRewards.id, id))
      .returning();

    if (updatedReward.length === 0) {
      return NextResponse.json(
        {
          error: 'Failed to update reward',
          code: 'UPDATE_FAILED',
        },
        { status: 500 }
      );
    }

    return NextResponse.json(updatedReward[0], { status: 200 });
  } catch (error) {
    console.error('PUT reward error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error: ' + (error as Error).message,
        code: 'INTERNAL_SERVER_ERROR',
      },
      { status: 500 }
    );
  }
}