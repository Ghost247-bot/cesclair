"use client";

import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, SlidersHorizontal, X } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  category?: string;
}

interface ProductGridProps {
  title: string;
  description?: string;
  products: Product[];
  showFilters?: boolean;
}

interface FilterState {
  minPrice: string;
  maxPrice: string;
  categories: string[];
  minColors: string;
}

const ProductGrid = ({ title, description, products, showFilters = true }: ProductGridProps) => {
  const [sortBy, setSortBy] = useState('featured');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState<FilterState>({
    minPrice: '',
    maxPrice: '',
    categories: [],
    minColors: '',
  });

  // Get unique categories from products
  const availableCategories = useMemo(() => {
    const cats = products
      .map(p => p.category)
      .filter((cat): cat is string => cat !== undefined && cat !== '');
    return Array.from(new Set(cats));
  }, [products]);

  // Get price range
  const priceRange = useMemo(() => {
    const prices = products.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [products]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...products];

    // Apply price filter
    if (filters.minPrice) {
      const min = parseFloat(filters.minPrice);
      if (!isNaN(min)) {
        filtered = filtered.filter(p => p.price >= min);
      }
    }
    if (filters.maxPrice) {
      const max = parseFloat(filters.maxPrice);
      if (!isNaN(max)) {
        filtered = filtered.filter(p => p.price <= max);
      }
    }

    // Apply category filter
    if (filters.categories.length > 0) {
      filtered = filtered.filter(p => p.category && filters.categories.includes(p.category));
    }

    // Apply color filter
    if (filters.minColors) {
      const minColors = parseInt(filters.minColors);
      if (!isNaN(minColors)) {
        filtered = filtered.filter(p => (p.colors || 0) >= minColors);
      }
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        return filtered.reverse();
      case 'price-low':
        return filtered.sort((a, b) => a.price - b.price);
      case 'price-high':
        return filtered.sort((a, b) => b.price - a.price);
      case 'featured':
      default:
        return filtered;
    }
  }, [products, filters, sortBy]);

  const handleFilterChange = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleCategoryToggle = (category: string) => {
    setFilters(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category],
    }));
  };

  const clearFilters = () => {
    setFilters({
      minPrice: '',
      maxPrice: '',
      categories: [],
      minColors: '',
    });
  };

  const hasActiveFilters = filters.minPrice || filters.maxPrice || filters.categories.length > 0 || filters.minColors;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="border-b border-border">
        <div className="container mx-auto py-8 sm:py-12 md:py-16 px-4 sm:px-6">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-medium mb-3 sm:mb-4 tracking-tight">{title}</h1>
          {description && (
            <p className="text-sm sm:text-base md:text-body-large text-muted-foreground max-w-2xl">{description}</p>
          )}
        </div>
      </div>

      {/* Filter & Sort Bar */}
      {showFilters && (
        <div className="sticky top-[60px] md:top-[64px] bg-background border-b border-border z-40">
          <div className="container mx-auto px-4 sm:px-6">
            <div className="flex items-center justify-between h-12 sm:h-14">
              <button
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`flex items-center gap-2 text-body hover:opacity-70 transition-opacity relative ${
                  hasActiveFilters ? 'font-medium' : ''
                }`}
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="text-navigation">FILTER</span>
                {hasActiveFilters && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-black rounded-full"></span>
                )}
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <span className="text-xs sm:text-body-small text-muted-foreground hidden sm:inline">
                  {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'item' : 'items'}
                </span>
                <div className="relative">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="appearance-none bg-transparent text-xs sm:text-body pr-5 sm:pr-6 pl-1 sm:pl-2 py-1 cursor-pointer hover:opacity-70 transition-opacity"
                  >
                    <option value="featured">Featured</option>
                    <option value="newest">Newest</option>
                    <option value="price-low">Price: Low to High</option>
                    <option value="price-high">Price: High to Low</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>
            </div>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {isFilterOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="fixed inset-0 bg-black/50 z-30 md:hidden"
                  onClick={() => setIsFilterOpen(false)}
                />
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-border bg-background overflow-hidden"
                >
                  <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6">
                      <h3 className="text-base sm:text-lg font-medium">Filters</h3>
                      <div className="flex items-center gap-4">
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-secondary-text hover:text-primary-text underline"
                          >
                            Clear All
                          </button>
                        )}
                        <button
                          onClick={() => setIsFilterOpen(false)}
                          className="md:hidden p-1 hover:opacity-70 transition-opacity"
                          aria-label="Close filters"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
                      {/* Price Range */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">Price</h4>
                        <div className="space-y-3">
                          <div>
                            <label htmlFor="minPrice" className="block text-xs text-secondary-text mb-1">
                              Min Price
                            </label>
                            <input
                              type="number"
                              id="minPrice"
                              value={filters.minPrice}
                              onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                              placeholder={`$${priceRange.min}`}
                              min={priceRange.min}
                              max={priceRange.max}
                              className="w-full px-3 py-2 border border-border rounded-[2px] text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                          </div>
                          <div>
                            <label htmlFor="maxPrice" className="block text-xs text-secondary-text mb-1">
                              Max Price
                            </label>
                            <input
                              type="number"
                              id="maxPrice"
                              value={filters.maxPrice}
                              onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                              placeholder={`$${priceRange.max}`}
                              min={priceRange.min}
                              max={priceRange.max}
                              className="w-full px-3 py-2 border border-border rounded-[2px] text-sm focus:ring-1 focus:ring-black focus:border-black outline-none"
                            />
                          </div>
                          <p className="text-xs text-secondary-text">
                            Range: ${priceRange.min} - ${priceRange.max}
                          </p>
                        </div>
                      </div>

                      {/* Categories */}
                      {availableCategories.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">Category</h4>
                          <div className="space-y-2">
                            {availableCategories.map((category) => (
                              <label
                                key={category}
                                className="flex items-center gap-2 cursor-pointer group"
                              >
                                <input
                                  type="checkbox"
                                  checked={filters.categories.includes(category)}
                                  onChange={() => handleCategoryToggle(category)}
                                  className="w-4 h-4 border-border rounded text-black focus:ring-black cursor-pointer"
                                />
                                <span className="text-sm text-secondary-text group-hover:text-primary-text transition-colors capitalize">
                                  {category.replace('-', ' ')}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Color Options */}
                      <div>
                        <h4 className="text-sm font-medium mb-3 uppercase tracking-wider">Color Options</h4>
                        <div>
                          <label htmlFor="minColors" className="block text-xs text-secondary-text mb-1">
                            Minimum Colors
                          </label>
                          <select
                            id="minColors"
                            value={filters.minColors}
                            onChange={(e) => handleFilterChange('minColors', e.target.value)}
                            className="w-full px-3 py-2 border border-border rounded-[2px] text-sm focus:ring-1 focus:ring-black focus:border-black outline-none cursor-pointer"
                          >
                            <option value="">Any</option>
                            <option value="1">1+ colors</option>
                            <option value="3">3+ colors</option>
                            <option value="5">5+ colors</option>
                            <option value="8">8+ colors</option>
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Mobile Apply Button */}
                    <div className="mt-6 md:hidden">
                      <button
                        onClick={() => setIsFilterOpen(false)}
                        className="w-full bg-black text-white py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                      >
                        Apply Filters
                      </button>
                    </div>
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Product Grid */}
      <div className="container mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12 sm:py-16">
            <p className="text-base sm:text-lg text-secondary-text mb-4">No products match your filters</p>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-primary-text underline hover:opacity-70 transition-opacity"
              >
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
            {filteredAndSortedProducts.map((product) => (
            <Link
              key={product.id}
              href={`/products/${product.id}`}
              className="group"
            >
              <div className="relative aspect-[3/4] mb-3 overflow-hidden bg-secondary">
                <Image
                  src={product.image}
                  alt={product.name}
                  fill
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="space-y-1">
                <h3 className="text-body font-medium group-hover:opacity-70 transition-opacity">
                  {product.name}
                </h3>
                {product.colors && product.colors > 1 && (
                  <p className="text-body-small text-muted-foreground">
                    {product.colors} colors
                  </p>
                )}
                <p className="text-body">${product.price}</p>
              </div>
            </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGrid;
