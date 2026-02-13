import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { wishlistItems } from '@/db/schema';
import { eq, desc, and } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!userId) {
      // For non-logged in users, return empty wishlist
      return NextResponse.json({ items: [] }, { status: 200 });
    }

    // Fetch wishlist items from database
    const items = await db
      .select({
        id: wishlistItems.id,
        productId: wishlistItems.productId,
        createdAt: wishlistItems.createdAt,
      })
      .from(wishlistItems)
      .where(eq(wishlistItems.userId, userId))
      .orderBy(desc(wishlistItems.createdAt));

    return NextResponse.json({ items }, { status: 200 });
  } catch (error) {
    console.error('Get wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to get wishlist' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { productId } = body;
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check if item already exists in wishlist
    const existingItem = await db
      .select()
      .from(wishlistItems)
      .where(and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, productId)
      ))
      .limit(1);

    let isWishlisted = false;
    
    if (existingItem.length === 0) {
      // Add to wishlist
      await db.insert(wishlistItems).values({
        userId,
        productId,
        createdAt: new Date(),
      });
      isWishlisted = true;
    } else {
      // Remove from wishlist
      await db
        .delete(wishlistItems)
        .where(and(
          eq(wishlistItems.userId, userId),
          eq(wishlistItems.productId, productId)
        ));
      isWishlisted = false;
    }

    // Trigger wishlist update event
    // In a real implementation, you might use WebSocket or server-sent events
    // For now, we'll rely on client-side polling

    return NextResponse.json({ 
      success: true, 
      message: isWishlisted ? 'Added to wishlist' : 'Removed from wishlist',
      isWishlisted 
    }, { status: 200 });
  } catch (error) {
    console.error('Toggle wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to update wishlist' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const url = new URL(request.url);
    const productId = url.searchParams.get('productId');
    const session = await auth.api.getSession({ headers: request.headers });
    const userId = session?.user?.id;

    if (!productId) {
      return NextResponse.json(
        { error: 'Product ID is required' },
        { status: 400 }
      );
    }

    if (!userId) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Remove from wishlist
    await db
      .delete(wishlistItems)
      .where(and(
        eq(wishlistItems.userId, userId),
        eq(wishlistItems.productId, parseInt(productId))
      ));

    return NextResponse.json({ 
      success: true, 
      message: 'Removed from wishlist' 
    }, { status: 200 });
  } catch (error) {
    console.error('Remove from wishlist error:', error);
    return NextResponse.json(
      { error: 'Failed to remove from wishlist' },
      { status: 500 }
    );
  }
}

