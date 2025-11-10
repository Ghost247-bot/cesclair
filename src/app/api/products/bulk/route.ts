import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, sql } from 'drizzle-orm';

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
            // Let database handle timestamps via now() function
            createdAt: sql`now()`,
            updatedAt: sql`now()`,
          })
          .returning();

        createdProducts.push(newProduct[0]);
      } catch (error: any) {
        // Handle unique constraint violations and other DB errors
        if (error.message && error.message.includes('UNIQUE constraint failed')) {
          errors.push({
            index: i,
            sku: product.sku,
            error: `Product at index ${i}: SKU "${product.sku}" conflicts with another product in this batch`
          });
        } else {
          errors.push({
            index: i,
            sku: product.sku,
            error: `Product at index ${i}: Database error - ${error.message}`
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