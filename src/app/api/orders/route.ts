import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { orders, orderItems, cartItems, products, user } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { nanoid } from 'nanoid';
import { auth } from '@/lib/auth';

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
      email: providedEmail,
      shippingAddress,
      paymentMethod,
      paymentIntentId,
      discountCode,
      items: providedItems, // Allow cart items to be passed directly
    } = body;

    // Try to get user session
    let session = null;
    try {
      session = await auth.api.getSession({ headers: request.headers });
    } catch (error) {
      // Session not available, continue as guest
    }

    const userId = session?.user?.id || request.headers.get('x-user-id') || null;
    const sessionId = request.headers.get('x-session-id') || request.cookies.get('session_id')?.value || null;

    // Get email from session if available, otherwise use provided email
    let email = providedEmail;
    if (!email && session?.user?.email) {
      email = session.user.email;
    }

    // If still no email, try to get from database if userId exists
    if (!email && userId) {
      try {
        const dbUser = await db
          .select({ email: user.email })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);
        if (dbUser.length > 0 && dbUser[0].email) {
          email = dbUser[0].email;
        }
      } catch (error) {
        console.error('Error fetching user email:', error);
      }
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Log session info for debugging
    console.log('Order creation session info:', {
      userId,
      sessionId,
      hasSession: !!session,
      email,
    });

    if (!shippingAddress) {
      return NextResponse.json(
        { error: 'Shipping address is required' },
        { status: 400 }
      );
    }

    // Get cart items - try database first, then fallback to provided items
    let cartItemsData: any[] = [];
    
    // Try to get from database if we have userId or sessionId
    if (userId || sessionId) {
      try {
        cartItemsData = await db
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
        console.log('Cart items from database:', cartItemsData.length);
      } catch (dbError: any) {
        console.error('Error fetching cart from database:', dbError);
      }
    }

    // If no items from database and items provided in request, use those
    if (cartItemsData.length === 0 && providedItems && Array.isArray(providedItems) && providedItems.length > 0) {
      console.log('Using provided cart items:', providedItems.length);
      // Fetch product details for provided items
      const productIds = providedItems
        .map((item: any) => item.productId || item.product?.id)
        .filter((id: any): id is number => Boolean(id) && typeof id === 'number');
      
      if (productIds.length > 0) {
        try {
          const productDetails = await db
            .select()
            .from(products)
            .where(inArray(products.id, productIds));
          
          const productsMap = new Map(productDetails.map(p => [p.id, p]));
          
          cartItemsData = providedItems.map((item: any) => {
            const prodId = item.productId || item.product?.id;
            const product = item.product || productsMap.get(prodId);
            return {
              id: item.id || null,
              productId: prodId,
              quantity: item.quantity || 1,
              size: item.size || null,
              color: item.color || null,
              product: product || {
                id: prodId,
                name: item.product?.name || 'Unknown Product',
                price: item.product?.price || '0.00',
                imageUrl: item.product?.imageUrl || null,
                sku: item.product?.sku || null,
              },
            };
          });
        } catch (productError: any) {
          console.error('Error fetching product details:', productError);
          // Fall back to using provided item data directly
          cartItemsData = providedItems.map((item: any) => ({
            id: item.id || null,
            productId: item.productId || item.product?.id,
            quantity: item.quantity || 1,
            size: item.size || null,
            color: item.color || null,
            product: item.product || {
              id: item.productId || item.product?.id,
              name: item.product?.name || 'Unknown Product',
              price: item.product?.price || '0.00',
              imageUrl: item.product?.imageUrl || null,
              sku: item.product?.sku || null,
            },
          }));
        }
      }
    }

    if (cartItemsData.length === 0) {
      console.error('No cart items found. userId:', userId, 'sessionId:', sessionId, 'providedItems:', !!providedItems);
      return NextResponse.json(
        { error: 'Cart is empty. Please add items to your cart before placing an order.' },
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
    console.log('Creating order with orderNumber:', orderNumber);
    console.log('Order data:', {
      orderNumber,
      userId,
      email,
      subtotal: subtotal.toFixed(2),
      total: total.toFixed(2),
    });

    let newOrder;
    try {
      const result = await db
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
          shippingAddressLine2: shippingAddress.addressLine2 || null,
          shippingCity: shippingAddress.city,
          shippingState: shippingAddress.state,
          shippingZipCode: shippingAddress.zipCode,
          shippingCountry: shippingAddress.country || 'United States',
          shippingPhone: shippingAddress.phone || null,
          paymentMethod: paymentMethod || 'card',
          paymentIntentId: paymentIntentId || null,
          status: 'pending',
        })
        .returning();

      if (!result || result.length === 0) {
        throw new Error('Order insert returned no result');
      }

      newOrder = result[0];
      console.log('Order created successfully:', newOrder);
    } catch (dbError: any) {
      console.error('Database error creating order:', dbError);
      console.error('Error details:', {
        message: dbError?.message,
        code: dbError?.code,
        constraint: dbError?.constraint,
        detail: dbError?.detail,
      });
      throw dbError;
    }

    // Create order items
    try {
      const orderItemsData = cartItemsData.map((item) => ({
        orderId: newOrder.id,
        productId: item.productId,
        productName: item.product?.name || 'Unknown Product',
        productImage: item.product?.imageUrl || null,
        price: item.product?.price || '0.00',
        quantity: item.quantity,
        size: item.size || null,
        color: item.color || null,
        sku: item.product?.sku || null,
      }));

      console.log('Creating order items:', orderItemsData.length);
      await db.insert(orderItems).values(orderItemsData);
      console.log('Order items created successfully');
    } catch (itemsError: any) {
      console.error('Error creating order items:', itemsError);
      // If order items fail, we should still return the order
      // But log the error for debugging
    }

    // Clear cart
    try {
      await db
        .delete(cartItems)
        .where(
          userId
            ? eq(cartItems.userId, userId)
            : eq(cartItems.sessionId, sessionId || '')
        );
      console.log('Cart cleared successfully');
    } catch (cartError: any) {
      console.error('Error clearing cart:', cartError);
      // Don't fail the order if cart clearing fails
    }

    console.log('Order creation complete. Order number:', newOrder.orderNumber);

    return NextResponse.json({
      success: true,
      order: newOrder,
      orderNumber: newOrder.orderNumber,
      orderId: newOrder.id,
    });
  } catch (error: any) {
    console.error('Create order error:', error);
    console.error('Error stack:', error?.stack);
    console.error('Error message:', error?.message);
    
    // Return more detailed error for debugging
    return NextResponse.json(
      { 
        error: 'Failed to create order',
        message: error?.message || 'Unknown error',
        details: process.env.NODE_ENV === 'development' ? error?.stack : undefined,
      },
      { status: 500 }
    );
  }
}

