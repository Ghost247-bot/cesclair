import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';

// GET - Get cart items
export async function GET(request: NextRequest) {
  try {
    // Try to get authenticated user first
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      userId = session?.user?.id || null;
    } catch (error) {
      // If auth fails, continue as guest
    }

    // Fall back to header or session cookie for guest users
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }
    // Check header first (from localStorage), then cookie
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value;

    // Build where condition
    let whereCondition;
    if (userId) {
      whereCondition = eq(cartItems.userId, userId);
    } else if (sessionId) {
      whereCondition = eq(cartItems.sessionId, sessionId);
    } else {
      // No user or session, return empty cart
      return NextResponse.json({ items: [], total: 0, subtotal: '0.00' });
    }

    const items = await db
      .select({
        id: cartItems.id,
        productId: cartItems.productId,
        quantity: cartItems.quantity,
        size: cartItems.size,
        color: cartItems.color,
        product: {
          id: products.id,
          name: products.name,
          price: products.price,
          imageUrl: products.imageUrl,
          sku: products.sku,
        },
      })
      .from(cartItems)
      .leftJoin(products, eq(cartItems.productId, products.id))
      .where(whereCondition);

    const subtotal = items.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || '0');
      return sum + price * item.quantity;
    }, 0);

    return NextResponse.json({
      items: items.map(item => ({
        id: item.id,
        productId: item.productId,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        product: item.product,
      })),
      subtotal: subtotal.toFixed(2),
      total: subtotal.toFixed(2),
    });
  } catch (error) {
    console.error('Get cart error:', error);
    return NextResponse.json(
      { error: 'Failed to get cart' },
      { status: 500 }
    );
  }
}

// POST - Add item to cart
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId, quantity = 1, size, color } = body;
    
    // Try to get authenticated user first
    let userId: string | null = null;
    try {
      const session = await auth.api.getSession({ headers: request.headers });
      userId = session?.user?.id || null;
    } catch (error) {
      // If auth fails, continue as guest
    }

    // Fall back to header or session cookie for guest users
    if (!userId) {
      userId = request.headers.get('x-user-id');
    }
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value || nanoid();

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    // Check if item already exists in cart
    const existingItem = await db
      .select()
      .from(cartItems)
      .where(
        and(
          userId ? eq(cartItems.userId, userId) : eq(cartItems.sessionId, sessionId),
          eq(cartItems.productId, productId),
          size ? eq(cartItems.size, size) : undefined,
          color ? eq(cartItems.color, color) : undefined
        )
      )
      .limit(1);

    if (existingItem.length > 0) {
      // Update quantity
      await db
        .update(cartItems)
        .set({ quantity: existingItem[0].quantity + quantity })
        .where(eq(cartItems.id, existingItem[0].id));
    } else {
      // Create new cart item
      await db.insert(cartItems).values({
        userId: userId || null,
        sessionId: userId ? null : sessionId,
        productId,
        quantity,
        size: size || null,
        color: color || null,
      });
    }

    const response = NextResponse.json({ success: true, sessionId: !userId ? sessionId : undefined });
    if (!userId && sessionId) {
      response.cookies.set('session_id', sessionId, {
        maxAge: 60 * 60 * 24 * 30, // 30 days
        httpOnly: true, // Keep httpOnly for security
        sameSite: 'lax',
        path: '/',
      });
    }
    return response;
  } catch (error) {
    console.error('Add to cart error:', error);
    return NextResponse.json(
      { error: 'Failed to add item to cart' },
      { status: 500 }
    );
  }
}

// DELETE - Remove item from cart
export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const itemId = url.searchParams.get('itemId');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    await db.delete(cartItems).where(eq(cartItems.id, parseInt(itemId)));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Remove from cart error:', error);
    return NextResponse.json(
      { error: 'Failed to remove item from cart' },
      { status: 500 }
    );
  }
}

// PATCH - Update cart item quantity
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { itemId, quantity } = body;

    if (!itemId || quantity === undefined) {
      return NextResponse.json(
        { error: 'Item ID and quantity are required' },
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      await db.delete(cartItems).where(eq(cartItems.id, itemId));
    } else {
      await db
        .update(cartItems)
        .set({ quantity, updatedAt: new Date() })
        .where(eq(cartItems.id, itemId));
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update cart error:', error);
    return NextResponse.json(
      { error: 'Failed to update cart item' },
      { status: 500 }
    );
  }
}

