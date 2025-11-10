import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { designers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Get email from query params
    const searchParams = request.nextUrl.searchParams;
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Verify the requesting user has designer role and matches the email (or is admin)
    const userRole = (session.user as any)?.role;
    const isAdmin = userRole === 'admin';
    const isDesigner = userRole === 'designer';
    const emailMatches = session.user.email?.toLowerCase() === email.toLowerCase();

    if (!isAdmin && (!isDesigner || !emailMatches)) {
      return NextResponse.json(
        { error: 'Unauthorized to access this designer data', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Fetch designer by email
    const designer = await db
      .select({
        id: designers.id,
        name: designers.name,
        email: designers.email,
        bio: designers.bio,
        specialties: designers.specialties,
        status: designers.status,
        avatarUrl: designers.avatarUrl,
        portfolioUrl: designers.portfolioUrl,
        createdAt: designers.createdAt,
        updatedAt: designers.updatedAt,
      })
      .from(designers)
      .where(eq(designers.email, email.toLowerCase().trim()))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Check if designer is approved (unless admin is requesting)
    if (!isAdmin && designer[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Designer account is pending approval', code: 'NOT_APPROVED' },
        { status: 403 }
      );
    }

    return NextResponse.json(designer[0], { status: 200 });
  } catch (error) {
    console.error('GET designer by email error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

