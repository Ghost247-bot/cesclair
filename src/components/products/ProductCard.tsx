"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Heart, Plus, Eye, Share2, ShoppingCart, Star, Package } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/utils";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  description?: string;
  category?: string;
  imageUrl?: string;
  stock: number;
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  sizes?: string[];
  isNew?: boolean;
  isOnSale?: boolean;
  originalPrice?: string;
}

interface ProductCardProps {
  product: Product;
  isSelected?: boolean;
  onSelect?: (productId: number) => void;
  onAddToCart?: (product: Product, options?: { size?: string; color?: string }) => void;
  onQuickView?: (productId: number) => void;
  onShare?: (product: Product) => void;
  onToggleWishlist?: (productId: number) => void;
  onToggleCompare?: (productId: number) => void;
  isInWishlist?: boolean;
  isInCompareList?: boolean;
  loading?: boolean;
  viewMode?: "grid" | "list";
  showActions?: boolean;
  showSelection?: boolean;
}

export default function ProductCard({
  product,
  isSelected = false,
  onSelect,
  onAddToCart,
  onQuickView,
  onShare,
  onToggleWishlist,
  onToggleCompare,
  isInWishlist = false,
  isInCompareList = false,
  loading = false,
  viewMode = "grid",
  showActions = true,
  showSelection = false,
}: ProductCardProps) {
  const [selectedSize, setSelectedSize] = useState(product.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(product.colors?.[0] || "");
  const [showSizeSelector, setShowSizeSelector] = useState(false);
  const [showColorSelector, setShowColorSelector] = useState(false);

  const handleAddToCart = () => {
    if (product.stock <= 0) {
      toast.error("This product is out of stock");
      return;
    }
    onAddToCart?.(product, { size: selectedSize, color: selectedColor });
  };

  const handleQuickView = () => {
    onQuickView?.(product.id);
  };

  const handleShare = () => {
    onShare?.(product);
  };

  const handleToggleWishlist = () => {
    onToggleWishlist?.(product.id);
  };

  const handleToggleCompare = () => {
    onToggleCompare?.(product.id);
  };

  const handleSelect = () => {
    onSelect?.(product.id);
  };

  const isOutOfStock = product.stock <= 0;
  const hasDiscount = product.isOnSale && product.originalPrice;

  if (viewMode === "list") {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`group bg-white rounded-lg border-2 transition-all duration-200 hover:shadow-lg ${
          isSelected ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200"
        }`}
      >
        <div className="flex gap-4 p-4">
          {/* Selection Checkbox */}
          {showSelection && (
            <div className="flex-shrink-0 pt-2">
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleSelect}
                disabled={isOutOfStock}
                className="h-5 w-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
                aria-label={`Select ${product.name}`}
              />
            </div>
          )}

          {/* Product Image */}
          <div className="relative w-24 h-24 flex-shrink-0">
            {product.imageUrl ? (
              <Image
                src={normalizeImagePath(product.imageUrl)}
                alt={product.name}
                fill
                className="object-cover rounded-md"
                unoptimized
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}

            {/* Out of Stock Overlay */}
            {isOutOfStock && (
              <div className="absolute inset-0 bg-black bg-opacity-60 rounded-md flex items-center justify-center">
                <div className="text-white text-center">
                  <div className="text-xs font-bold">Out of Stock</div>
                </div>
              </div>
            )}

            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {product.isNew && (
                <span className="inline-block bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
                  NEW
                </span>
              )}
              {hasDiscount && (
                <span className="inline-block bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
                  SALE
                </span>
              )}
            </div>
          </div>

          {/* Product Details */}
          <div className="flex-grow min-w-0">
            <div className="flex justify-between items-start mb-2">
              <div className="min-w-0">
                <Link
                  href={`/products/${product.slug}`}
                  className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
                >
                  {product.name}
                </Link>
                {product.category && (
                  <p className="text-sm text-gray-600 capitalize">{product.category}</p>
                )}
              </div>
            </div>

            {/* Rating */}
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
                  {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
                </span>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-2 mb-3">
              {hasDiscount && (
                <span className="text-sm text-gray-500 line-through">
                  ${parseFloat(product.originalPrice!).toFixed(2)}
                </span>
              )}
              <span className="text-xl font-bold text-primary-600">
                ${parseFloat(product.price).toFixed(2)}
              </span>
              {product.stock <= 5 && product.stock > 0 && (
                <span className="text-xs text-red-600 font-medium">
                  Only {product.stock} left
                </span>
              )}
            </div>

            {/* Actions */}
            {showActions && (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock || loading}
                  className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-4 w-4" />
                  Add to Cart
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={handleQuickView}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    aria-label="Quick view"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleToggleWishlist}
                    className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                    aria-label="Add to wishlist"
                  >
                    <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
                  </button>
                  <button
                    onClick={handleShare}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    aria-label="Share product"
                  >
                    <Share2 className="h-4 w-4" />
                  </button>
                  <button
                    onClick={handleToggleCompare}
                    className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                    aria-label="Compare product"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`group bg-white rounded-lg overflow-hidden border-2 transition-all duration-200 hover:shadow-lg ${
        isSelected ? "border-primary-500 ring-2 ring-primary-200" : "border-gray-200"
      }`}
    >
      {/* Selection Checkbox */}
      {showSelection && (
        <div className="absolute top-3 left-3 z-10">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleSelect}
            disabled={isOutOfStock}
            className="h-5 w-5 text-primary border-2 border-gray-300 rounded focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            aria-label={`Select ${product.name}`}
          />
        </div>
      )}

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
            <Package className="h-12 w-12 text-gray-400" />
          </div>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <div className="text-white text-center">
              <div className="text-lg font-bold mb-2">Out of Stock</div>
              <div className="text-sm">This item is currently unavailable</div>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-4 left-4 space-y-2">
          {product.isNew && (
            <span className="inline-block bg-green-600 text-white px-2 py-1 text-xs font-medium rounded">
              NEW
            </span>
          )}
          {hasDiscount && (
            <span className="inline-block bg-red-600 text-white px-2 py-1 text-xs font-medium rounded">
              SALE
            </span>
          )}
        </div>

        {/* Quick Actions */}
        {showActions && (
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
            <div className="flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleQuickView}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                aria-label="Quick view"
              >
                <Eye className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleToggleWishlist}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className={`h-5 w-5 ${isInWishlist ? "fill-current text-red-500" : "text-gray-700"}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-5 w-5 text-gray-700" />
              </button>
              <button
                onClick={handleToggleCompare}
                className="p-3 bg-white bg-opacity-90 rounded-full shadow-lg hover:bg-opacity-100 transition-colors"
                aria-label="Compare product"
              >
                <Plus className="h-5 w-5 text-gray-700" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div className="min-w-0 flex-grow">
            <Link
              href={`/products/${product.slug}`}
              className="text-lg font-medium text-gray-900 hover:text-primary-600 transition-colors line-clamp-2"
            >
              {product.name}
            </Link>
            {product.category && (
              <p className="text-sm text-gray-600 capitalize">{product.category}</p>
            )}
          </div>
        </div>

        {/* Rating */}
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
              {product.rating.toFixed(1)} ({product.reviewCount || 0} reviews)
            </span>
          </div>
        )}

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3">
          {hasDiscount && (
            <span className="text-sm text-gray-500 line-through">
              ${parseFloat(product.originalPrice!).toFixed(2)}
            </span>
          )}
          <span className="text-xl font-bold text-primary-600">
            ${parseFloat(product.price).toFixed(2)}
          </span>
          {product.stock <= 5 && product.stock > 0 && (
            <span className="text-xs text-red-600 font-medium">
              Only {product.stock} left
            </span>
          )}
        </div>

        {/* Actions */}
        {showActions && (
          <div className="flex items-center gap-2">
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock || loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ShoppingCart className="h-4 w-4" />
              Add to Cart
            </button>

            <div className="flex items-center gap-1">
              <button
                onClick={handleToggleWishlist}
                className="p-2 text-gray-600 hover:text-red-500 transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className={`h-4 w-4 ${isInWishlist ? "fill-current text-red-500" : ""}`} />
              </button>
              <button
                onClick={handleShare}
                className="p-2 text-gray-600 hover:text-primary-600 transition-colors"
                aria-label="Share product"
              >
                <Share2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}
