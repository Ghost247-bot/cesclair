import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers, user, account } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import bcryptjs from 'bcryptjs';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';

// GET - List approved designers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    // Build query - always filter for approved designers
    const baseQuery = db.select({
      id: designers.id,
      name: designers.name,
      email: designers.email,
      bio: designers.bio,
      portfolioUrl: designers.portfolioUrl,
      specialties: designers.specialties,
      status: designers.status,
      avatarUrl: designers.avatarUrl,
      createdAt: designers.createdAt,
      updatedAt: designers.updatedAt,
    }).from(designers);

    // Apply filters: must be approved AND (if search provided) match search criteria
    let whereCondition = eq(designers.status, 'approved');
    
    if (search) {
      whereCondition = and(
        eq(designers.status, 'approved'),
        or(
          like(designers.name, `%${search}%`),
          like(designers.email, `%${search}%`),
          like(designers.specialties, `%${search}%`)
        )
      );
    }

    const results = await baseQuery
      .where(whereCondition)
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('GET /api/designers error:', {
      message: errorMessage,
      stack: errorStack,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
    
    // Check if it's a database connection error
    const isDatabaseError = 
      errorMessage.includes('database') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Pool') ||
      errorMessage.includes('neon') ||
      errorMessage.includes('postgres');
    
    return NextResponse.json(
      { 
        error: isDatabaseError ? 'Database connection error' : 'Internal server error',
        message: isDatabaseError 
          ? 'Unable to connect to the database. Please try again later.'
          : errorMessage,
        code: isDatabaseError ? 'DATABASE_ERROR' : 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}

// POST - Create new designer (application)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password, bio, portfolioUrl, specialties, avatarUrl } = body;

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    const normalizedEmail = email.toLowerCase().trim();

    // Check if email already exists in designers table
    const existingDesigner = await db.select()
      .from(designers)
      .where(eq(designers.email, normalizedEmail))
      .limit(1);

    if (existingDesigner.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Check if email already exists in user table
    const existingUser = await db.select()
      .from(user)
      .where(eq(user.email, normalizedEmail))
      .limit(1);

    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'Email already registered. Please use the regular login.', code: 'EMAIL_EXISTS' },
        { status: 409 }
      );
    }

    // Create user account with better-auth (role: designer)
    const userId = nanoid();
    const accountId = nanoid();
    const now = new Date();
    
    console.log('Creating designer application:', {
      userId,
      email: normalizedEmail,
      hasName: !!name,
      hasPassword: !!password,
    });
    
    try {
      // Hash password with bcryptjs for better-auth (same as better-auth uses)
      const hashedPassword = await bcryptjs.hash(password, 10);
      console.log('Password hashed for better-auth');

      // Create user account
      console.log('Inserting user...');
      await db.insert(user).values({
        id: userId,
        name: name.trim(),
        email: normalizedEmail,
        role: 'designer',
        emailVerified: false,
        createdAt: now,
        updatedAt: now,
      });
      console.log('User inserted successfully');

      // Create account credentials for better-auth
      console.log('Inserting account...');
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
        createdAt: now,
        updatedAt: now,
      });
      console.log('Account inserted successfully');

      // Hash password with bcrypt for designers table (legacy compatibility)
      const designerHashedPassword = await bcrypt.hash(password, 10);
      console.log('Password hashed for designers table');

      // Create designer profile
      console.log('Inserting designer...');
      const newDesigner = await db.insert(designers)
        .values({
          name: name.trim(),
          email: normalizedEmail,
          password: designerHashedPassword,
          bio: bio?.trim() || null,
          portfolioUrl: portfolioUrl?.trim() || null,
          specialties: specialties?.trim() || null,
          status: 'pending',
          avatarUrl: avatarUrl?.trim() || null,
          createdAt: now,
          updatedAt: now,
        })
        .returning({
          id: designers.id,
          name: designers.name,
          email: designers.email,
          bio: designers.bio,
          portfolioUrl: designers.portfolioUrl,
          specialties: designers.specialties,
          status: designers.status,
          avatarUrl: designers.avatarUrl,
          createdAt: designers.createdAt,
          updatedAt: designers.updatedAt,
        });
      console.log('Designer inserted successfully');

      return NextResponse.json(newDesigner[0], { status: 201 });
    } catch (dbError) {
      // If user was created but account or designer failed, try to clean up
      console.error('Database operation failed, attempting cleanup...');
      try {
        await db.delete(user).where(eq(user.id, userId));
        console.log('Cleaned up user record');
      } catch (cleanupError) {
        console.error('Cleanup failed:', cleanupError);
      }
      throw dbError; // Re-throw to be caught by outer catch
    }

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('POST /api/designers error:', {
      message: errorMessage,
      stack: errorStack,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
    
    // Check if it's a database connection error
    const isDatabaseError = 
      errorMessage.includes('database') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Pool') ||
      errorMessage.includes('neon') ||
      errorMessage.includes('postgres') ||
      errorMessage.includes('relation') ||
      errorMessage.includes('does not exist');
    
    // Check for constraint violations
    const isConstraintError = 
      errorMessage.includes('unique') ||
      errorMessage.includes('duplicate') ||
      errorMessage.includes('constraint');
    
    return NextResponse.json(
      { 
        error: isDatabaseError 
          ? 'Database connection error' 
          : isConstraintError
          ? 'Validation error'
          : 'Internal server error',
        message: isDatabaseError 
          ? 'Unable to connect to the database. Please try again later.'
          : isConstraintError
          ? 'A record with this information already exists.'
          : errorMessage,
        code: isDatabaseError 
          ? 'DATABASE_ERROR' 
          : isConstraintError
          ? 'CONSTRAINT_ERROR'
          : 'INTERNAL_ERROR',
      },
      { status: 500 }
    );
  }
}