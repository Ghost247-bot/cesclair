"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductCard from '@/components/product-card';
import { useState, useMemo, useEffect } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

interface Product {
  id: number;
  name: string;
  price: string;
  imageUrl: string;
  category: string;
  stock: number;
  sku: string;
}

export default function GiftGuidePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const token = localStorage.getItem('bearer_token');
        const response = await fetch('/api/products?limit=50', {
          headers: token ? { 'Authorization': `Bearer ${token}` } : {}
        });
        
        if (response.ok) {
          const data = await response.json();
          // API returns products directly as an array, not wrapped in products property
          setProducts(Array.isArray(data) ? data : []);
        }
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const sortedProducts = useMemo(() => {
    const productsList = [...products];
    
    switch (sortBy) {
      case 'newest':
        return productsList.reverse();
      case 'price-low':
        return productsList.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
      case 'price-high':
        return productsList.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
      case 'featured':
      default:
        return productsList;
    }
  }, [products, sortBy]);

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">The Gift Guide</h1>
            <p className="text-body-large text-secondary-text">Gifting you can feel good about.</p>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-medium hover:opacity-70 transition-opacity">
                <SlidersHorizontal size={16} />
                <span>FILTER</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[13px] text-secondary-text">
                {isLoading ? '...' : `${sortedProducts.length} items`}
              </span>
              
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

          {isLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : sortedProducts.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-body-large text-secondary-text">No products available at the moment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {sortedProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id.toString()}
                  name={product.name}
                  price={parseFloat(product.price)}
                  image={product.imageUrl}
                  colors={1}
                  href={`/products/${product.id}`}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}