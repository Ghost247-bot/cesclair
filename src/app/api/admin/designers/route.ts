import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const status = searchParams.get('status');

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
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { status } = body;

    if (!status) {
      return NextResponse.json(
        { error: 'Status is required', code: 'MISSING_STATUS' },
        { status: 400 }
      );
    }

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

    const updated = await db
      .update(designers)
      .set({
        status,
        updatedAt: new Date().toISOString(),
      })
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