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
    const now = new Date();
    
    // Hash password with bcryptjs for better-auth (same as better-auth uses)
    const hashedPassword = await bcryptjs.hash(password, 10);

    // Create user account
    await db.insert(user).values({
      id: userId,
      name: name.trim(),
      email: normalizedEmail,
      role: 'designer',
      emailVerified: false,
      createdAt: now,
      updatedAt: now,
    });

    // Create account credentials for better-auth
    await db.insert(account).values({
      id: nanoid(),
      accountId: normalizedEmail,
      providerId: 'credential',
      userId: userId,
      password: hashedPassword,
      createdAt: now,
      updatedAt: now,
    });

    // Hash password with bcrypt for designers table (legacy compatibility)
    const designerHashedPassword = await bcrypt.hash(password, 10);

    // Create designer profile
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

    return NextResponse.json(newDesigner[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}