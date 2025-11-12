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
    const sessionEmail = session.user.email?.toLowerCase();
    const requestedEmail = email.toLowerCase().trim();
    const emailMatches = sessionEmail === requestedEmail;

    // Fetch designer by email first to check if they exist
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
      .where(eq(designers.email, requestedEmail))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    // Allow access if:
    // 1. User is admin (can access any designer)
    // 2. User is designer and email matches (can access their own data)
    // 3. User's email matches the requested email AND designer is approved (even if role isn't set yet)
    // This handles cases where the user is an approved designer but their role hasn't been updated yet
    if (!isAdmin) {
      if (emailMatches) {
        // User is requesting their own data
        // Allow access if they're an approved designer (even if role isn't set yet)
        if (designer[0].status !== 'approved') {
          return NextResponse.json(
            { error: 'Designer account is pending approval', code: 'NOT_APPROVED' },
            { status: 403 }
          );
        }
        // Email matches and designer is approved, allow access
      } else {
        // User is requesting someone else's data
        // Only allow if they have designer role (they can only access their own)
        if (!isDesigner) {
          return NextResponse.json(
            { error: 'Unauthorized to access this designer data', code: 'FORBIDDEN' },
            { status: 403 }
          );
        }
        // Designer role but email doesn't match - they can't access others' data
        return NextResponse.json(
          { error: 'Unauthorized to access this designer data', code: 'FORBIDDEN' },
          { status: 403 }
        );
      }
    }

    // Admin can access any designer, no need to check approval status
    // For non-admins, we already checked approval status above

    return NextResponse.json(designer[0], { status: 200 });
  } catch (error) {
    console.error('GET designer by email error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

// POST - Check designer status by email (for login flow)
// This endpoint doesn't require authentication and is used during login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required', code: 'MISSING_EMAIL' },
        { status: 400 }
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

    // Return designer data (including status)
    // During login, we'll check the status on the client side
    return NextResponse.json(designer[0], { status: 200 });
  } catch (error) {
    console.error('POST designer by email error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

