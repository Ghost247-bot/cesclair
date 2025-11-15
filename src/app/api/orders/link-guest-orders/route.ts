import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders } from '@/db/schema';
import { eq, and, isNull } from 'drizzle-orm';
import { auth } from '@/lib/auth';

// POST - Link guest orders to user account after signup/login
export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const email = session.user.email;

    if (!email) {
      return NextResponse.json(
        { error: 'User email is required' },
        { status: 400 }
      );
    }

    // Find all orders with this email that don't have a userId (guest orders)
    const guestOrders = await db
      .select()
      .from(orders)
      .where(
        and(
          eq(orders.email, email),
          isNull(orders.userId)
        )
      );

    if (guestOrders.length === 0) {
      return NextResponse.json({
        success: true,
        linkedCount: 0,
        message: 'No guest orders found to link',
      });
    }

    // Link all guest orders to the user account
    let linkedCount = 0;
    for (const order of guestOrders) {
      try {
        await db
          .update(orders)
          .set({ userId })
          .where(eq(orders.id, order.id));
        linkedCount++;
      } catch (error) {
        console.error(`Error linking order ${order.id}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      linkedCount,
      message: `Successfully linked ${linkedCount} order(s) to your account`,
    });
  } catch (error) {
    console.error('Link guest orders error:', error);
    return NextResponse.json(
      { error: 'Failed to link guest orders' },
      { status: 500 }
    );
  }
}

