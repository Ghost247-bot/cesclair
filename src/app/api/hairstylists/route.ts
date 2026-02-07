import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hairstylists } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import { auth } from '@/lib/auth';

// GET - List hairstylists (default: approved only; admin can pass status=all)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const search = searchParams.get('search');
    const statusFilter = searchParams.get('status');

    let query = db
      .select({
        id: hairstylists.id,
        name: hairstylists.name,
        email: hairstylists.email,
        bio: hairstylists.bio,
        portfolioUrl: hairstylists.portfolioUrl,
        specialties: hairstylists.specialties,
        status: hairstylists.status,
        avatarUrl: hairstylists.avatarUrl,
        bannerUrl: hairstylists.bannerUrl,
        bannerTitle: hairstylists.bannerTitle,
        bannerDescription: hairstylists.bannerDescription,
        bannerActive: hairstylists.bannerActive,
        createdAt: hairstylists.createdAt,
        updatedAt: hairstylists.updatedAt,
      })
      .from(hairstylists);

    const conditions: ReturnType<typeof eq>[] = [];
    if (statusFilter && statusFilter !== 'all') {
      conditions.push(eq(hairstylists.status, statusFilter));
    } else if (!statusFilter) {
      conditions.push(eq(hairstylists.status, 'approved'));
    }
    if (search && search.trim()) {
      conditions.push(
        or(
          like(hairstylists.name, `%${search}%`),
          like(hairstylists.email, `%${search}%`),
          like(hairstylists.specialties, `%${search}%`),
          like(hairstylists.bio, `%${search}%`)
        )!
      );
    }
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query.orderBy(desc(hairstylists.createdAt)).limit(limit).offset(offset);

    return NextResponse.json(results, { status: 200 });
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
    const [existing] = await db.select().from(hairstylists).where(eq(hairstylists.email, normalizedEmail)).limit(1);
    if (existing) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    const [created] = await db
      .insert(hairstylists)
      .values({
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        bio: bio?.trim() || null,
        portfolioUrl: portfolioUrl?.trim() || null,
        specialties: specialties?.trim() || null,
        status: status || 'pending',
      })
      .returning();

    if (!created) {
      return NextResponse.json({ error: 'Failed to create hairstylist' }, { status: 500 });
    }

    const { password: _, ...rest } = created;
    return NextResponse.json(rest, { status: 201 });
  } catch (error) {
    console.error('POST /api/hairstylists error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
