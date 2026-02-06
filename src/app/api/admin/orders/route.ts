import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq, desc, sql } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { user } from '@/db/schema';

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    let session;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (sessionError) {
      console.error('Error getting session:', sessionError);
      return { authorized: false, error: 'Not authenticated' };
    }
    
    if (!session?.user) {
      return { authorized: false, error: 'Not authenticated' };
    }

    let userRole = (session.user as any)?.role;
    
    if (!userRole) {
      try {
        const dbUser = await db
          .select({ role: user.role })
          .from(user)
          .where(eq(user.id, session.user.id))
          .limit(1);
        
        if (dbUser.length > 0) {
          userRole = dbUser[0].role;
        }
      } catch (dbError) {
        console.error('Error fetching user role from database:', dbError);
        return { authorized: false, error: 'Failed to verify user role' };
      }
    }

    if (userRole !== 'admin') {
      return { authorized: false, error: 'Only administrators can access this endpoint' };
    }

    return { authorized: true, userId: session.user.id };
  } catch (error) {
    console.error('Error in checkAdminAccess:', error);
    return { authorized: false, error: 'Authentication check failed' };
  }
}

// GET - Get all orders (admin only)
export async function GET(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = parseInt(searchParams.get('limit') || '100');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Build query
    let ordersList;
    if (status) {
      ordersList = await db
        .select()
        .from(orders)
        .where(eq(orders.status, status))
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      ordersList = await db
        .select()
        .from(orders)
        .orderBy(desc(orders.createdAt))
        .limit(limit)
        .offset(offset);
    }

    // Get order items for each order
    const ordersWithItems = await Promise.all(
      ordersList.map(async (order) => {
        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, order.id));

        return {
          ...order,
          items,
        };
      })
    );

    // Get total count
    let totalCount;
    if (status) {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders)
        .where(eq(orders.status, status));
      totalCount = countResult[0]?.count || 0;
    } else {
      const countResult = await db
        .select({ count: sql<number>`count(*)` })
        .from(orders);
      totalCount = countResult[0]?.count || 0;
    }

    return NextResponse.json({
      orders: ordersWithItems,
      total: typeof totalCount === 'number' ? totalCount : Number(totalCount),
      limit,
      offset,
    });
  } catch (error) {
    console.error('GET orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

