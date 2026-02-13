import bcrypt from 'bcrypt';
import { NextRequest, NextResponse } from 'next/server';
import { neon } from '@neondatabase/serverless';
import { auth } from '@/lib/auth';
import { getHairstylistSessionFromCookie } from '@/lib/hairstylist-session';

// Direct Neon connection - bypass db proxy for now
const connectionString = 'postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb';
const sql = neon(connectionString);

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    const numericId = parseInt(id, 10);
    if (isNaN(numericId)) {
      return NextResponse.json({ error: 'Invalid hairstylist ID' }, { status: 400 });
    }

    const hairstylists = await sql`SELECT id, name, email, bio, portfolio_url, specialties, status, avatar_url, banner_url, banner_title, banner_description, banner_active, created_at, updated_at FROM hairstylists WHERE id = ${numericId} LIMIT 1`;

    if (!hairstylists || hairstylists.length === 0) {
      return NextResponse.json({ error: 'Hairstylist not found' }, { status: 404 });
    }

    const hairstylist = hairstylists[0];
    
    // Convert field names to camelCase for consistency
    const formattedHairstylist = {
      id: hairstylist.id,
      name: hairstylist.name,
      email: hairstylist.email,
      bio: hairstylist.bio,
      portfolioUrl: hairstylist.portfolio_url,
      specialties: hairstylist.specialties,
      status: hairstylist.status,
      avatarUrl: hairstylist.avatar_url,
      bannerUrl: hairstylist.banner_url,
      bannerTitle: hairstylist.banner_title,
      bannerDescription: hairstylist.banner_description,
      bannerActive: hairstylist.banner_active,
      createdAt: hairstylist.created_at,
      updatedAt: hairstylist.updated_at,
    };

    return NextResponse.json(formattedHairstylist, { status: 200 });
  } catch (error) {
    console.error('GET /api/hairstylists/[id] error:', error);
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

    const mainSession = await auth.api.getSession({ headers: request.headers }).catch(() => null);
    const hsSession = await getHairstylistSessionFromCookie();
    const isAdmin = mainSession?.user && (mainSession.user as any)?.role === 'admin';
    const isSelf = hsSession && hsSession.id === parseInt(id, 10);

    if (!isAdmin && !isSelf) {
      return NextResponse.json({ error: 'Not authorized to update this profile' }, { status: 403 });
    }

    const [existing] = await db
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
      .from(hairstylists)
      .where(eq(hairstylists.id, parseInt(id, 10)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Hairstylist not found' }, { status: 404 });
    }

    const body = await request.json();
    const updates: Record<string, unknown> = { updatedAt: new Date() };

    if (body.name !== undefined) updates.name = body.name.trim();
    if (isAdmin) {
      if (body.email !== undefined) {
        const normalized = body.email.toLowerCase().trim();
        if (normalized !== existing.email) {
          const [conflict] = await db.select().from(hairstylists).where(eq(hairstylists.email, normalized)).limit(1);
          if (conflict) {
            return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
          }
        }
        updates.email = body.email.toLowerCase().trim();
      }
      if (body.password !== undefined && body.password.length >= 6) {
        updates.password = await bcrypt.hash(body.password, 10);
      }
      if (body.status !== undefined) updates.status = body.status;
      if (body.bannerTitle !== undefined) updates.bannerTitle = body.bannerTitle;
      if (body.bannerDescription !== undefined) updates.bannerDescription = body.bannerDescription;
      if (body.bannerActive !== undefined) updates.bannerActive = body.bannerActive;
    }
    if (body.bio !== undefined) updates.bio = body.bio;
    if (body.portfolioUrl !== undefined) updates.portfolioUrl = body.portfolioUrl;
    if (body.specialties !== undefined) updates.specialties = body.specialties;
    if (body.avatarUrl !== undefined) updates.avatarUrl = body.avatarUrl;
    if (body.bannerUrl !== undefined) updates.bannerUrl = body.bannerUrl;

    const [updated] = await db
      .update(hairstylists)
      .set(updates as any)
      .where(eq(hairstylists.id, parseInt(id, 10)))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: 'Update failed' }, { status: 500 });
    }

    const { password: _, ...rest } = updated;
    return NextResponse.json(rest, { status: 200 });
  } catch (error) {
    console.error('PUT /api/hairstylists/[id] error:', error);
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

    const session = await auth.api.getSession({ headers: request.headers });
    if (!session?.user || (session.user as any)?.role !== 'admin') {
      return NextResponse.json({ error: 'Only administrators can delete hairstylists' }, { status: 403 });
    }

    const [existing] = await db
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
      .from(hairstylists)
      .where(eq(hairstylists.id, parseInt(id, 10)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: 'Hairstylist not found' }, { status: 404 });
    }

    // hairstylist_works cascade on delete
    await db.delete(hairstylists).where(eq(hairstylists.id, parseInt(id, 10)));

    return NextResponse.json(
      { message: 'Hairstylist deleted successfully', id: existing.id },
      { status: 200 }
    );
  } catch (error) {
    console.error('DELETE /api/hairstylists/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
