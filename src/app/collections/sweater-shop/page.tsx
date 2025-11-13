"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductCard from '@/components/product-card';
import { getProductsByCategory, getProductsByGender } from '@/lib/products';
import { useState, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';

export default function SweaterShopPage() {
  const allProducts = [
    ...getProductsByCategory('sweaters', 'women'),
    ...getProductsByCategory('sweaters', 'men')
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
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">Sweater Shop</h1>
            <p className="text-body-large text-secondary-text">Cozy essentials for every season</p>
          </div>

          {/* Sort Controls */}
          <div className="mb-8 flex items-center justify-between">
            <div className="text-sm text-secondary-text">
              {sortedProducts.length} {sortedProducts.length === 1 ? 'item' : 'items'}
            </div>
              <div className="relative">
                <button 
                  onClick={() => setShowSortDropdown(!showSortDropdown)}
                className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-sm">
                    {sortBy === 'featured' && 'Featured'}
                    {sortBy === 'newest' && 'Newest'}
                    {sortBy === 'price-low' && 'Price: Low to High'}
                    {sortBy === 'price-high' && 'Price: High to Low'}
                  </span>
                <ChevronDown className={`w-4 h-4 transition-transform ${showSortDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showSortDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-card border border-border rounded-lg shadow-lg z-10">
                      <button
                    onClick={() => {
                      setSortBy('featured');
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                      >
                        Featured
                      </button>
                      <button
                    onClick={() => {
                      setSortBy('newest');
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                      >
                        Newest
                      </button>
                      <button
                    onClick={() => {
                      setSortBy('price-low');
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                      >
                        Price: Low to High
                      </button>
                      <button
                    onClick={() => {
                      setSortBy('price-high');
                      setShowSortDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 hover:bg-secondary transition-colors text-sm"
                      >
                        Price: High to Low
                      </button>
                    </div>
                )}
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

          {sortedProducts.length === 0 && (
            <div className="text-center py-12">
              <p className="text-secondary-text">No products found in this collection.</p>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
