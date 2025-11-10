import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

/**
 * This endpoint fixes existing users created with manual bcrypt hashing
 * by deleting their account record so they can re-register through Better Auth.
 * 
 * Better Auth expects passwords to be hashed in its own format.
 * Users created through Better Auth's signUp endpoint will work correctly.
 * 
 * For existing users created manually, they need to:
 * 1. Delete their account record (this endpoint)
 * 2. Re-register through Better Auth's signUp endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
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

    // Delete the account record first
    await db
      .delete(account)
      .where(
        and(
          eq(account.userId, userId),
          eq(account.providerId, 'credential')
        )
      );

    // Delete the user record so they can re-register through Better Auth
    await db
      .delete(user)
      .where(eq(user.id, userId));

    return NextResponse.json(
      { 
        success: true,
        message: 'User and account records deleted. Please re-register through the signup endpoint to use Better Auth.',
        instructions: 'Go to /cesworld/register and create a new account with the same email. Better Auth will create both the user and account records with the correct password hash format.'
      },
      { status: 200 }
    );
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

