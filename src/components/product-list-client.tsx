"use client";

import { useState, useEffect } from 'react';
import ProductCard from './product-card';

interface ProductFromDB {
  id: number;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
}

interface ProductListClientProps {
  category?: string;
  search?: string;
  limit?: number;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high';
}

export default function ProductListClient({ 
  category, 
  search, 
  limit = 1000,
  sortBy = 'featured'
}: ProductListClientProps) {
  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Build query string
        const params = new URLSearchParams();
        if (category) params.append('category', category);
        if (search) params.append('search', search);
        params.append('limit', limit.toString());
        
        // Add sorting
        if (sortBy === 'price-low') {
          params.append('sort', 'price');
          params.append('order', 'asc');
        } else if (sortBy === 'price-high') {
          params.append('sort', 'price');
          params.append('order', 'desc');
        } else if (sortBy === 'newest') {
          params.append('sort', 'createdAt');
          params.append('order', 'desc');
        }

        const response = await fetch(`/api/products?${params.toString()}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.statusText}`);
        }
        
        const data: ProductFromDB[] = await response.json();
        setProducts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to load products');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [category, search, limit, sortBy]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-body-large text-secondary-text text-red-500">
          Error: {error}
        </p>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-body-large text-secondary-text">
          No products available at the moment.
        </p>
      </div>
    );
  }

  // Apply client-side sorting if needed (for featured, which might need custom logic)
  let sortedProducts = [...products];
  if (sortBy === 'featured') {
    // Keep original order (newest first from API)
    sortedProducts = products;
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
      {sortedProducts.map((product) => (
        <ProductCard
          key={product.id}
          id={product.id.toString()}
          name={product.name}
          price={parseFloat(product.price) || 0}
          image={product.imageUrl || '/placeholder-image.jpg'}
          colors={1}
          href={`/products/${product.id}`}
        />
      ))}
    </div>
  );
}

