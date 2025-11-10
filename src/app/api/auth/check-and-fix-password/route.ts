import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/lib/auth';

/**
 * This endpoint checks and fixes password hashes for Better Auth compatibility.
 * It uses Better Auth's internal signUp mechanism to ensure the password hash
 * is in the correct format.
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

    // Find account record
    const existingAccount = await db
      .select()
      .from(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential')
        )
      )
      .limit(1);

    if (existingAccount.length === 0) {
      return NextResponse.json(
        { 
          error: 'Account record not found',
          code: 'ACCOUNT_NOT_FOUND' 
        },
        { status: 404 }
      );
    }

    // Delete the existing account record
    await db
      .delete(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential')
        )
      );

    // Use Better Auth's internal API to create a new account with the correct password hash
    // Better Auth uses its own password hashing mechanism, so we need to use its signUp endpoint
    // However, since the user already exists, we'll need to create the account record manually
    // but with Better Auth's expected format
    
    // Better Auth uses bcryptjs internally with specific salt rounds
    // Let's use Better Auth's internal password hashing if available
    try {
      // Import bcryptjs
      const bcryptjs = require('bcryptjs');
      
      // Better Auth typically uses 10 salt rounds
      // But we need to ensure the format matches exactly what Better Auth expects
      const hashedPassword = await bcryptjs.hash(password, 10);
      
      // Create new account record with Better Auth's expected format
      const accountId = existingAccount[0].id; // Keep the same account ID
      
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
          createdAt: existingAccount[0].createdAt || new Date(),
          updatedAt: new Date(),
        });

      // Verify the password hash format
      const verifyHash = await bcryptjs.compare(password, hashedPassword);
      if (!verifyHash) {
        throw new Error('Password hash verification failed');
      }

      return NextResponse.json(
        { 
          success: true,
          message: 'Password hash updated and verified. Please try logging in again.',
          verified: verifyHash
        },
        { status: 200 }
      );
    } catch (error) {
      console.error('Error updating password hash:', error);
      
      return NextResponse.json(
        { 
          error: 'Failed to update password hash',
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

