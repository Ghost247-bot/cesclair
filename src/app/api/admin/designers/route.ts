import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers, user } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import bcrypt from 'bcrypt';
import { Pool } from '@neondatabase/serverless';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    // Get session with error handling
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return { authorized: false, error: 'Not authenticated' };
    }
    
    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated' };
    }

    // Check if user is admin - first check session, then database
    let userRole = (session.user as any)?.role;
    
    // If role is not in session, fetch from database
    if (!userRole) {
      try {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0) {
          userRole = dbUser[0].role;
        }
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        return { authorized: false, error: 'Failed to verify user role' };
      }
    }

    if (userRole !== 'admin') {
      return { authorized: false, error: 'Only administrators can access this endpoint' };
    }

    return { authorized: true, userId: session.user.id };
  } catch (error) {
    console.error('Error in checkAdminAccess:', error);
    return { authorized: false, error: 'Authentication check failed' };
  }
}

export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

    // Check if banner_url column exists first
    const pool = new Pool({ connectionString: process.env.DATABASE_URL! });
    let bannerUrlColumnExists = false;
    
    try {
      const columnCheckResult = await pool.query(`
        SELECT column_name 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'designers' 
        AND column_name = 'banner_url'
        LIMIT 1;
      `);
      bannerUrlColumnExists = columnCheckResult.rows.length > 0;
    } catch (checkError) {
      console.error('Error checking for banner_url column:', checkError);
    } finally {
      await pool.end();
    }

    // Build the query - use raw SQL if column doesn't exist, otherwise use Drizzle
    if (!bannerUrlColumnExists) {
      console.warn('banner_url column does not exist in designers table. Using raw SQL query.');
      
      // Use raw SQL query when column doesn't exist
      const pool2 = new Pool({ connectionString: process.env.DATABASE_URL! });
      try {
        let whereClause = '1=1';
        const params: any[] = [];
        let paramIndex = 1;

        if (search) {
          whereClause += ` AND (name ILIKE $${paramIndex} OR email ILIKE $${paramIndex + 1})`;
          params.push(`%${search}%`, `%${search}%`);
          paramIndex += 2;
        }

        if (status) {
          whereClause += ` AND status = $${paramIndex}`;
          params.push(status);
          paramIndex += 1;
        }

        const querySQL = `
          SELECT 
            id,
            name,
            email,
            bio,
            portfolio_url as "portfolioUrl",
            specialties,
            status,
            avatar_url as "avatarUrl",
            NULL as "bannerUrl",
            created_at as "createdAt",
            updated_at as "updatedAt"
          FROM designers
          WHERE ${whereClause}
          ORDER BY created_at DESC
          LIMIT $${paramIndex}
          OFFSET $${paramIndex + 1}
        `;
        params.push(limit, offset);

        const result = await pool2.query(querySQL, params);
        await pool2.end();
        
        return NextResponse.json(result.rows, { status: 200 });
      } catch (sqlError: any) {
        await pool2.end();
        throw sqlError;
      }
    }

    // Column exists - use Drizzle query
    let query = db.select({
      id: designers.id,
      name: designers.name,
      email: designers.email,
      bio: designers.bio,
      portfolioUrl: designers.portfolioUrl,
      specialties: designers.specialties,
      status: designers.status,
      avatarUrl: designers.avatarUrl,
      bannerUrl: designers.bannerUrl,
      createdAt: designers.createdAt,
      updatedAt: designers.updatedAt,
    }).from(designers);

    const conditions = [];

    if (search) {
      conditions.push(
        or(
          like(designers.name, `%${search}%`),
          like(designers.email, `%${search}%`)
        )
      );
    }

    if (status) {
      conditions.push(eq(designers.status, status));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(designers.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/admin/designers error:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorCode = error?.code || 'UNKNOWN_ERROR';
    
    // Check for specific database errors
    if (errorMessage.includes('banner_url') || errorMessage.includes('column') || errorMessage.includes('does not exist')) {
      console.error('Database schema mismatch detected. The banner_url column may not exist.');
      console.error('Please run the migration: drizzle/0004_add_banner_to_designers.sql');
      return NextResponse.json(
        { 
          error: 'Database schema mismatch: banner_url column not found. Please run the migration.',
          code: 'SCHEMA_MISMATCH',
          migrationFile: 'drizzle/0004_add_banner_to_designers.sql',
          sql: 'ALTER TABLE "designers" ADD COLUMN "banner_url" text;'
        },
        { status: 500 }
      );
    }
    
    // Generic error response
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + errorMessage,
        code: errorCode || 'INTERNAL_SERVER_ERROR',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { name, email, password, bio, portfolioUrl, specialties, avatarUrl, bannerUrl, status } = body;

    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json(
        { error: 'Name is required', code: 'MISSING_NAME' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { error: 'Password is required', code: 'MISSING_PASSWORD' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const normalizedEmail = email.toLowerCase().trim();
    if (!emailRegex.test(normalizedEmail)) {
      return NextResponse.json(
        { error: 'Invalid email format', code: 'INVALID_EMAIL' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingDesigner = await db
      .select()
      .from(designers)
      .where(eq(designers.email, normalizedEmail))
      .limit(1);

    if (existingDesigner.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Determine status (default to approved for admin-created designers)
    const designerStatus = status || 'approved';

    // Create designer
    const now = new Date().toISOString();
    const newDesigner = await db
      .insert(designers)
      .values({
        name: name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        bio: bio?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        specialties: specialties?.trim() || null,
        status: designerStatus,
        avatarUrl: avatarUrl?.trim() || null,
        bannerUrl: bannerUrl?.trim() || null,
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
        bannerUrl: designers.bannerUrl,
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

export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { 
      status, 
      name, 
      email, 
      bio, 
      portfolioUrl, 
      specialties, 
      avatarUrl, 
      bannerUrl,
      password 
    } = body;

    const existingDesigner = await db
      .select()
      .from(designers)
      .where(eq(designers.id, parseInt(id)))
      .limit(1);

    if (existingDesigner.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'DESIGNER_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updatedAt: new Date().toISOString(),
    };

    // Update status if provided
    if (status !== undefined) {
      const allowedStatuses = ['pending', 'approved', 'rejected'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json(
          {
            error: 'Status must be one of: pending, approved, rejected',
            code: 'INVALID_STATUS',
          },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // Update other fields if provided
    if (name !== undefined) updates.name = name.trim();
    if (email !== undefined) {
      const normalizedEmail = email.toLowerCase().trim();
      // Check if email is already taken by another designer
      const emailCheck = await db
        .select()
        .from(designers)
        .where(eq(designers.email, normalizedEmail))
        .limit(1);
      
      if (emailCheck.length > 0 && emailCheck[0].id !== parseInt(id)) {
        return NextResponse.json(
          { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
          { status: 409 }
        );
      }
      updates.email = normalizedEmail;
    }
    if (bio !== undefined) updates.bio = bio?.trim() || null;
    if (portfolioUrl !== undefined) updates.portfolioUrl = portfolioUrl?.trim() || null;
    if (specialties !== undefined) updates.specialties = specialties?.trim() || null;
    if (avatarUrl !== undefined) updates.avatarUrl = avatarUrl?.trim() || null;
    if (bannerUrl !== undefined) updates.bannerUrl = bannerUrl?.trim() || null;
    
    // Update password if provided
    if (password !== undefined && password.trim()) {
      updates.password = await bcrypt.hash(password, 10);
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 1) { // Only updatedAt
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    const updated = await db
      .update(designers)
      .set(updates)
      .where(eq(designers.id, parseInt(id)))
      .returning({
        id: designers.id,
        name: designers.name,
        email: designers.email,
        bio: designers.bio,
        portfolioUrl: designers.portfolioUrl,
        specialties: designers.specialties,
        status: designers.status,
        avatarUrl: designers.avatarUrl,
        bannerUrl: designers.bannerUrl,
        createdAt: designers.createdAt,
        updatedAt: designers.updatedAt,
      });

    if (updated.length === 0) {
      return NextResponse.json(
        { error: 'Failed to update designer', code: 'UPDATE_FAILED' },
        { status: 500 }
      );
    }

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}