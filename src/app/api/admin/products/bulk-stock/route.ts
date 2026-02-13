import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, user } from '@/db/schema';
import { eq, inArray } from 'drizzle-orm';

interface BulkStockRequest {
  productIds: number[];
  stock: number;
  reason?: string;
}

// Helper function to check admin access
async function checkAdminAccess(request: NextRequest) {
  try {
    // Get session with error handling
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

    // Check if user is admin - first check session, then database
    let userRole = (session.user as any)?.role;
    
    // If role is not in session, fetch from database
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

export async function PUT(request: NextRequest) {
  try {
    // Verify admin authentication
    const authResult = await checkAdminAccess(request);
    if (!authResult.authorized) {
      return NextResponse.json({ error: authResult.error }, { status: 401 });
    }

    const body: BulkStockRequest = await request.json();
    const { productIds, stock, reason } = body;

    // Validate input
    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json({ error: 'Product IDs are required' }, { status: 400 });
    }

    if (typeof stock !== 'number' || stock < 0) {
      return NextResponse.json({ error: 'Valid stock number is required (0 or greater)' }, { status: 400 });
    }

    // Get current products for audit trail
    const currentProducts = await db
      .select()
      .from(products)
      .where(inArray(products.id, productIds));

    if (currentProducts.length === 0) {
      return NextResponse.json({ error: 'No products found' }, { status: 404 });
    }

    // Update stock for all products using individual updates (Neon HTTP limitation)
    const updatePromises = productIds.map(async (productId) => {
      return db
        .update(products)
        .set({ 
          stock: stock,
          updatedAt: new Date()
        })
        .where(eq(products.id, productId))
        .returning();
    });

    const results = await Promise.all(updatePromises);

    // Log the action
    console.log(`Admin ${authResult.userId} updated stock to ${stock} for ${productIds.length} products:`, {
      productIds,
      previousStock: currentProducts.map(p => ({ id: p.id, name: p.name, oldStock: p.stock })),
      newStock: stock,
      reason: reason || 'Bulk stock update',
      timestamp: new Date()
    });

    return NextResponse.json({
      success: true,
      message: `Successfully updated stock to ${stock} for ${results.length} products`,
      updatedProducts: results.map(r => r[0]),
      auditInfo: {
        updatedBy: authResult.userId,
        updatedAt: new Date().toISOString(),
        reason: reason || 'Bulk stock update',
        updatesCount: results.length
      }
    });

  } catch (error) {
    console.error('Error in bulk stock update:', error);
    return NextResponse.json(
      { error: 'Failed to update stock', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
