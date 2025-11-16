import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { signWellClient } from '@/lib/signwell';

export const dynamic = 'force-dynamic';

// GET - List all documents from SignWell
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        {
          error: 'Not authenticated',
          code: 'UNAUTHORIZED',
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    const userRole = (session.user as any)?.role;
    if (userRole !== 'admin') {
      return NextResponse.json(
        {
          error: 'Only administrators can access this endpoint',
          code: 'FORBIDDEN',
        },
        { status: 403 }
      );
    }

    if (!signWellClient) {
      return NextResponse.json(
        { error: 'SignWell API is not configured' },
        { status: 500 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const perPage = Math.min(parseInt(searchParams.get('per_page') || '50'), 100);
    const status = searchParams.get('status') || undefined;

    // Fetch documents from SignWell
    const result = await signWellClient.listDocuments({
      page,
      per_page: perPage,
      status,
    });

    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('GET /api/signwell/documents error:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to fetch documents',
        code: 'FETCH_ERROR',
        details: process.env.NODE_ENV === 'development' ? errorMessage : undefined,
      },
      { status: 500 }
    );
  }
}
