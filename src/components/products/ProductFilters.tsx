"use client";

import React, { useState } from "react";
import { X, ChevronDown, Star, DollarSign } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface FilterOptions {
  category?: string;
  priceRange?: [number, number];
  brand?: string[];
  color?: string[];
  size?: string[];
  inStock?: boolean;
  rating?: number;
  sortBy?: string;
}

interface ProductFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
  onClearFilters: () => void;
  categories: string[];
  brands: string[];
  colors: string[];
  sizes: string[];
  isOpen?: boolean;
  onToggle?: () => void;
  isMobile?: boolean;
}

const priceRanges = [
  { label: "Under $25", min: 0, max: 25 },
  { label: "$25 - $50", min: 25, max: 50 },
  { label: "$50 - $100", min: 50, max: 100 },
  { label: "$100 - $200", min: 100, max: 200 },
  { label: "$200 - $500", min: 200, max: 500 },
  { label: "Over $500", min: 500, max: 1000 },
];

const sortOptions = [
  { value: "featured", label: "Featured" },
  { value: "newest", label: "Newest First" },
  { value: "price-low", label: "Price: Low to High" },
  { value: "price-high", label: "Price: High to Low" },
  { value: "rating", label: "Highest Rated" },
  { value: "name", label: "Name: A to Z" },
];

export default function ProductFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  categories,
  brands,
  colors,
  sizes,
  isOpen = true,
  onToggle,
  isMobile = false,
}: ProductFiltersProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(["category", "price", "sort"])
  );

  const toggleSection = (section: string) => {
    setExpandedSections(prev => {
      const newSet = new Set(prev);
      if (newSet.has(section)) {
        newSet.delete(section);
      } else {
        newSet.add(section);
      }
      return newSet;
    });
  };

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: filters.category === category ? undefined : category,
    });
  };

  const handlePriceRangeChange = (min: number, max: number) => {
    onFiltersChange({
      ...filters,
      priceRange: [min, max],
    });
  };

  const handleBrandToggle = (brand: string) => {
    const currentBrands = filters.brand || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    
    onFiltersChange({
      ...filters,
      brand: newBrands.length > 0 ? newBrands : undefined,
    });
  };

  const handleColorToggle = (color: string) => {
    const currentColors = filters.color || [];
    const newColors = currentColors.includes(color)
      ? currentColors.filter(c => c !== color)
      : [...currentColors, color];
    
    onFiltersChange({
      ...filters,
      color: newColors.length > 0 ? newColors : undefined,
    });
  };

  const handleSizeToggle = (size: string) => {
    const currentSizes = filters.size || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    
    onFiltersChange({
      ...filters,
      size: newSizes.length > 0 ? newSizes : undefined,
    });
  };

  const handleRatingChange = (rating: number) => {
    onFiltersChange({
      ...filters,
      rating: filters.rating === rating ? undefined : rating,
    });
  };

  const handleSortChange = (sort: string) => {
    onFiltersChange({
      ...filters,
      sortBy: sort,
    });
  };

  const handleInStockToggle = () => {
    onFiltersChange({
      ...filters,
      inStock: !filters.inStock,
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.category) count++;
    if (filters.priceRange) count++;
    if (filters.brand && filters.brand.length > 0) count++;
    if (filters.color && filters.color.length > 0) count++;
    if (filters.size && filters.size.length > 0) count++;
    if (filters.inStock) count++;
    if (filters.rating) count++;
    return count;
  };

  const FilterSection = ({
    title,
    section,
    children,
  }: {
    title: string;
    section: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200 last:border-b-0">
      <button
        onClick={() => toggleSection(section)}
        className="w-full flex items-center justify-between py-3 px-4 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium text-gray-900">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            expandedSections.has(section) ? "rotate-180" : ""
          }`}
        />
      </button>
      <AnimatePresence>
        {expandedSections.has(section) && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const filterContent = (
    <div className={`${isMobile ? "p-4" : ""}`}>
      {/* Sort */}
      <FilterSection title="Sort By" section="sort">
        <div className="space-y-2">
          {sortOptions.map(option => (
            <label key={option.value} className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="sort"
                value={option.value}
                checked={filters.sortBy === option.value}
                onChange={() => handleSortChange(option.value)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{option.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Categories */}
      <FilterSection title="Category" section="category">
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.category === category}
                onChange={() => handleCategoryChange(category)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700 capitalize">{category}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range" section="price">
        <div className="space-y-2">
          {priceRanges.map(range => (
            <label key={range.label} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={
                  filters.priceRange &&
                  filters.priceRange[0] === range.min &&
                  filters.priceRange[1] === range.max
                }
                onChange={() => handlePriceRangeChange(range.min, range.max)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <span className="text-sm text-gray-700">{range.label}</span>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Brands */}
      {brands.length > 0 && (
        <FilterSection title="Brand" section="brand">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {brands.map(brand => (
              <label key={brand} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.brand?.includes(brand) || false}
                  onChange={() => handleBrandToggle(brand)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{brand}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Colors */}
      {colors.length > 0 && (
        <FilterSection title="Color" section="color">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {colors.map(color => (
              <label key={color} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.color?.includes(color) || false}
                  onChange={() => handleColorToggle(color)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700 capitalize">{color}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Sizes */}
      {sizes.length > 0 && (
        <FilterSection title="Size" section="size">
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {sizes.map(size => (
              <label key={size} className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.size?.includes(size) || false}
                  onChange={() => handleSizeToggle(size)}
                  className="mr-2 text-primary focus:ring-primary"
                />
                <span className="text-sm text-gray-700">{size}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Rating */}
      <FilterSection title="Customer Rating" section="rating">
        <div className="space-y-2">
          {[4, 3, 2, 1].map(rating => (
            <label key={rating} className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={filters.rating === rating}
                onChange={() => handleRatingChange(rating)}
                className="mr-2 text-primary focus:ring-primary"
              />
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${
                      i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
                    }`}
                  />
                ))}
                <span className="ml-2 text-sm text-gray-700">& up</span>
              </div>
            </label>
          ))}
        </div>
      </FilterSection>

      {/* Availability */}
      <FilterSection title="Availability" section="availability">
        <label className="flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={filters.inStock || false}
            onChange={handleInStockToggle}
            className="mr-2 text-primary focus:ring-primary"
          />
          <span className="text-sm text-gray-700">In Stock Only</span>
        </label>
      </FilterSection>

      {/* Clear Filters */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={onClearFilters}
          className="w-full py-2 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-sm bg-white shadow-xl"
          >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Filters</h2>
              <div className="flex items-center gap-2">
                {getActiveFilterCount() > 0 && (
                  <span className="text-sm text-gray-500">
                    {getActiveFilterCount()} active
                  </span>
                )}
                <button
                  onClick={onToggle}
                  className="p-2 text-gray-500 hover:text-gray-700"
                  aria-label="Close filters"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="overflow-y-auto h-full pb-20">
              {filterContent}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Filters</h2>
        {getActiveFilterCount() > 0 && (
          <span className="text-sm text-gray-500">{getActiveFilterCount()} active</span>
        )}
      </div>
      {filterContent}
    </div>
  );
}
