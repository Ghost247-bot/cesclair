import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hairstylistWorks, hairstylists } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getHairstylistSessionFromCookie } from '@/lib/hairstylist-session';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 1000);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const hairstylistId = searchParams.get('hairstylistId');
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const search = searchParams.get('search');

    let query = db
      .select({
        id: hairstylistWorks.id,
        hairstylistId: hairstylistWorks.hairstylistId,
        title: hairstylistWorks.title,
        description: hairstylistWorks.description,
        imageUrl: hairstylistWorks.imageUrl,
        category: hairstylistWorks.category,
        status: hairstylistWorks.status,
        createdAt: hairstylistWorks.createdAt,
        updatedAt: hairstylistWorks.updatedAt,
        hairstylist: {
          id: hairstylists.id,
          name: hairstylists.name,
          email: hairstylists.email,
          bio: hairstylists.bio,
          specialties: hairstylists.specialties,
          avatarUrl: hairstylists.avatarUrl,
        },
      })
      .from(hairstylistWorks)
      .leftJoin(hairstylists, eq(hairstylistWorks.hairstylistId, hairstylists.id));

    const conditions: ReturnType<typeof eq>[] = [];
    if (hairstylistId) {
      const parsed = parseInt(hairstylistId, 10);
      if (!isNaN(parsed)) conditions.push(eq(hairstylistWorks.hairstylistId, parsed));
    }
    if (status) conditions.push(eq(hairstylistWorks.status, status));
    if (category) conditions.push(eq(hairstylistWorks.category, category));
    if (search) {
      conditions.push(
        or(
          like(hairstylistWorks.title, `%${search}%`),
          like(hairstylistWorks.description, `%${search}%`),
          like(hairstylistWorks.category, `%${search}%`)
        )!
      );
    }
    if (conditions.length > 0) {
      query = query.where(conditions.length === 1 ? conditions[0] : and(...conditions));
    }

    const results = await query.orderBy(desc(hairstylistWorks.createdAt)).limit(limit).offset(offset);
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET /api/hairstylist-works error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    let { hairstylistId, title, description, imageUrl, category, status } = body;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const hsSession = await getHairstylistSessionFromCookie();
    const mainSession = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const isAdmin = mainSession?.user && (mainSession.user as any)?.role === 'admin';

    let parsedId: number;
    if (hairstylistId != null) {
      parsedId = parseInt(String(hairstylistId), 10);
      if (isNaN(parsedId)) {
        return NextResponse.json({ error: 'Invalid hairstylist ID' }, { status: 400 });
      }
      if (!isAdmin && (!hsSession || hsSession.id !== parsedId)) {
        return NextResponse.json({ error: 'You can only add works to your own portfolio' }, { status: 403 });
      }
    } else {
      if (!hsSession) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }
      parsedId = hsSession.id;
    }

    const [hairstylist] = await db
      .select()
      .from(hairstylists)
      .where(eq(hairstylists.id, parsedId))
      .limit(1);

    if (!hairstylist) {
      return NextResponse.json({ error: 'Hairstylist not found' }, { status: 404 });
    }

    const [created] = await db
      .insert(hairstylistWorks)
      .values({
        hairstylistId: parsedId,
        title: title.trim(),
        description: description?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        category: category?.trim() || null,
        status: status || 'draft',
      })
      .returning();

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error('POST /api/hairstylist-works error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
