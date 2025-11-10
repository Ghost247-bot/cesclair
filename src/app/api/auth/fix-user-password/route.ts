import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

/**
 * This endpoint automatically fixes users with incompatible password hashes
 * by using Better Auth's internal signUp mechanism to recreate the account
 * with the correct password hash format.
 * 
 * Note: This requires the user's password to be provided, as we can't retrieve
 * the original password from the hash.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { 
          error: 'Email and password are required',
          code: 'MISSING_FIELDS' 
        },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase();

    // Find user
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length === 0) {
      return NextResponse.json(
        { 
          error: 'User not found',
          code: 'USER_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    const userId = existingUser[0].id;
    const userName = existingUser[0].name;

    // Delete the account record first
    await db
      .delete(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential')
        )
      );

    // Use Better Auth's internal API to create a new account record
    // We'll use the signUp endpoint internally
    try {
      // Better Auth uses bcryptjs internally, not bcrypt
      // We need to use bcryptjs to match Better Auth's format
      const bcryptjs = require('bcryptjs');
      // Use the same salt rounds as Better Auth (default is 10)
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      // Create account record with Better Auth's expected format
      const accountId = nanoid();
      
      await db
        .insert(account)
        .values({
          id: accountId,
          accountId: normalizedEmail, // Better Auth uses email as accountId for credential
          providerId: 'credential',
          userId: userId,
          password: hashedPassword,
          accessToken: null,
          refreshToken: null,
          idToken: null,
          accessTokenExpiresAt: null,
          refreshTokenExpiresAt: null,
          scope: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        });

      return NextResponse.json(
        { 
          success: true,
          message: 'Password hash updated. Please try logging in again.',
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating password hash:', error);
      
      // If that doesn't work, the user needs to re-register
      return NextResponse.json(
        { 
          error: 'Failed to update password hash automatically',
          code: 'UPDATE_FAILED',
          solution: 'Please delete your account and re-register through Better Auth',
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        code: 'INTERNAL_ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

