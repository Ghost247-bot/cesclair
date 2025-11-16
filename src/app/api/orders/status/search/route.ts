import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

// GET - Search order by email (returns most recent order)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      );
    }

    // Get most recent order by email
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.email, email))
      .orderBy(desc(orders.createdAt))
      .limit(1);

    if (userOrders.length === 0) {
      return NextResponse.json(
        { error: 'No orders found for this email address' },
        { status: 404 }
      );
    }

    // Get order items
    const items = await db
      .select()
      .from(orderItems)
      .where(eq(orderItems.orderId, userOrders[0].id));

    return NextResponse.json({
      ...userOrders[0],
      items,
    });
  } catch (error) {
    console.error('Search order by email error:', error);
    return NextResponse.json(
      { error: 'Failed to search order' },
      { status: 500 }
    );
  }
}

