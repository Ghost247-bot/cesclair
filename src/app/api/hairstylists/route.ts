import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { bcrypt } from 'bcrypt';
import bcryptjs from 'bcryptjs';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';

// Direct Neon connection - bypass the db proxy for now
const connectionString = 'postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb';
const sql = neon(connectionString);

// GET - List hairstylists (default: approved only; admin can pass status=all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const statusFilter = searchParams.get('status');

    let query = sql`SELECT id, name, email, bio, portfolio_url, specialties, status, avatar_url, banner_url, banner_title, banner_description, banner_active, created_at, updated_at FROM hairstylists`;

    const conditions: any[] = [];
    
    if (statusFilter && statusFilter !== 'all') {
      conditions.push(sql`status = ${statusFilter}`);
    } else if (!statusFilter) {
      conditions.push(sql`status = 'approved'`);
    }
    
    if (search && search.trim()) {
      const searchTerm = `%${search}%`;
      conditions.push(sql`(name ILIKE ${searchTerm} OR email ILIKE ${searchTerm} OR specialties ILIKE ${searchTerm} OR bio ILIKE ${searchTerm})`);
    }

    // Apply conditions if any
    let finalQuery = query;
    if (conditions.length > 0) {
      finalQuery = sql`${query} WHERE ${conditions.reduce((acc, cond, idx) => 
        idx === 0 ? cond : sql`${acc} AND ${cond}`, conditions[0])}`;
    }

    const results = await sql`${finalQuery} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;

    console.log('Raw query results:', results);

    // Convert field names to camelCase for consistency
    const formattedResults = Array.isArray(results) ? results.map((row: any) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      bio: row.bio,
      portfolioUrl: row.portfolio_url,
      specialties: row.specialties,
      status: row.status,
      avatarUrl: row.avatar_url,
      bannerUrl: row.banner_url,
      bannerTitle: row.banner_title,
      bannerDescription: row.banner_description,
      bannerActive: row.banner_active,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    })) : [];

    return NextResponse.json(formattedResults, { status: 200 });
  } catch (error) {
    console.error('GET /api/hairstylists error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// POST - Create hairstylist (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can create hairstylists' }, { status: 403 });
    }

    const body = await request.json();
    const { name, email, password, bio, portfolioUrl, specialties, status } = body;

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();
    
    // Check if hairstylist already exists
    const existingHairstylist = await sql`SELECT id FROM hairstylists WHERE email = ${normalizedEmail} LIMIT 1`;
    if (existingHairstylist.length > 0) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    // Check if user exists in auth tables
    const existingUser = await sql`SELECT id FROM "user" WHERE email = ${normalizedEmail} LIMIT 1`;
    const now = new Date();
    let userId: string | null = null;

    // Create user in auth tables if not exists
    if (existingUser.length === 0) {
      userId = nanoid();
      const accountId = nanoid();
      const hashedPasswordAuth = await bcryptjs.hash(String(password), 10);

      await sql`INSERT INTO "user" (id, name, email, role, email_verified, image, created_at, updated_at) VALUES (${userId}, ${String(name).trim()}, ${normalizedEmail}, 'hairstylist', false, null, ${now}, ${now})`;
      
      await sql`INSERT INTO account (id, account_id, provider_id, user_id, password, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, created_at, updated_at) VALUES (${accountId}, ${normalizedEmail}, 'credential', ${userId}, ${hashedPasswordAuth}, null, null, null, null, null, null, ${now}, ${now})`;
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    // Create hairstylist
    const created = await sql`INSERT INTO hairstylists (name, email, password, bio, portfolio_url, specialties, status, created_at, updated_at) VALUES (${String(name).trim()}, ${normalizedEmail}, ${hashedPassword}, ${bio?.trim() || null}, ${portfolioUrl?.trim() || null}, ${specialties?.trim() || null}, ${status || 'pending'}, ${now}, ${now}) RETURNING *`;

    if (!created || created.length === 0) {
      return NextResponse.json({ error: 'Failed to create hairstylist' }, { status: 500 });
    }

    const { password: _, ...rest } = created[0];
    return NextResponse.json(rest, { status: 201 });
  } catch (error) {
    console.error('POST /api/hairstylists error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
