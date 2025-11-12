import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, or, and, gte, lte, asc, desc, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Pagination - reduced default limit for better performance
    const limitParam = parseInt(searchParams.get('limit') ?? '50');
    const limit = Math.min(limitParam, 500); // Reduced max from 1000 to 500
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
    
    // Build conditions array
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
      const minPriceNum = parseFloat(minPrice);
      if (!isNaN(minPriceNum)) {
        // Cast text price to numeric for comparison
        conditions.push(sql`CAST(${products.price} AS NUMERIC) >= CAST(${minPriceNum} AS NUMERIC)`);
      }
    }
    
    if (maxPrice) {
      const maxPriceNum = parseFloat(maxPrice);
      if (!isNaN(maxPriceNum)) {
        // Cast text price to numeric for comparison
        conditions.push(sql`CAST(${products.price} AS NUMERIC) <= CAST(${maxPriceNum} AS NUMERIC)`);
      }
    }
    
    // Determine sort column
    const sortColumn = sort === 'price' ? products.price :
                      sort === 'name' ? products.name :
                      sort === 'stock' ? products.stock :
                      products.createdAt;
    
    // Build and execute query with timeout handling
    let baseQuery = db.select().from(products);
    
    if (conditions.length > 0) {
      const combinedCondition = and(...conditions);
      if (combinedCondition) {
        baseQuery = baseQuery.where(combinedCondition);
      }
    }
    
    // Execute query with retry logic for Neon serverless
    let results: any[] = [];
    let retries = 2;
    let lastError: Error | null = null;
    
    while (retries >= 0) {
      try {
        // Add timeout wrapper
        const queryPromise = baseQuery
      .orderBy(order === 'asc' ? asc(sortColumn) : desc(sortColumn))
      .limit(limit)
      .offset(offset);
        
        // Race query against timeout (10 seconds)
        results = await Promise.race([
          queryPromise,
          new Promise<never>((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout after 10 seconds')), 10000)
          )
        ]);
        break; // Success, exit retry loop
      } catch (queryError) {
        lastError = queryError instanceof Error ? queryError : new Error(String(queryError));
        
        // If it's a timeout and we have retries left, retry
        const isTimeout = lastError.message.includes('timeout') || 
                          lastError.message.includes('Timeout') ||
                          lastError.message.includes('TIMEOUT_ERR');
        
        if (retries > 0 && isTimeout) {
          retries--;
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (3 - retries)));
          continue;
        }
        
        // If no retries left, throw the error
        if (retries === 0) {
          throw lastError;
        }
        
        // For non-timeout errors, throw immediately
        throw lastError;
      }
    }
    
    // Ensure results is defined
    if (!results) {
      results = [];
    }
    
    return NextResponse.json(results, { status: 200 });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : undefined;
    
    console.error('GET /api/products error:', {
      message: errorMessage,
      stack: errorStack,
      hasDatabaseUrl: !!process.env.DATABASE_URL,
    });
    
    // Check if it's a timeout or database error
    const isTimeoutError = 
      errorMessage.includes('timeout') || 
      errorMessage.includes('Timeout') ||
      errorMessage.includes('TIMEOUT_ERR');
    
    const isDatabaseError = 
      errorMessage.includes('database') || 
      errorMessage.includes('connection') || 
      errorMessage.includes('ECONNREFUSED') ||
      errorMessage.includes('ENOTFOUND') ||
      errorMessage.includes('Pool') ||
      errorMessage.includes('neon') ||
      errorMessage.includes('postgres') ||
      errorMessage.includes('Failed query');
    
    return NextResponse.json({ 
      error: isTimeoutError 
        ? 'Request timeout - query took too long'
        : isDatabaseError 
        ? 'Database connection error'
        : 'Internal server error',
      message: isTimeoutError
        ? 'The query is taking too long. Try reducing the limit or adding filters.'
        : isDatabaseError
        ? 'Unable to connect to the database. Please try again later.'
        : errorMessage,
      code: isTimeoutError 
        ? 'TIMEOUT_ERROR'
        : isDatabaseError 
        ? 'DATABASE_ERROR'
        : 'INTERNAL_ERROR',
    }, { 
      status: isTimeoutError ? 504 : isDatabaseError ? 500 : 500 
    });
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