import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hairstylistWorks } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { getHairstylistSessionFromCookie } from '@/lib/hairstylist-session';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const [work] = await db
      .select()
      .from(hairstylistWorks)
      .where(eq(hairstylistWorks.id, parseInt(id, 10)))
      .limit(1);

    if (!work) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    return NextResponse.json(work, { status: 200 });
  } catch (error) {
    console.error('GET /api/hairstylist-works/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(hairstylistWorks)
      .where(eq(hairstylistWorks.id, parseInt(id, 10)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    const hsSession = await getHairstylistSessionFromCookie();
    const mainSession = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const isAdmin = mainSession?.user && (mainSession.user as any)?.role === 'admin';
    const isOwner = hsSession && hsSession.id === existing.hairstylistId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Not authorized to update this work' }, { status: 403 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.title !== undefined) updates.title = body.title.trim();
    if (body.description !== undefined) updates.description = body.description?.trim() ?? null;
    if (body.imageUrl !== undefined) updates.imageUrl = body.imageUrl?.trim() ?? null;
    if (body.category !== undefined) updates.category = body.category?.trim() ?? null;
    if (body.status !== undefined) updates.status = body.status;

    const [updated] = await db
      .update(hairstylistWorks)
      .set(updates as any)
      .where(eq(hairstylistWorks.id, parseInt(id, 10)))
      .returning();

    return NextResponse.json(updated!, { status: 200 });
  } catch (error) {
    console.error('PUT /api/hairstylist-works/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid ID is required' }, { status: 400 });
    }

    const [existing] = await db
      .select()
      .from(hairstylistWorks)
      .where(eq(hairstylistWorks.id, parseInt(id, 10)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Work not found' }, { status: 404 });
    }

    const hsSession = await getHairstylistSessionFromCookie();
    const mainSession = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const isAdmin = mainSession?.user && (mainSession.user as any)?.role === 'admin';
    const isOwner = hsSession && hsSession.id === existing.hairstylistId;
    if (!isAdmin && !isOwner) {
      return NextResponse.json({ error: 'Not authorized to delete this work' }, { status: 403 });
    }

    await db.delete(hairstylistWorks).where(eq(hairstylistWorks.id, parseInt(id, 10)));

    return NextResponse.json(
      { message: 'Work deleted successfully', id: existing.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/hairstylist-works/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
