import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { user, account } from '@/db/schema';
import { nanoid } from 'nanoid';
import bcryptjs from 'bcryptjs';
import { eq, and } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const email = body.email || 'rogerbeaudry@yahoo.com';
    const password = body.password || 'Gold4me.471@1761';
    const name = body.name || 'Admin User';
    
    // Normalize email to lowercase
    const normalizedEmail = email.trim().toLowerCase();
    
    // Hash the password using bcryptjs (Better Auth's format)
    const hashedPassword = await bcryptjs.hash(password, 10);
    
    // Check if user already exists
    const existingUser = await db
      .select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    const userExists = existingUser.length > 0;
    let userId: string;
    let userResponse;

    if (userExists) {
      // User exists - update role to admin and password
      userId = existingUser[0].id;
      
      // Update user role to admin
      const updatedUser = await db
        .update(user)
        .set({
          role: 'admin',
          name: name.trim(),
          emailVerified: true,
          updatedAt: new Date(),
        })
        .where(eq(user.id, userId))
        .returning();
      
      userResponse = updatedUser[0];

      // Update or create account credentials
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

      if (existingAccount.length > 0) {
        // Update existing account password
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
      } else {
        // Create new account record
        const accountId = nanoid();
        await db.insert(account).values({
          id: accountId,
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
      }
    } else {
      // User doesn't exist - create new user with admin role
      userId = nanoid();
      
      const newUser = await db
        .insert(user)
        .values({
          id: userId,
          name: name.trim(),
          email: normalizedEmail,
          emailVerified: true,
          role: 'admin',
          image: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        })
        .returning();

      if (newUser.length === 0) {
        return NextResponse.json(
          { error: 'Failed to create user', code: 'USER_CREATION_FAILED' },
          { status: 500 }
        );
      }

      userResponse = newUser[0];

      // Create account credentials
      const accountId = nanoid();
      await db.insert(account).values({
        id: accountId,
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
    }
    
    return NextResponse.json(
      { 
        message: userExists 
          ? 'User updated to admin successfully' 
          : 'Admin user created successfully',
        user: userResponse 
      },
      { status: userExists ? 200 : 201 }
    );
    
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error'),
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
  }
}