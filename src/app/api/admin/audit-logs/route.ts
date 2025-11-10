import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { user, auditLogs } from '@/db/schema';
import { eq, desc, and, gte, lte } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Check authentication and admin role
    const session = await auth.api.getSession({ headers: request.headers });
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Not authenticated', code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    // Check if user is admin
    let userRole = (session.user as any)?.role;
    if (!userRole) {
      const dbUser = await db
        .select({ role: user.role })
        .from(user)
        .where(eq(user.id, session.user.id))
        .limit(1);
      
      if (dbUser.length > 0) {
        userRole = dbUser[0].role;
      }
    }

    if (userRole !== 'admin') {
      return NextResponse.json(
        { error: 'Only administrators can access this endpoint', code: 'FORBIDDEN' },
        { status: 403 }
      );
    }

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    const actionFilter = searchParams.get('action');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build query with join to get performer user details
    // Target user info is stored in details JSON
    let query = db
      .select({
        id: auditLogs.id,
        action: auditLogs.action,
        performedBy: auditLogs.performedBy,
        performedByName: user.name,
        performedByEmail: user.email,
        targetUserId: auditLogs.targetUserId,
        details: auditLogs.details,
        ipAddress: auditLogs.ipAddress,
        userAgent: auditLogs.userAgent,
        createdAt: auditLogs.createdAt,
      })
      .from(auditLogs)
      .leftJoin(user, eq(auditLogs.performedBy, user.id));

    const conditions = [];

    if (actionFilter) {
      conditions.push(eq(auditLogs.action, actionFilter));
    }

    if (startDate) {
      conditions.push(gte(auditLogs.createdAt, new Date(startDate)));
    }

    if (endDate) {
      conditions.push(lte(auditLogs.createdAt, new Date(endDate)));
    }

    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }

    const results = await query
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET audit logs error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

