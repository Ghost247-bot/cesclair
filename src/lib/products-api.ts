// Utility functions for fetching products from the API

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
 * Fetch a single product by ID
 */
export async function fetchProductById(id: string | number): Promise<ProductFromDB | null> {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/products/${id}`,
      {
        cache: 'no-store',
      }
    );
    
    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return null;
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

