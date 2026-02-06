import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { nanoid } from 'nanoid';
import bcryptjs from 'bcryptjs';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL'
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD'
        },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { 
          error: 'Name is required',
          code: 'MISSING_NAME'
        },
        { status: 400 }
      );
    }

    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();

    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { 
          error: 'User with this email already exists',
          code: 'USER_EXISTS'
        },
        { status: 409 }
      );
    }

    // Generate unique user ID
    const userId = nanoid();

    // Hash the password using bcryptjs (Better Auth's format)
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user record
    const newUser = await db
      .insert(user)
      .values({
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        emailVerified: true,
        image: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    // Create account record for credential provider
    await db
      .insert(account)
      .values({
        id: nanoid(),
        accountId: normalizedEmail,
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

    // Return user details without password
    const userResponse = {
      id: newUser[0].id,
      email: newUser[0].email,
      name: newUser[0].name,
      emailVerified: newUser[0].emailVerified,
      image: newUser[0].image,
      createdAt: newUser[0].createdAt,
      updatedAt: newUser[0].updatedAt,
    };

    return NextResponse.json(userResponse, { status: 201 });
  } catch (error) {
    console.error('POST /api/test-user error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_ERROR'
      },
      { status: 500 }
    );
  }
}