import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/db';
import { products } from '@/db/schema';
import { createSlug } from '@/lib/slug-utils';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Get all products with their slugs
    const allProducts = await db.select().from(products);
    
    // Generate slug mappings for products that don't have slugs
    const productsNeedingSlugs = allProducts.filter(p => !p.slug || p.slug.trim() === '');
    
    if (productsNeedingSlugs.length > 0) {
      console.log(`Generating slugs for ${productsNeedingSlugs.length} products...`);
      
      for (const product of productsNeedingSlugs) {
        const baseSlug = createSlug(product.name);
        let slug = baseSlug;
        let counter = 1;
        
        // Ensure slug is unique
        while (true) {
          const existing = await db.select()
            .from(products)
            .where(eq(products.slug, slug))
            .limit(1);
          
          if (existing.length === 0 || existing[0].id === product.id) break;
          
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        
        // Update product with slug
        await db.update(products)
          .set({ 
            slug: slug,
            updatedAt: new Date()
          })
          .where(eq(products.id, product.id));
          
        console.log(`Updated product ${product.id} (${product.name}) with slug: ${slug}`);
      }
      
      // Fetch updated products
      const updatedProducts = await db.select().from(products);
      return NextResponse.json({
        message: `Generated slugs for ${productsNeedingSlugs.length} products`,
        products: updatedProducts
      });
    }
    
    return NextResponse.json({
      message: 'All products already have slugs',
      products: allProducts
    });
    
  } catch (error) {
    console.error('Slug generation error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
