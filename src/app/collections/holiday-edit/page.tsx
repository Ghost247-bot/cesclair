"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductCard from '@/components/product-card';
import { getProductsByGender } from '@/lib/products';
import { useState, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function HolidayEditPage() {
  const allProducts = [
    ...getProductsByGender('women').slice(0, 12),
    ...getProductsByGender('men').slice(0, 8)
  ];

  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);

  const sortedProducts = useMemo(() => {
    const products = [...allProducts];
    
    switch (sortBy) {
      case 'newest':
        return products.reverse();
      case 'price-low':
        return products.sort((a, b) => a.price - b.price);
      case 'price-high':
        return products.sort((a, b) => b.price - a.price);
      case 'featured':
      default:
        return products;
    }
  }, [allProducts, sortBy]);

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-8">
            <p className="text-[11px] uppercase tracking-[0.15em] text-secondary-text mb-2">THE HOLIDAY EDIT 001</p>
            <h1 className="text-4xl md:text-5xl font-medium mb-4">Destination Home</h1>
            <p className="text-body-large text-secondary-text">Elevated looks for when life is on airplane mode.</p>
          </div>

          <div className="flex items-center justify-between mb-8 pb-4 border-b border-border">
            <div className="flex items-center gap-3">
              <button className="flex items-center gap-2 text-[11px] uppercase tracking-[0.08em] font-medium hover:opacity-70 transition-opacity">
                <SlidersHorizontal size={16} />
                <span>FILTER</span>
              </button>
            </div>

            <div className="flex items-center gap-6">
              <span className="text-[13px] text-secondary-text">{sortedProducts.length} items</span>
              
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

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {sortedProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                colors={product.colors}
                href={`/products/${product.id}`}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
