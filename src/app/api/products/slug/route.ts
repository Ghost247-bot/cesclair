import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { createSlug } from '@/lib/slug-utils';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, price, category, imageUrl, stock, sku } = body;
    
    // Validate required fields
    if (!name || !name.trim()) {
      return NextResponse.json({ 
        error: "Name is required",
        code: "MISSING_NAME" 
      }, { status: 400 });
    }
    
    if (!price) {
      return NextResponse.json({ 
        error: "Price is required",
        code: "MISSING_PRICE" 
      }, { status: 400 });
    }
    
    // Validate price is a valid number
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || numericPrice < 0) {
      return NextResponse.json({ 
        error: "Price must be a valid positive number",
        code: "INVALID_PRICE" 
      }, { status: 400 });
    }
    
    // Generate slug from name
    const baseSlug = createSlug(name.trim());
    
    // Ensure slug is unique
    let slug = baseSlug;
    let counter = 1;
    
    while (true) {
      const existing = await db.select()
        .from(products)
        .where(eq(products.slug, slug))
        .limit(1);
      
      if (existing.length === 0) break;
      
      slug = `${baseSlug}-${counter}`;
      counter++;
    }
    
    // Check for duplicate SKU if provided
    if (sku) {
      const existing = await db.select()
        .from(products)
        .where(eq(products.sku, sku.trim()))
        .limit(1);
      
      if (existing.length > 0) {
        return NextResponse.json({ 
          error: "Product with this SKU already exists",
          code: "DUPLICATE_SKU" 
        }, { status: 409 });
      }
    }
    
    // Prepare insert data
    const timestamp = new Date();
    const insertData = {
      name: name.trim(),
      slug: slug,
      description: description?.trim() || null,
      price: price.toString(),
      category: category?.trim() || null,
      imageUrl: imageUrl?.trim() || null,
      stock: stock !== undefined ? parseInt(stock.toString()) : 0,
      sku: sku?.trim() || null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    
    // Insert product
    const newProduct = await db.insert(products)
      .values(insertData)
      .returning();
    
    return NextResponse.json(newProduct[0], { status: 201 });
  } catch (error) {
    console.error('POST error:', error);
    
    // Check for unique constraint violation
    if ((error as Error).message.includes('UNIQUE constraint failed')) {
      return NextResponse.json({ 
        error: "Product with this SKU or slug already exists",
        code: "DUPLICATE_IDENTIFIER" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}
