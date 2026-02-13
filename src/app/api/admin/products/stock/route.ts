import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { products, user } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { authClient } from '@/lib/auth-client';

interface StockUpdateRequest {
  productId: number;
  stock: number;
  reason?: string;
}

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const session = await authClient.getSession();
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Check if user is admin
    const adminUser = await db
      .select()
      .from(user)
      .where(eq(user.id, session.user.id))
      .limit(1);

    if (!adminUser.length || adminUser[0].role !== 'admin') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body: StockUpdateRequest = await request.json();
    const { productId, stock, reason } = body;

    if (!productId || typeof stock !== 'number' || stock < 0) {
      return NextResponse.json({ error: 'Invalid stock data' }, { status: 400 });
    }

    // Get current product for audit
    const currentProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, productId))
      .limit(1);

    if (!currentProduct.length) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Update stock
    const updatedProduct = await db
      .update(products)
      .set({ 
        stock,
        updatedAt: new Date()
      })
      .where(eq(products.id, productId))
      .returning();

    return NextResponse.json({
      success: true,
      message: 'Stock updated successfully',
      product: updatedProduct[0],
      auditInfo: {
        updatedBy: session.user.id,
        updatedAt: new Date().toISOString(),
        reason: reason || 'Manual stock update',
        previousStock: currentProduct[0].stock,
        newStock: stock
      }
    });

  } catch (error) {
    console.error('Error updating stock:', error);
    return NextResponse.json(
      { error: 'Failed to update stock' },
      { status: 500 }
    );
  }
}
