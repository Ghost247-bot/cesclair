import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { createSlug } from '@/lib/slug-utils';
import { eq, ilike, or } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Validate slug
    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Valid slug is required', code: 'INVALID_SLUG', receivedSlug: slug },
        { status: 400 }
      );
    }

    // First try to find by slug
    let product = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug.trim()))
      .limit(1);

    // If not found by slug, try to find by ID (backward compatibility)
    if (product.length === 0) {
      const id = parseInt(slug);
      if (!isNaN(id)) {
        product = await db
          .select()
          .from(products)
          .where(eq(products.id, id))
          .limit(1);
      }
    }

    // If still not found, try fuzzy matching (for typos)
    if (product.length === 0) {
      product = await db
        .select()
        .from(products)
        .where(or(
          ilike(products.slug, `%${slug}%`),
          ilike(products.name, `%${slug.replace(/-/g, ' ')}%`)
        ))
        .limit(1);
    }

    if (product.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND', slug },
        { status: 404 }
      );
    }

    return NextResponse.json(product[0], { status: 200 });
  } catch (error) {
    console.error('GET by slug error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    // Validate slug
    if (!slug || slug.trim() === '') {
      return NextResponse.json(
        { error: 'Valid slug is required', code: 'INVALID_SLUG' },
        { status: 400 }
      );
    }

    // Find product by slug
    let existingProduct = await db
      .select()
      .from(products)
      .where(eq(products.slug, slug.trim()))
      .limit(1);

    // If not found by slug, try ID (backward compatibility)
    if (existingProduct.length === 0) {
      const id = parseInt(slug);
      if (!isNaN(id)) {
        existingProduct = await db
          .select()
          .from(products)
          .where(eq(products.id, id))
          .limit(1);
      }
    }

    if (existingProduct.length === 0) {
      return NextResponse.json(
        { error: 'Product not found', code: 'PRODUCT_NOT_FOUND' },
        { status: 404 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, description, price, category, imageUrl, stock, sku } = body;

    // Validate price if provided
    if (price !== undefined && price !== null && price !== '') {
      const priceNum = parseFloat(price);
      if (isNaN(priceNum) || priceNum < 0) {
        return NextResponse.json(
          { error: 'Price must be a valid positive number', code: 'INVALID_PRICE' },
          { status: 400 }
        );
      }
    }

    // Validate stock if provided
    if (stock !== undefined && stock !== null) {
      const stockNum = parseInt(stock);
      if (isNaN(stockNum) || stockNum < 0) {
        return NextResponse.json(
          { error: 'Stock must be a valid non-negative integer', code: 'INVALID_STOCK' },
          { status: 400 }
        );
      }
    }

    // Check for SKU conflict if sku is being updated
    if (sku !== undefined && sku !== existingProduct[0].sku) {
      const skuConflict = await db
        .select()
        .from(products)
        .where(eq(products.sku, sku))
        .limit(1);

      if (skuConflict.length > 0) {
        return NextResponse.json(
          { error: 'SKU already exists', code: 'SKU_CONFLICT' },
          { status: 409 }
        );
      }
    }

    // Build update object with only provided fields
    const updates: Record<string, any> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      updates.name = name.trim();
      // Generate new slug if name changed
      if (name.trim() !== existingProduct[0].name) {
        const baseSlug = createSlug(name.trim());
        let newSlug = baseSlug;
        let counter = 1;
        
        // Ensure new slug is unique (excluding current product)
        while (true) {
          const slugCheck = await db.select()
            .from(products)
            .where(eq(products.slug, newSlug))
            .limit(1);
          
          if (slugCheck.length === 0 || slugCheck[0].id === existingProduct[0].id) break;
          
          newSlug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        updates.slug = newSlug;
      }
    }
    
    if (description !== undefined) updates.description = description.trim();
    if (price !== undefined) updates.price = price;
    if (category !== undefined) updates.category = category.trim();
    if (imageUrl !== undefined) updates.imageUrl = imageUrl.trim();
    if (stock !== undefined) updates.stock = parseInt(stock);
    if (sku !== undefined) updates.sku = sku.trim();

    // Update product
    const updated = await db
      .update(products)
      .set(updates)
      .where(eq(products.id, existingProduct[0].id))
      .returning();

    return NextResponse.json(updated[0], { status: 200 });
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
