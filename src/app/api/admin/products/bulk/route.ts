import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { products, user } from '@/db/schema';
import { eq, inArray, sql } from 'drizzle-orm';

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

interface ProductInput {
  name?: string;
  description?: string;
  price?: string;
  category?: string;
  imageUrl?: string;
  stock?: number;
  sku?: string;
}

interface BulkUploadResult {
  message: string;
  created: number;
  failed: number;
  products: any[];
  errors?: Array<{ index: number; sku?: string; error: string }>;
}

export async function POST(request: NextRequest) {
  try {
    const accessCheck = await checkAdminAccess(request);
    if (!accessCheck.authorized) {
      return NextResponse.json(
        { error: accessCheck.error, code: 'UNAUTHORIZED' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Validate request body structure
    if (!body.products || !Array.isArray(body.products)) {
      return NextResponse.json(
        { 
          error: 'Request body must contain a "products" array',
          code: 'INVALID_REQUEST_BODY'
        },
        { status: 400 }
      );
    }

    if (body.products.length === 0) {
      return NextResponse.json(
        { 
          error: 'Products array cannot be empty',
          code: 'EMPTY_PRODUCTS_ARRAY'
        },
        { status: 400 }
      );
    }

    const productsToCreate: ProductInput[] = body.products;
    const createdProducts: any[] = [];
    const errors: Array<{ index: number; sku?: string; error: string }> = [];

    // Validate each product and collect valid ones
    for (let i = 0; i < productsToCreate.length; i++) {
      const product = productsToCreate[i];
      
      // Validate required fields
      if (!product.name || product.name.trim() === '') {
        errors.push({
          index: i,
          sku: product.sku,
          error: `Product at index ${i}: name is required`
        });
        continue;
      }

      if (!product.price || product.price.trim() === '') {
        errors.push({
          index: i,
          sku: product.sku,
          error: `Product at index ${i}: price is required`
        });
        continue;
      }

      // Validate price is a valid number
      const priceValue = parseFloat(product.price);
      if (isNaN(priceValue) || priceValue < 0) {
        errors.push({
          index: i,
          sku: product.sku,
          error: `Product at index ${i}: price must be a valid positive number`
        });
        continue;
      }

      // Check for duplicate SKU in existing database
      if (product.sku) {
        const existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.sku, product.sku))
          .limit(1);

        if (existingProduct.length > 0) {
          errors.push({
            index: i,
            sku: product.sku,
            error: `Product at index ${i}: SKU "${product.sku}" already exists`
          });
          continue;
        }
      }

      // Prepare product for insertion
      try {
        // Use sql template for timestamps to leverage database defaults
        // This avoids any serialization issues with Date objects
        const newProduct = await db
          .insert(products)
          .values({
            name: product.name.trim(),
            description: product.description?.trim() || null,
            price: product.price.trim(),
            category: product.category?.trim() || null,
            imageUrl: product.imageUrl?.trim() || null,
            stock: product.stock !== undefined ? product.stock : 0,
            sku: product.sku?.trim() || null,
            // Let database handle timestamps via DEFAULT now()
            createdAt: sql`now()`,
            updatedAt: sql`now()`,
          })
          .returning();

        createdProducts.push(newProduct[0]);
      } catch (error: any) {
        // Handle unique constraint violations and other DB errors
        console.error(`Error inserting product at index ${i}:`, error);
        console.error(`Product data:`, {
          name: product.name,
          price: product.price,
          sku: product.sku,
        });
        
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
          errors.push({
            index: i,
            sku: product.sku,
            error: `Product at index ${i}: SKU "${product.sku}" conflicts with another product in this batch`
          });
        } else {
          const errorMsg = error.message || String(error);
          errors.push({
            index: i,
            sku: product.sku,
            error: `Product at index ${i}: Database error - ${errorMsg}`
          });
        }
      }
    }

    // Prepare response
    const result: BulkUploadResult = {
      message: createdProducts.length > 0 
        ? 'Bulk upload completed' 
        : 'Bulk upload failed - no products created',
      created: createdProducts.length,
      failed: errors.length,
      products: createdProducts,
    };

    if (errors.length > 0) {
      result.errors = errors;
    }

    // Return appropriate status code
    if (createdProducts.length === 0 && errors.length > 0) {
      // All products failed
      return NextResponse.json(result, { status: 400 });
    } else if (errors.length > 0) {
      // Partial success - some products failed
      return NextResponse.json(result, { status: 207 }); // Multi-Status
    } else {
      // All products created successfully
      result.message = 'Bulk upload successful';
      return NextResponse.json(result, { status: 201 });
    }

  } catch (error: any) {
    console.error('POST error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error: ' + error.message,
        code: 'INTERNAL_SERVER_ERROR'
      },
      { status: 500 }
    );
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

    const body = await request.json();
    const { productIds } = body;

    if (!productIds || !Array.isArray(productIds) || productIds.length === 0) {
      return NextResponse.json(
        { error: 'Product IDs array is required', code: 'MISSING_PRODUCT_IDS' },
        { status: 400 }
      );
    }

    // Validate all IDs are numbers
    const validIds = productIds
      .map(id => parseInt(id))
      .filter(id => !isNaN(id));

    if (validIds.length === 0) {
      return NextResponse.json(
        { error: 'No valid product IDs provided', code: 'INVALID_IDS' },
        { status: 400 }
      );
    }

    // Check if products exist
    const existingProducts = await db
      .select({ id: products.id })
      .from(products)
      .where(inArray(products.id, validIds));

    if (existingProducts.length === 0) {
      return NextResponse.json(
        { error: 'No products found with the provided IDs', code: 'PRODUCTS_NOT_FOUND' },
        { status: 404 }
      );
    }

    const existingIds = existingProducts.map(p => p.id);

    // Delete products
    await db
      .delete(products)
      .where(inArray(products.id, existingIds));

    return NextResponse.json(
      {
        message: `Successfully deleted ${existingIds.length} product(s)`,
        deletedCount: existingIds.length,
        deletedIds: existingIds,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Bulk DELETE error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

