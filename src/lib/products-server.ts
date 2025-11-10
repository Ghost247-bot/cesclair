// Server-side utility functions for fetching products directly from the database
// Use this in Server Components

import { db } from '@/db';
import { products } from '@/db/schema';
import { eq, like, or, and, desc, asc } from 'drizzle-orm';

export interface ProductFromDB {
  id: number;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductForDisplay {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  category?: string;
  description?: string;
  stock?: number;
  sku?: string;
}

/**
 * Fetch all products from the database
 */
export async function getAllProducts(limit: number = 1000): Promise<ProductFromDB[]> {
  try {
    const allProducts = await db
      .select()
      .from(products)
      .orderBy(desc(products.createdAt))
      .limit(limit);
    
    return allProducts;
  } catch (error) {
    console.error('Error fetching all products:', error);
    return [];
  }
}

/**
 * Fetch products by category
 */
export async function getProductsByCategory(category: string, limit: number = 1000): Promise<ProductFromDB[]> {
  try {
    const categoryProducts = await db
      .select()
      .from(products)
      .where(eq(products.category, category))
      .orderBy(desc(products.createdAt))
      .limit(limit);
    
    return categoryProducts;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Fetch a single product by ID
 */
export async function getProductById(id: number): Promise<ProductFromDB | null> {
  try {
    const product = await db
      .select()
      .from(products)
      .where(eq(products.id, id))
      .limit(1);
    
    return product.length > 0 ? product[0] : null;
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
  }
}

/**
 * Search products by name, description, or category
 */
export async function searchProducts(searchTerm: string, limit: number = 100): Promise<ProductFromDB[]> {
  try {
    const searchResults = await db
      .select()
      .from(products)
      .where(
        or(
          like(products.name, `%${searchTerm}%`),
          like(products.description, `%${searchTerm}%`),
          like(products.category, `%${searchTerm}%`)
        )
      )
      .orderBy(desc(products.createdAt))
      .limit(limit);
    
    return searchResults;
  } catch (error) {
    console.error('Error searching products:', error);
    return [];
  }
}

/**
 * Convert database product to display format
 */
export function convertProductForDisplay(product: ProductFromDB): ProductForDisplay {
  return {
    id: product.id.toString(),
    name: product.name,
    price: parseFloat(product.price) || 0,
    image: product.imageUrl || '/placeholder-image.jpg',
    category: product.category || undefined,
    description: product.description || undefined,
    stock: product.stock,
    sku: product.sku || undefined,
    colors: 1, // Default to 1 color - can be enhanced later
  };
}

/**
 * Convert multiple database products to display format
 */
export function convertProductsForDisplay(products: ProductFromDB[]): ProductForDisplay[] {
  return products.map(convertProductForDisplay);
}

