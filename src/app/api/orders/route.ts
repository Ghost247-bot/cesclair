import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, cartItems, products } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { nanoid } from 'nanoid';

// GET - Get user orders
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 401 }
      );
    }

    if (orderId) {
      // Get specific order with items
      const order = await db
        .select()
        .from(orders)
        .where(and(eq(orders.id, parseInt(orderId)), eq(orders.userId, userId)))
        .limit(1);

      if (order.length === 0) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }

      const items = await db
        .select()
        .from(orderItems)
        .where(eq(orderItems.orderId, parseInt(orderId)));

      return NextResponse.json({ ...order[0], items });
    }

    // Get all user orders
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, userId))
      .orderBy(orders.createdAt);

    return NextResponse.json({ orders: userOrders });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}

// POST - Create new order
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      shippingAddress,
      paymentMethod,
      paymentIntentId,
      discountCode,
    } = body;

    const userId = request.headers.get('x-user-id') || null;
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value || null;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    if (!userId && !sessionId) {
      return NextResponse.json(
        { error: 'User session is required' },
        { status: 401 }
      );
    }

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get cart items
    const cartItemsData = await db
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
      .where(
        userId
          ? eq(cartItems.userId, userId)
          : eq(cartItems.sessionId, sessionId || '')
      );

    if (cartItemsData.length === 0) {
      return NextResponse.json(
        { error: 'Cart is empty' },
        { status: 400 }
      );
    }

    // Calculate totals
    const subtotal = cartItemsData.reduce((sum, item) => {
      const price = parseFloat(item.product?.price || '0');
      return sum + price * item.quantity;
    }, 0);

    const shipping = subtotal >= 125 ? 0 : 10; // Free shipping over $125
    const tax = subtotal * 0.08; // 8% tax (example)
    const discount = 0; // Calculate discount if code is valid
    const total = subtotal + shipping + tax - discount;

    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${nanoid(6).toUpperCase()}`;

    // Create order
    const [newOrder] = await db
      .insert(orders)
      .values({
        orderNumber,
        userId: userId || null,
        email,
        subtotal: subtotal.toFixed(2),
        shipping: shipping.toFixed(2),
        tax: tax.toFixed(2),
        discount: discount.toFixed(2),
        total: total.toFixed(2),
        shippingFirstName: shippingAddress.firstName,
        shippingLastName: shippingAddress.lastName,
        shippingAddressLine1: shippingAddress.addressLine1,
        shippingAddressLine2: shippingAddress.addressLine2,
        shippingCity: shippingAddress.city,
        shippingState: shippingAddress.state,
        shippingZipCode: shippingAddress.zipCode,
        shippingCountry: shippingAddress.country || 'United States',
        shippingPhone: shippingAddress.phone,
        paymentMethod: paymentMethod || 'card',
        paymentIntentId: paymentIntentId || null,
        status: 'pending',
      })
      .returning();

    // Create order items
    const orderItemsData = cartItemsData.map((item) => ({
      orderId: newOrder.id,
      productId: item.productId,
      productName: item.product?.name || '',
      productImage: item.product?.imageUrl || null,
      price: item.product?.price || '0.00',
      quantity: item.quantity,
      size: item.size || null,
      color: item.color || null,
      sku: item.product?.sku || null,
    }));

    await db.insert(orderItems).values(orderItemsData);

    // Clear cart
    await db
      .delete(cartItems)
      .where(
        userId
          ? eq(cartItems.userId, userId)
          : eq(cartItems.sessionId, sessionId || '')
      );

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

