import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { designers } from '@/db/schema';
import { eq } from 'drizzle-orm';
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validate required fields
    if (!email) {
      return NextResponse.json(
        { 
          error: 'Email is required',
          code: 'MISSING_EMAIL' 
        },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { 
          error: 'Password is required',
          code: 'MISSING_PASSWORD' 
        },
        { status: 400 }
      );
    }

    // Sanitize email input
    const normalizedEmail = email.trim().toLowerCase();

    // Query database for designer by email
    const result = await db
      .select()
      .from(designers)
      .where(eq(designers.email, normalizedEmail))
      .limit(1);

    if (result.length === 0) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS' 
        },
        { status: 401 }
      );
    }

    const designer = result[0];

    // Compare password with hashed password
    const isPasswordValid = await bcrypt.compare(password, designer.password);

    if (!isPasswordValid) {
      return NextResponse.json(
        { 
          error: 'Invalid email or password',
          code: 'INVALID_CREDENTIALS' 
        },
        { status: 401 }
      );
    }

    // Check if designer status is 'approved'
    if (designer.status !== 'approved') {
      return NextResponse.json(
        { 
          error: 'Your account is pending approval',
          code: 'ACCOUNT_NOT_APPROVED' 
        },
        { status: 403 }
      );
    }

    // Return success response with designer object (exclude password)
    const { password: _, ...designerWithoutPassword } = designer;

    return NextResponse.json(
      {
        message: 'Login successful',
        designer: designerWithoutPassword
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + (error instanceof Error ? error.message : 'Unknown error')
      },
      { status: 500 }
    );
  }
}