import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { hairstylists, user, account } from '@/db/schema';
import { eq, like, or, and, desc } from 'drizzle-orm';
import bcrypt from 'bcrypt';
import bcryptjs from 'bcryptjs';
import { nanoid } from 'nanoid';
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

// POST - Create hairstylist (admin only). Also creates user + account in Better Auth tables when email is new.
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
    const [existingHairstylist] = await db.select().from(hairstylists).where(eq(hairstylists.email, normalizedEmail)).limit(1);
    if (existingHairstylist) {
      return NextResponse.json({ error: 'Email already in use' }, { status: 409 });
    }

    const [existingUser] = await db.select().from(user).where(eq(user.email, normalizedEmail)).limit(1);
    const now = new Date();
    let userId: string | null = null;

    // Create user + account in Better Auth tables if this email is not already a user
    if (!existingUser) {
      userId = nanoid();
      const accountId = nanoid();
      const hashedPasswordAuth = await bcryptjs.hash(String(password), 10);

      await db.insert(user).values({
        id: userId,
        name: String(name).trim(),
        email: normalizedEmail,
        role: 'hairstylist',
        emailVerified: false,
        image: null,
        createdAt: now,
        updatedAt: now,
      });

      await db.insert(account).values({
        id: accountId,
        accountId: normalizedEmail,
        providerId: 'credential',
        userId: userId,
        password: hashedPasswordAuth,
        accessToken: null,
        refreshToken: null,
        idToken: null,
        accessTokenExpiresAt: null,
        refreshTokenExpiresAt: null,
        scope: null,
        createdAt: now,
        updatedAt: now,
      });
    }

    const hashedPassword = await bcrypt.hash(String(password), 10);

    try {
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
        if (userId) {
          try {
            await db.delete(user).where(eq(user.id, userId));
          } catch (e) {
            console.error('Cleanup user after hairstylist insert failure:', e);
          }
        }
        return NextResponse.json({ error: 'Failed to create hairstylist' }, { status: 500 });
      }

      const { password: _, ...rest } = created;
      return NextResponse.json(rest, { status: 201 });
    } catch (hairstylistError) {
      if (userId) {
        try {
          await db.delete(user).where(eq(user.id, userId));
        } catch (cleanupError) {
          console.error('Cleanup user after hairstylist insert failure:', cleanupError);
        }
      }
      throw hairstylistError;
    }
  } catch (error) {
    console.error('POST /api/hairstylists error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}
