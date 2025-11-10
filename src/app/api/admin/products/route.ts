import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, user } from '@/db/schema';
import { eq, like, or, and, desc, inArray, sql } from 'drizzle-orm';

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
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '100'), 500);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Search
    const search = searchParams.get('search');
    
    // Filtering
    const category = searchParams.get('category');
    
    // Build query
    let query = db.select().from(products);
    
    // Apply filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`),
          like(products.category, `%${search}%`),
          like(products.sku, `%${search}%`)
        )
      );
    }
    
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    query = query.orderBy(desc(products.createdAt));
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });
  } catch (error: any) {
    console.error('GET /api/admin/products error:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + errorMessage,
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { name, description, price, category, imageUrl, stock, sku } = body;

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Build update object
    const updates: any = {
      updatedAt: sql`now()`,
    };

    if (name !== undefined) updates.name = name.trim();
    if (description !== undefined) updates.description = description?.trim() || null;
    if (price !== undefined) {
      const numericPrice = parseFloat(price);
      if (isNaN(numericPrice) || numericPrice < 0) {
        return NextResponse.json(
          { error: 'Price must be a valid positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
      updates.price = price.toString();
    }
    if (category !== undefined) updates.category = category?.trim() || null;
    if (imageUrl !== undefined) updates.imageUrl = imageUrl?.trim() || null;
    if (stock !== undefined) updates.stock = parseInt(stock.toString()) || 0;
    if (sku !== undefined) {
      const skuValue = sku?.trim() || null;
      // Check for duplicate SKU if provided
      if (skuValue) {
        const skuCheck = await db
          .select()
          .from(products)
          .where(eq(products.sku, skuValue))
          .limit(1);
        
        if (skuCheck.length > 0 && skuCheck[0].id !== parseInt(id)) {
          return NextResponse.json(
            { error: 'Product with this SKU already exists', code: 'DUPLICATE_SKU' },
            { status: 409 }
          );
        }
      }
      updates.sku = skuValue;
    }

    // Check if there are any updates
    if (Object.keys(updates).length === 1) { // Only updatedAt
      return NextResponse.json(
        { error: 'No valid fields to update', code: 'NO_UPDATES' },
        { status: 400 }
      );
    }

    // Update product
    try {
      const updated = await db
        .update(products)
        .set(updates)
        .where(eq(products.id, parseInt(id)))
        .returning();

      if (updated.length === 0) {
        return NextResponse.json(
          { error: 'Failed to update product', code: 'UPDATE_FAILED' },
          { status: 500 }
        );
      }

      return NextResponse.json(updated[0], { status: 200 });
    } catch (dbError: any) {
      console.error('Database update error:', dbError);
      throw dbError;
    }
  } catch (error: any) {
    console.error('PUT /api/admin/products error:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + errorMessage,
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id))) {
      return NextResponse.json(
        { error: 'Valid product ID is required', code: 'INVALID_ID' },
        { status: 400 }
      );
    }

    // Check if product exists
    const existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Delete product
    await db
      .delete(products)
      .where(eq(products.id, parseInt(id)));

    return NextResponse.json(
      { message: 'Product deleted successfully' },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('DELETE /api/admin/products error:', error);
    const errorMessage = error?.message || 'Unknown error';
    const errorStack = error?.stack || 'No stack trace';
    console.error('Error details:', { message: errorMessage, stack: errorStack });
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + errorMessage,
      code: 'INTERNAL_SERVER_ERROR',
      details: process.env.NODE_ENV === 'development' ? errorStack : undefined
    }, { status: 500 });
  }
}

