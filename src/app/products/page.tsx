"use client";

import React, { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, X, ChevronDown, Truck, Shield, RefreshCw, ShoppingBag, Heart, Plus, Grid3X3, List, SlidersHorizontal, Star, Share2, Eye, Filter, ArrowRight, Package } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/utils";
import EnhancedCartDrawer from "@/components/sections/enhanced-cart-drawer";
import { useProductNavigation } from "@/hooks/useProductNavigation";
import { useProductActions } from "@/hooks/useProductActions";
import { PRODUCTS_ROUTES, PRODUCT_SECTIONS } from "@/lib/routing/products-routes";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
  createdAt?: string;
  updatedAt?: string;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  sustainability?: string;
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: string;
  tags?: string[];
  material?: string;
  care?: string;
  origin?: string;
  colors?: string[];
  sizes?: string[];
}

interface FilterOptions {
  categories: string[];
  priceRange: [number, number];
  inStock: boolean;
  rating: number;
  sortBy: string;
}

function ProductsPageContent() {
  const { data: session } = useSession();
  
  // Navigation and actions hooks
  const navigation = useProductNavigation();
  const actions = useProductActions();
  
  // Component state
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("featured");
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [isAddingToWishlist, setIsAddingToWishlist] = useState<Set<number>>(new Set());
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
  const [showCart, setShowCart] = useState(false);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showFilters, setShowFilters] = useState(false);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedColors, setSelectedColors] = useState<Set<string>>(new Set());
  const [selectedSizes, setSelectedSizes] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState(0);
  const [showQuickView, setShowQuickView] = useState<number | null>(null);
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        setIsLoading(true);
        setError(null);

        const response = await fetch("/api/products?limit=1000");
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Failed to fetch products");
          return;
        }

        setProducts(data.products || []);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load products. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProducts();
  }, []);

  const categories = useMemo(() => {
    const cats = new Set(products.map(p => p.category).filter(Boolean));
    return Array.from(cats) as string[];
  }, [products]);

  const filteredAndSortedProducts = useMemo(() => {
    let filtered = products.filter(product => {
      // Search filter
      if (searchQuery && !product.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
          !product.description?.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }

      // Category filter
      if (selectedCategory && product.category !== selectedCategory) {
        return false;
      }

      return true;
    });

    // Sort products
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "price-low":
          return parseFloat(a.price) - parseFloat(b.price);
        case "price-high":
          return parseFloat(b.price) - parseFloat(a.price);
        case "rating":
          return (b.rating || 0) - (a.rating || 0);
        case "name":
          return a.name.localeCompare(b.name);
        case "newest":
        default:
          return 0; // Keep original order
      }
    });

    return filtered;
  }, [products, searchQuery, selectedCategory, sortBy]);

  const toggleWishlist = async (productId: number, e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (!session) {
      toast.error("Please sign in to add to wishlist");
      return;
    }

    setIsAddingToWishlist(prev => new Set(prev).add(productId));

    try {
      const response = await fetch(`/api/wishlist/${productId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update wishlist");
        return;
      }

      setWishlist(prev => {
        const newWishlist = new Set(prev);
        if (data.isWishlisted) {
          newWishlist.add(productId);
          toast.success("Added to wishlist!");
        } else {
          newWishlist.delete(productId);
          toast.success("Removed from wishlist!");
        }
        return newWishlist;
      });
    } catch (err) {
      console.error("Error updating wishlist:", err);
      toast.error("Failed to update wishlist");
    } finally {
      setIsAddingToWishlist(prev => {
        const newSet = new Set(prev);
        newSet.delete(productId);
        return newSet;
      });
    }
  };

  const toggleProductSelection = (productId: number) => {
    setSelectedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    });
  };

  const handleAddToCart = async (product: Product, options?: { size?: string; color?: string }) => {
    await actions.addToCart(product.id, {
      size: options?.size,
      color: options?.color,
      onSuccess: () => setShowCart(true),
    });
  };

  const handleAddSelectedToCart = async () => {
    if (selectedProducts.size === 0) {
      toast.error("Please select at least one product");
      return;
    }

    // Check if any selected products are out of stock
    const outOfStockProducts = Array.from(selectedProducts).filter(productId => {
      const product = products.find(p => p.id === productId);
      return product && product.stock <= 0;
    });

    if (outOfStockProducts.length > 0) {
      toast.error("Some selected products are out of stock");
      return;
    }

    const selectedItems = Array.from(selectedProducts).map(productId => {
      const product = products.find(p => p.id === productId);
      return {
        productId,
        size: product?.sizes?.[0],
        color: product?.colors?.[0],
      };
    });

    await actions.addMultipleToCart(selectedItems, {
      onSuccess: (successful, failed) => {
        if (successful > 0) {
          setSelectedProducts(new Set());
          setShowCart(true);
        }
      },
    });
  };

  const handleQuickView = async (productId: number) => {
    setShowQuickView(productId);
    await actions.openQuickView(productId, {
      onSuccess: (product) => setQuickViewProduct(product as Product),
      onError: () => setShowQuickView(null),
    });
  };

  const handleShareProduct = async (product: Product) => {
    await actions.shareProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: product.price,
      imageUrl: product.imageUrl || undefined,
      stock: product.stock,
      category: product.category || undefined,
      brand: product.tags?.[0],
      colors: product.colors,
      sizes: product.sizes,
    });
  };

  const handleToggleWishlist = async (productId: number) => {
    await actions.toggleWishlist(productId, {
      onSuccess: (isWishlisted) => {
        setWishlist(prev => {
          const newSet = new Set(prev);
          if (isWishlisted) {
            newSet.add(productId);
          } else {
            newSet.delete(productId);
          }
          return newSet;
        });
      },
    });
  };

  const handleToggleCompare = (productId: number) => {
    actions.toggleCompare(productId);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    navigation.navigateWithFilters({ category });
  };

  const handleSortChange = (sort: string) => {
    setSortBy(sort);
    navigation.navigateWithFilters({ sort });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      navigation.navigateToSearch(query);
    }
  };

  const handleFilterChange = (filters: any) => {
    navigation.navigateWithFilters(filters);
  };

  const clearAllFilters = () => {
    setSelectedCategory("");
    setPriceRange([0, 1000]);
    setSelectedBrands(new Set());
    setSelectedColors(new Set());
    setSelectedSizes(new Set());
    setInStockOnly(false);
    setMinRating(0);
    navigation.clearFilters();
  };

  const scrollToSection = (sectionId: string) => {
    navigation.scrollToSection(sectionId, { offset: 80 });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md mx-4">
          <h1 className="text-2xl font-light mb-4">Something went wrong</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="border border-gray-900 px-8 py-3 text-sm hover:bg-gray-900 hover:text-white transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">All Products</h1>
            
            <div className="flex items-center gap-4">
              {/* Cart Button */}
              <button
                onClick={() => setShowCart(true)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors relative"
              >
                <ShoppingBag className="h-4 w-4" />
                Cart
                {selectedProducts.size > 0 && (
                  <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                    {selectedProducts.size}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Bar */}
      {selectedProducts.size > 0 && (
        <div className="fixed bottom-8 left-1/2 right-1/2 z-40 bg-white border border-gray-200 rounded-lg shadow-lg p-4 max-w-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-700">
              {selectedProducts.size} item{selectedProducts.size > 1 ? 's' : ''} selected
            </span>
            <button
              onClick={() => setSelectedProducts(new Set())}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Clear selection
            </button>
          </div>
          <button
            onClick={handleAddSelectedToCart}
            className="w-full bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-5 h-5" />
            Add Selected Items to Cart
            <span className="ml-1">→</span>
          </button>
        </div>
      )}

      {/* Products Grid */}
      <div className="container mx-auto px-4 py-8">
        {filteredAndSortedProducts.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-600">Try adjusting your filters to see more results.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredAndSortedProducts.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className={`group bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
                  selectedProducts.has(product.id)
                    ? "border-primary-500 ring-2 ring-primary-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {/* Selection Checkbox */}
                <div className="absolute top-3 left-3 z-10">
                  <input
                    type="checkbox"
                    id={`select-product-${product.id}`}
                    checked={selectedProducts.has(product.id)}
                    onChange={() => toggleProductSelection(product.id)}
                    disabled={product.stock <= 0}
                    className="h-5 w-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    aria-label={`Select ${product.name}`}
                  />
                </div>

                {/* Product Image */}
                <div className="relative h-64 bg-gray-100 overflow-hidden">
                  {product.imageUrl ? (
                    <Image
                      src={normalizeImagePath(product.imageUrl)}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="h-12 w-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Out of Stock Overlay */}
                  {product.stock <= 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <div className="text-white text-center">
                        <div className="text-lg font-bold mb-2">Out of Stock</div>
                        <div className="text-sm">This item is currently unavailable</div>
                      </div>
                    </div>
                  )}
                  
                  {/* Quick Actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
                    <button
                      onClick={() => toggleProductSelection(product.id)}
                      className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg"
                      disabled={product.stock <= 0}
                    >
                      {selectedProducts.has(product.id) ? (
                        <div className="text-primary-600">
                          <div className="w-6 h-6 rounded-full border-2 border-primary-600 bg-white flex items-center justify-center">
                            <svg className="w-4 h-4 text-primary-600" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 1.414l8-8a1 1 0 000-1.414-1.414z" clipRule="evenodd" />
                            </svg>
                          </div>
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full border-2 border-gray-600 bg-white flex items-center justify-center">
                          <Plus className="w-4 h-4 text-gray-600" />
                        </div>
                      )}
                    </button>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-lg font-medium text-gray-900 line-clamp-2">
                      {product.name}
                    </h3>
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      disabled={isAddingToWishlist.has(product.id)}
                      className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                      aria-label="Add to wishlist"
                    >
                      <Heart className={`h-5 w-5 ${wishlist.has(product.id) ? "fill-current" : ""}`} />
                    </button>
                  </div>

                  {product.rating && (
                    <div className="flex items-center mb-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating || 0)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="ml-2 text-sm text-gray-600">
                        {product.rating?.toFixed(1)} ({product.reviewCount || 0} reviews)
                      </span>
                    </div>
                  )}

                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-primary-600">
                      ${product.price}
                    </span>
                    
                    {product.stock <= 5 && (
                      <span className="text-xs text-red-600 font-medium">
                        Only {product.stock} left
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Cart Drawer */}
      <EnhancedCartDrawer isOpen={showCart} onClose={() => setShowCart(false)} />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
      </div>
    }>
      <ProductsPageContent />
    </Suspense>
  );
}
