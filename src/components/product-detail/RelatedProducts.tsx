"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';

interface RelatedProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  slug: string;
  originalPrice?: number;
  isOnSale?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

interface RelatedProductsProps {
  currentProductId: string;
  category?: string;
  limit?: number;
}

export default function RelatedProducts({ 
  currentProductId, 
  category, 
  limit = 12 
}: RelatedProductsProps) {
  const [products, setProducts] = useState<RelatedProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchRelatedProducts();
  }, [currentProductId, category]);

  const fetchRelatedProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams({
        limit: limit.toString(),
        excludeId: currentProductId,
      });

      if (category) {
        params.append('category', category);
      }

      const response = await fetch(`/api/products/related?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch related products');
      }

      const data = await response.json();
      setProducts(data);
    } catch (err) {
      console.error('Error fetching related products:', err);
      setError('Unable to load related products');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="py-3">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || products.length === 0) {
    return null; // Don't show section if there are no related products
  }

  return (
    <div className="py-3 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-3">
          <h2 className="text-base font-bold mb-1">YOU MIGHT ALSO LIKE</h2>
          <p className="text-gray-600 text-xs">
            Discover similar products that complement your style
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              id={product.id}
              name={product.name}
              price={product.price}
              image={product.image}
              href={`/products/${product.slug}`}
              originalPrice={product.originalPrice}
              isOnSale={product.isOnSale}
              stock={product.stock}
              rating={product.rating}
              reviewCount={product.reviewCount}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
