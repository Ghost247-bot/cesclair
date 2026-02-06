import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers } from '@/db/schema';
import { eq } from 'drizzle-orm';

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

    const normalizedEmail = email.trim().toLowerCase();

    // Check if designer exists
    const designer = await db
      .select({
        id: designers.id,
        status: designers.status,
        email: designers.email,
      })
      .from(designers)
      .where(eq(designers.email, normalizedEmail))
      .limit(1);

    if (designer.length === 0) {
      return NextResponse.json(
        { error: 'Designer not found', code: 'NOT_FOUND' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        status: designer[0].status,
        email: designer[0].email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

