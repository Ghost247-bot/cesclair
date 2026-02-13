"use client";

import { useState } from 'react';
import { ChevronLeft, ChevronRight, Home, Grid, List, Filter, Heart, ShoppingBag, User } from 'lucide-react';
import Link from 'next/link';

interface ProductNavigationProps {
  currentProductId: string;
  categoryName?: string | null;
}

export default function ProductNavigation({ currentProductId, categoryName }: ProductNavigationProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);

  return (
    <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Left Navigation */}
          <div className="flex items-center gap-4">
            <Link 
              href="/products" 
              className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              <span className="text-sm font-medium">Back to Products</span>
            </Link>
            
            {categoryName && (
              <div className="flex items-center gap-2">
                <span className="text-gray-400">|</span>
                <span className="text-sm text-gray-600">{categoryName}</span>
              </div>
            )}
          </div>

          {/* Center Actions */}
          <div className="flex items-center gap-2">
            {/* View Mode Toggle */}
            <div className="flex items-center border border-gray-300 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'grid' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Grid View"
              >
                <Grid className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 rounded transition-colors ${
                  viewMode === 'list' 
                    ? 'bg-black text-white' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>

            {/* Filter Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              <span className="text-sm font-medium">Filters</span>
            </button>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            {/* Quick Actions */}
            <div className="flex items-center gap-2">
              <button
                className="p-2 text-gray-600 hover:text-black transition-colors"
                title="Wishlist"
              >
                <Heart className="w-4 h-4" />
              </button>
              <button
                className="p-2 text-gray-600 hover:text-black transition-colors"
                title="Shopping Cart"
              >
                <ShoppingBag className="w-4 h-4" />
              </button>
            </div>

            {/* User Account */}
            <Link
              href="/account"
              className="flex items-center gap-2 p-2 text-gray-600 hover:text-black transition-colors rounded-lg hover:bg-gray-50"
            >
              <User className="w-4 h-4" />
              <span className="text-sm font-medium">Account</span>
            </Link>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="absolute left-0 right-0 top-full bg-white border border-gray-200 shadow-lg z-50">
            <div className="container mx-auto px-4 py-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Categories */}
                <div>
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <div className="space-y-2">
                    {['Women', 'Men', 'Accessories', 'Shoes'].map((category) => (
                      <Link
                        key={category}
                        href={`/products?category=${category.toLowerCase()}`}
                        className="block py-2 text-sm text-gray-700 hover:text-black transition-colors"
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                </div>

                {/* Size */}
                <div>
                  <h3 className="font-semibold mb-4">Size</h3>
                  <div className="space-y-2">
                    {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map((size) => (
                      <label key={size} className="flex items-center gap-2 py-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-gray-700">{size}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-semibold mb-4">Price Range</h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-sm text-gray-700">Min Price</label>
                      <input 
                        type="number" 
                        placeholder="0"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                    <div>
                      <label className="text-sm text-gray-700">Max Price</label>
                      <input 
                        type="number" 
                        placeholder="500"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black"
                      />
                    </div>
                  </div>
                </div>

                {/* Color */}
                <div>
                  <h3 className="font-semibold mb-4">Color</h3>
                  <div className="space-y-2">
                    {['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Brown'].map((color) => (
                      <label key={color} className="flex items-center gap-2 py-2 text-sm">
                        <input type="checkbox" className="rounded border-gray-300" />
                        <span className="text-gray-700">{color}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200">
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-sm text-gray-600 hover:text-black transition-colors"
                >
                  Clear Filters
                </button>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-4 py-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setShowFilters(false)}
                    className="px-6 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
