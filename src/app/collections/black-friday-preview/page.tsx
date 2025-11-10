"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductCard from '@/components/product-card';
import { getProductsByGender } from '@/lib/products';
import { useState, useMemo } from 'react';
import { ChevronDown, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface PromotionProduct {
  id: string;
  name: string;
  price: number;
  image: string;
  colors?: number;
  category: string;
  gender: 'women' | 'men';
  originalPrice: number;
  isOnSale: boolean;
}

export default function BlackFridayPreviewPage() {
  const allProducts = getProductsByGender('men');
  
  // Apply 30% discount to all men's products for promotion
  const promotionProducts: PromotionProduct[] = allProducts.map(product => ({
    ...product,
    originalPrice: product.price,
    price: Math.round(product.price * 0.7 * 100) / 100, // 30% off
    isOnSale: true,
  }));

  const [sortBy, setSortBy] = useState('featured');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    categories: [] as string[],
    minColors: '',
  });

  // Get unique categories
  const availableCategories = useMemo(() => {
    const cats = promotionProducts
      .map(p => p.category)
      .filter((cat): cat is string => cat !== undefined && cat !== '');
    return Array.from(new Set(cats));
  }, [promotionProducts]);

  // Get price range
  const priceRange = useMemo(() => {
    const prices = promotionProducts.map(p => p.price);
    return {
      min: Math.min(...prices),
      max: Math.max(...prices),
    };
  }, [promotionProducts]);

  // Filter and sort products
  const filteredAndSortedProducts = useMemo(() => {
    let filtered = [...promotionProducts];

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
  }, [promotionProducts, filters, sortBy]);

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
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Promotional Banner */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-black text-white py-3 text-center"
        >
          <p className="text-sm md:text-base font-medium uppercase tracking-wider">
            BLACK FRIDAY PREVIEW: 30% OFF OUR FAVORITES
          </p>
        </motion.div>

        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-12"
          >
            <div className="mb-4">
              <nav className="text-sm text-secondary-text mb-4">
                <span className="hover:text-primary-text cursor-pointer">Home</span>
                <span className="mx-2">/</span>
                <span className="hover:text-primary-text cursor-pointer">Men</span>
                <span className="mx-2">/</span>
                <span className="text-primary-text">Black Friday Preview Event</span>
              </nav>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight">
              Collection: Black Friday Preview Event
            </h1>
            <p className="text-lg md:text-xl text-secondary-text max-w-2xl">
              Save on some of our favorites—for a limited time only.
            </p>
          </motion.div>

          {/* Filter & Sort Bar */}
          <div className="sticky top-[60px] md:top-[64px] bg-background border-b border-border z-40 mb-8">
            <div className="container mx-auto">
              <div className="flex items-center justify-between h-14">
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

                <div className="flex items-center gap-2">
                  <span className="text-body-small text-muted-foreground hidden sm:inline">
                    {filteredAndSortedProducts.length} {filteredAndSortedProducts.length === 1 ? 'item' : 'items'}
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
            </div>

            {/* Filter Panel */}
            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-b border-border bg-background overflow-hidden"
                >
                  <div className="container mx-auto px-6 py-6">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-lg font-medium">Filters</h3>
                      <div className="flex items-center gap-4">
                        {hasActiveFilters && (
                          <button
                            onClick={clearFilters}
                            className="text-sm text-secondary-text hover:text-primary-text underline"
                          >
                            Clear All
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                              onChange={(e) => setFilters(prev => ({ ...prev, minPrice: e.target.value }))}
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
                              onChange={(e) => setFilters(prev => ({ ...prev, maxPrice: e.target.value }))}
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
                            onChange={(e) => setFilters(prev => ({ ...prev, minColors: e.target.value }))}
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
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Product Grid */}
          {filteredAndSortedProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-secondary-text mb-4">No products match your filters</p>
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
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
              {filteredAndSortedProducts.map((product) => (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ProductCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    image={product.image}
                    colors={product.colors}
                    href={`/products/${product.id}`}
                    originalPrice={product.originalPrice}
                    isOnSale={product.isOnSale}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}

