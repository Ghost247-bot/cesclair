import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { designers, user } from '@/db/schema';
import { eq } from 'drizzle-orm';

// POST - Allow users to update their own role to 'designer' if they're an approved designer
// This endpoint allows users to update their role during login if they're approved designers
export async function POST(request: NextRequest) {
  try {
    // Get session
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const userEmail = session.user.email;
    if (!userEmail) {
      return NextResponse.json(
        { error: 'User email not found', code: 'MISSING_EMAIL' },
        { status: 400 }
      );
    }

    // Check if user is an approved designer
    const designer = await db
      .select()
      .from(designers)
      .where(eq(designers.email, userEmail.toLowerCase().trim()))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    if (designer[0].status !== 'approved') {
      return NextResponse.json(
        { error: 'Designer account is not approved', code: 'NOT_APPROVED' },
        { status: 403 }
      );
    }

    // Update user role to designer
    await db
      .update(user)
      .set({
        role: 'designer',
        updatedAt: new Date(),
      })
      .where(eq(user.email, userEmail.toLowerCase().trim()));

    return NextResponse.json(
      { message: 'Role updated to designer', code: 'SUCCESS' },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST /api/designers/update-role error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

