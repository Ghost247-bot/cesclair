import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Try to call Better Auth's sign-in directly
    try {
      const result = await auth.api.signInEmail({
        body: {
          email,
          password,
        },
        headers: request.headers,
      });

      return NextResponse.json({
        success: true,
        result,
      }, { status: 200 });
    } catch (authError: any) {
      console.error('Auth sign-in error:', {
        error: authError,
        message: authError?.message,
        stack: authError?.stack,
        name: authError?.name,
        code: authError?.code,
      });

      return NextResponse.json({
        success: false,
        error: {
          message: authError?.message || 'Unknown error',
          name: authError?.name,
          code: authError?.code,
          stack: process.env.NODE_ENV === 'development' ? authError?.stack : undefined,
        },
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Test endpoint error:', error);
    return NextResponse.json({
      success: false,
      error: {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
    }, { status: 500 });
  }
}

