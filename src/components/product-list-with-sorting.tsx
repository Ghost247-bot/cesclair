"use client";

import { useState, useMemo, useEffect } from 'react';
import ProductCard from './product-card';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

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

interface ProductListWithSortingProps {
  category?: string;
  search?: string;
  limit?: number;
  showFilters?: boolean;
  showItemCount?: boolean;
  sortBy?: 'featured' | 'newest' | 'price-low' | 'price-high';
}

export default function ProductListWithSorting({ 
  category, 
  search, 
  limit = 1000,
  showFilters = true,
  showItemCount = true,
  sortBy: initialSortBy = 'featured'
}: ProductListWithSortingProps) {
  const [products, setProducts] = useState<ProductFromDB[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'featured' | 'newest' | 'price-low' | 'price-high'>(initialSortBy);
  const [showSortDropdown, setShowSortDropdown] = useState(false);

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

  const sortedProducts = useMemo(() => {
    // Products are already sorted by the API, but we might need to reverse for featured
    return [...products];
  }, [products]);

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

  return (
    <>
      {(showFilters || showItemCount) && (
        <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
          {showFilters && (
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-medium hover:opacity-70 transition-opacity">
                <SlidersHorizontal size={16} />
                <span>FILTER</span>
              </button>
            </div>
          )}

          <div className="flex items-center gap-6 ml-auto">
            {showItemCount && (
              <span className="text-[13px] text-secondary-text">
                {sortedProducts.length} items
              </span>
            )}
            
            <div className="relative">
              <button 
                onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-medium hover:opacity-70 transition-opacity"
              >
                <span>
                  {sortBy === 'featured' && 'Featured'}
                  {sortBy === 'newest' && 'Newest'}
                  {sortBy === 'price-low' && 'Price: Low to High'}
                  {sortBy === 'price-high' && 'Price: High to Low'}
                </span>
                <ChevronDown size={16} className={`transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
              </button>

              {showSortDropdown && (
                <>
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowSortDropdown(false)}
                  />
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-border shadow-lg z-20">
                    <button
                      onClick={() => { setSortBy('featured'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] hover:bg-secondary transition-colors ${sortBy === 'featured' ? 'font-medium' : ''}`}
                    >
                      Featured
                    </button>
                    <button
                      onClick={() => { setSortBy('newest'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] hover:bg-secondary transition-colors ${sortBy === 'newest' ? 'font-medium' : ''}`}
                    >
                      Newest
                    </button>
                    <button
                      onClick={() => { setSortBy('price-low'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] hover:bg-secondary transition-colors ${sortBy === 'price-low' ? 'font-medium' : ''}`}
                    >
                      Price: Low to High
                    </button>
                    <button
                      onClick={() => { setSortBy('price-high'); setShowSortDropdown(false); }}
                      className={`w-full text-left px-4 py-3 text-[13px] hover:bg-secondary transition-colors ${sortBy === 'price-high' ? 'font-medium' : ''}`}
                    >
                      Price: High to Low
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

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
    </>
  );
}

