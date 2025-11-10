import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, or, and, gte, lte, asc, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination
    const limit = Math.min(parseInt(searchParams.get('limit') ?? '10'), 100);
    const offset = parseInt(searchParams.get('offset') ?? '0');
    
    // Search
    const search = searchParams.get('search');
    
    // Filtering
    const category = searchParams.get('category');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    
    // Sorting
    const sort = searchParams.get('sort') ?? 'createdAt';
    const order = searchParams.get('order') ?? 'desc';
    
    // Build query
    let query = db.select().from(products);
    
    // Apply filters
    const conditions = [];
    
    if (search) {
      conditions.push(
        or(
          like(products.name, `%${search}%`),
          like(products.description, `%${search}%`),
          like(products.category, `%${search}%`)
        )
      );
    }
    
    if (category) {
      conditions.push(eq(products.category, category));
    }
    
    if (minPrice) {
      conditions.push(gte(products.price, minPrice));
    }
    
    if (maxPrice) {
      conditions.push(lte(products.price, maxPrice));
    }
    
    if (conditions.length > 0) {
      query = query.where(and(...conditions));
    }
    
    // Apply sorting
    const sortColumn = sort === 'price' ? products.price :
                      sort === 'name' ? products.name :
                      sort === 'stock' ? products.stock :
                      products.createdAt;
    
    query = query.orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn));
    
    // Apply pagination
    const results = await query.limit(limit).offset(offset);
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}

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
    const timestamp = new Date().toISOString();
    const insertData = {
      name: name.trim(),
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
        error: "Product with this SKU already exists",
        code: "DUPLICATE_SKU" 
      }, { status: 409 });
    }
    
    return NextResponse.json({ 
      error: 'Internal server error: ' + (error as Error).message 
    }, { status: 500 });
  }
}