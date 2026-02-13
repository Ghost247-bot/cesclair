// Utility functions for fetching products from the API

import { normalizeImagePath } from './utils';

export interface ProductFromDB {
  id: number;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
  createdAt: string;
  updatedAt: string;
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
 * Fetch all products from the API
 */
export async function fetchAllProducts(limit: number = 1000): Promise<ProductFromDB[]> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?limit=${limit}`, {
      cache: 'no-store', // Always fetch fresh data
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error fetching products:', error);
    return [];
  }
}

/**
 * Fetch products by category
 */
export async function fetchProductsByCategory(category: string, limit: number = 1000): Promise<ProductFromDB[]> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products?category=${encodeURIComponent(category)}&limit=${limit}`,
      {
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    
    const products = await response.json();
    return Array.isArray(products) ? products : [];
  } catch (error) {
    console.error('Error fetching products by category:', error);
    return [];
  }
}

/**
 * Fetch a single product by slug (preferred) or ID (fallback)
 */
export async function fetchProductByIdentifier(identifier: string | number): Promise<ProductFromDB | null> {
  try {
    const idStr = identifier.toString();
    
    // First try slug-based API
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/slug/${encodeURIComponent(idStr)}`,
      {
        cache: 'no-store',
      }
    );
    
    if (response.ok) {
      return await response.json();
    }
    
    // If slug API fails and identifier is numeric, try ID API as fallback
    if (!isNaN(Number(identifier))) {
      const idResponse = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${identifier}`,
        {
          cache: 'no-store',
        }
      );
      
      if (idResponse.ok) {
        return await idResponse.json();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching product by identifier:', error);
    return null;
  }
}

/**
 * Fetch a single product by ID (legacy function - use fetchProductByIdentifier)
 */
export async function fetchProductById(id: string | number): Promise<ProductFromDB | null> {
  return fetchProductByIdentifier(id);
}

/**
 * Convert database product to display format
 */
export function convertProductForDisplay(product: ProductFromDB): ProductForDisplay {
  return {
    id: product.id.toString(),
    name: product.name,
    price: parseFloat(product.price) || 0,
    image: normalizeImagePath(product.imageUrl),
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

