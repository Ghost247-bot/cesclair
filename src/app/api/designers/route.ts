import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers, user, account } from '@/db/schema';
import { eq, like, or, and } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import bcryptjs from 'bcryptjs';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';

// GET - List all users with designer role
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    // Get all users with role='designer' and join with designers table for additional info
    // This ensures we show ALL accounts with designer role, not just approved ones
    const baseQuery = db
      .select({
        // Use user table as primary source
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image, // Include user.image for fallback
        // Get additional info from designers table if available
        bio: designers.bio,
        portfolioUrl: designers.portfolioUrl,
        specialties: designers.specialties,
        status: designers.status,
        avatarUrl: designers.avatarUrl,
        bannerUrl: designers.bannerUrl,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      })
      .from(user)
      .leftJoin(designers, eq(user.email, designers.email));

    // Build where conditions
    const conditions: any[] = [eq(user.role, 'designer')];
    
    // Apply search filter if provided
    if (search) {
      const searchCondition = or(
        like(user.name, `%${search}%`),
        like(user.email, `%${search}%`),
        like(designers.specialties, `%${search}%`)
      );
      if (searchCondition) {
        conditions.push(searchCondition);
      }
    }

    // Apply conditions - use and() only if we have multiple conditions
    let query = baseQuery;
    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      const combinedCondition = and(...conditions);
      if (combinedCondition) {
        query = query.where(combinedCondition);
      }
    }
    
    // Execute query - add retry logic for Neon serverless
    let results: any[] = [];
    let retries = 2;
    let lastError: Error | null = null;
    
    while (retries >= 0) {
      try {
        results = await query.limit(limit).offset(offset);
        break; // Success, exit retry loop
      } catch (queryError) {
        lastError = queryError instanceof Error ? queryError : new Error(String(queryError));
        if (retries === 0) {
          throw lastError; // Re-throw on final attempt
        }
        retries--;
        // Wait a bit before retrying (exponential backoff)
        await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
      }
    }
    
    // Ensure results is defined
    if (!results) {
      results = [];
    }

    // Transform results to match expected format
    // Use designers table data when available, fallback to user table data
    const transformedResults = results.map((row: any) => ({
      id: row.id, // User ID (text)
      name: row.name || '',
      email: row.email || '',
      bio: row.bio || null,
      portfolioUrl: row.portfolioUrl || null,
      specialties: row.specialties || null,
      status: row.status || 'approved', // Default to approved if no designers table entry
      avatarUrl: row.avatarUrl || row.image || null, // Use designers.avatarUrl or user.image
      bannerUrl: row.bannerUrl || null,
      createdAt: row.createdAt ? (row.createdAt instanceof Date ? row.createdAt.toISOString() : row.createdAt) : new Date().toISOString(),
      updatedAt: row.updatedAt ? (row.updatedAt instanceof Date ? row.updatedAt.toISOString() : row.updatedAt) : new Date().toISOString(),
    }));

    return NextResponse.json(transformedResults, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('GET /api/designers error:', {
      message: errorMessage,
      stack: errorStack,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
    
    // Check if it's a database connection error or query timeout
    const isDatabaseError = 
      errorMessage.includes('database') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('timeout') ||
      errorMessage.includes('Query timeout') ||
      errorMessage.includes('Pool') ||
      errorMessage.includes('neon') ||
      errorMessage.includes('postgres') ||
      errorMessage.includes('Failed query');
    
    // If it's a query error, try to provide more helpful error message
    const isQueryError = errorMessage.includes('Failed query') || errorMessage.includes('Query timeout');
    
    return NextResponse.json(
      { 
        error: isDatabaseError ? 'Database connection error' : 'Internal server error',
        message: isDatabaseError 
          ? (isQueryError 
              ? 'Database query failed. Please try again later.'
              : 'Unable to connect to the database. Please try again later.')
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