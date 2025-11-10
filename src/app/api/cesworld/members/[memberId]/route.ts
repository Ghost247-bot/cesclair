import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { memberId: string } }
) {
  try {
    const { memberId } = params;

    // Validate memberId is valid integer
    if (!memberId || isNaN(parseInt(memberId))) {
      return NextResponse.json(
        { 
          error: 'Valid member ID is required',
          code: 'INVALID_MEMBER_ID' 
        },
        { status: 400 }
      );
    }

    const id = parseInt(memberId);

    // Check if member exists
    const existingMember = await db
      .select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.id, id))
      .limit(1);

    if (existingMember.length === 0) {
      return NextResponse.json(
        { 
          error: 'Member not found',
          code: 'MEMBER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { annualSpending, points, tier, birthdayMonth, birthdayDay } = body;

    // Build update object
    const updateData: any = {};

    // Handle points update
    if (points !== undefined) {
      if (typeof points !== 'number' || points < 0) {
        return NextResponse.json(
          { 
            error: 'Points must be a valid non-negative number',
            code: 'INVALID_POINTS' 
          },
          { status: 400 }
        );
      }
      updateData.points = points;
    }

    // Handle birthday fields
    if (birthdayMonth !== undefined) {
      if (typeof birthdayMonth !== 'number' || birthdayMonth < 1 || birthdayMonth > 12) {
        return NextResponse.json(
          { 
            error: 'Birthday month must be between 1 and 12',
            code: 'INVALID_BIRTHDAY_MONTH' 
          },
          { status: 400 }
        );
      }
      updateData.birthdayMonth = birthdayMonth;
    }

    if (birthdayDay !== undefined) {
      if (typeof birthdayDay !== 'number' || birthdayDay < 1 || birthdayDay > 31) {
        return NextResponse.json(
          { 
            error: 'Birthday day must be between 1 and 31',
            code: 'INVALID_BIRTHDAY_DAY' 
          },
          { status: 400 }
        );
      }
      updateData.birthdayDay = birthdayDay;
    }

    // Handle annualSpending and automatic tier calculation
    if (annualSpending !== undefined) {
      // Validate annualSpending is a valid positive number
      const spendingAmount = parseFloat(annualSpending);
      
      if (isNaN(spendingAmount) || spendingAmount < 0) {
        return NextResponse.json(
          { 
            error: 'Annual spending must be a valid non-negative number',
            code: 'INVALID_ANNUAL_SPENDING' 
          },
          { status: 400 }
        );
      }

      // Format as decimal string with 2 places
      updateData.annualSpending = spendingAmount.toFixed(2);

      // Calculate tier based on annual spending
      let calculatedTier: string;
      if (spendingAmount < 500) {
        calculatedTier = 'member';
      } else if (spendingAmount < 1000) {
        calculatedTier = 'plus';
      } else {
        calculatedTier = 'premier';
      }

      // Set the calculated tier
      updateData.tier = calculatedTier;

      // Update lastTierUpdate when tier changes
      if (existingMember[0].tier !== calculatedTier) {
        updateData.lastTierUpdate = new Date().toISOString();
      }
    } else if (tier !== undefined) {
      // If tier is provided directly without annualSpending
      const validTiers = ['member', 'plus', 'premier'];
      if (!validTiers.includes(tier)) {
        return NextResponse.json(
          { 
            error: 'Tier must be one of: member, plus, premier',
            code: 'INVALID_TIER' 
          },
          { status: 400 }
        );
      }
      updateData.tier = tier;
      
      // Update lastTierUpdate when tier changes
      if (existingMember[0].tier !== tier) {
        updateData.lastTierUpdate = new Date().toISOString();
      }
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { 
          error: 'No valid fields provided for update',
          code: 'NO_UPDATE_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Update member record in database
    const updated = await db
      .update(CesworldMembers)
      .set(updateData)
      .where(eq(CesworldMembers.id, id))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json(
        { 
          error: 'Failed to update member',
          code: 'UPDATE_FAILED' 
        },
        { status: 500 }
      );
    }

    // Return updated member object
    return NextResponse.json(updated[0], { status: 200 });

  } catch (error: any) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_SERVER_ERROR' 
      },
      { status: 500 }
    );
  }
}