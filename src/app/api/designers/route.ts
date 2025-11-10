import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers } from '@/db/schema';
import { eq, like, or } from 'drizzle-orm';
import bcrypt from 'bcrypt';

// GET - List approved designers
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');

    let query = db.select({
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
    }).from(designers)
      .where(eq(designers.status, 'approved'));

    if (search) {
      query = db.select({
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
      }).from(designers)
        .where(
          or(
            eq(designers.status, 'approved'),
            like(designers.name, `%${search}%`),
            like(designers.email, `%${search}%`),
            like(designers.specialties, `%${search}%`)
          )
        );
    }

    const results = await query.limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
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

    // Check if email already exists
    const existingDesigner = await db.select()
      .from(designers)
      .where(eq(designers.email, email.toLowerCase().trim()))
      .limit(1);

    if (existingDesigner.length > 0) {
      return NextResponse.json(
        { error: 'Email already exists', code: 'DUPLICATE_EMAIL' },
        { status: 409 }
      );
    }

    // Hash password with bcrypt (10 salt rounds)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new designer
    const now = new Date().toISOString();
    const newDesigner = await db.insert(designers)
      .values({
        name: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
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