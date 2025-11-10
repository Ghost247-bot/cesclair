import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import bcryptjs from 'bcryptjs';

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, name, password } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required', code: 'MISSING_USER_ID' },
        { status: 400 }
      );
    }

    // Update user name if provided
    if (name) {
      await db
        .update(user)
        .set({
          name: name.trim(),
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId));
    }

    // Update password if provided
    if (password) {
      // Use bcryptjs (Better Auth's format)
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      await db
        .update(account)
        .set({
          password: hashedPassword,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(account.userId, userId),
            eq(account.providerId, 'credential')
          )
        );
    }

    return NextResponse.json({ success: true, message: 'User updated successfully' }, { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}