import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { CesworldMembers } from '@/db/schema';
import { eq } from 'drizzle-orm';

// Force dynamic rendering - API routes should not be statically generated
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, birthdayMonth, birthdayDay } = body;

    // Validate required field
    if (!userId) {
      return NextResponse.json(
        { 
          error: 'userId is required',
          code: 'MISSING_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate userId is a non-empty string
    if (typeof userId !== 'string' || userId.trim() === '') {
      return NextResponse.json(
        { 
          error: 'userId must be a valid non-empty string',
          code: 'INVALID_USER_ID'
        },
        { status: 400 }
      );
    }

    // Validate birthdayMonth if provided
    if (birthdayMonth !== undefined && birthdayMonth !== null) {
      const monthNum = parseInt(String(birthdayMonth));
      if (isNaN(monthNum) || monthNum < 1 || monthNum > 12) {
        return NextResponse.json(
          { 
            error: 'birthdayMonth must be between 1 and 12',
            code: 'INVALID_BIRTHDAY_MONTH'
          },
          { status: 400 }
        );
      }
    }

    // Validate birthdayDay if provided
    if (birthdayDay !== undefined && birthdayDay !== null) {
      const dayNum = parseInt(String(birthdayDay));
      if (isNaN(dayNum) || dayNum < 1 || dayNum > 31) {
        return NextResponse.json(
          { 
            error: 'birthdayDay must be between 1 and 31',
            code: 'INVALID_BIRTHDAY_DAY'
          },
          { status: 400 }
        );
      }
    }

    // Check if member with this userId already exists
    const existingMember = await db.select()
      .from(CesworldMembers)
      .where(eq(CesworldMembers.userId, userId))
      .limit(1);

    if (existingMember.length > 0) {
      return NextResponse.json(
        { 
          error: 'Member with this userId already exists',
          code: 'DUPLICATE_USER_ID'
        },
        { status: 409 }
      );
    }

    // Generate timestamps as Date objects
    const now = new Date();

    // Prepare insert data
    const insertData: any = {
      userId: userId.trim(),
      tier: 'member',
      points: 0,
      annualSpending: '0.00',
      joinedAt: now,
      lastTierUpdate: now,
    };

    // Add optional birthday fields if provided
    if (birthdayMonth !== undefined && birthdayMonth !== null) {
      insertData.birthdayMonth = parseInt(String(birthdayMonth));
    }

    if (birthdayDay !== undefined && birthdayDay !== null) {
      insertData.birthdayDay = parseInt(String(birthdayDay));
    }

    // Insert new member
    const newMember = await db.insert(CesworldMembers)
      .values(insertData)
      .returning();

    return NextResponse.json(newMember[0], { status: 201 });

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}