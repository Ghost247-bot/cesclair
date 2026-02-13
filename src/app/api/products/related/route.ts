import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db/index';
import { products } from '@/db/schema';
import { eq, and, ne, gt, desc } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '8');
    const excludeId = searchParams.get('excludeId');
    const category = searchParams.get('category');

    // Build where conditions
    const conditions = [gt(products.stock, 0)];
    
    if (excludeId) {
      conditions.push(ne(products.id, parseInt(excludeId)));
    }
    
    if (category) {
      conditions.push(eq(products.category, category));
    }

    // Query for related products
    const results = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        price: products.price,
        description: products.description,
        category: products.category,
        image: products.imageUrl,
        stock: products.stock,
        sku: products.sku,
        createdAt: products.createdAt,
      })
      .from(products)
      .where(and(...conditions))
      .orderBy(desc(products.createdAt))
      .limit(limit);

    // Transform data to match the expected format
    const relatedProducts = results.map((row) => ({
      id: row.id.toString(),
      name: row.name,
      slug: row.slug,
      price: parseFloat(row.price),
      image: row.image || '/placeholder-image.jpg',
      colors: 0, // Will be 0 until we add colors table
      category: row.category,
      stock: row.stock || 0,
      sku: row.sku,
      // Note: rating, reviewCount, originalPrice, and isOnSale would need to be added to schema
    }));

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.error('Error fetching related products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch related products' },
      { status: 500 }
    );
  }
}
