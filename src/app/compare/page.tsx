"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { X, ArrowLeft, ArrowRight, Heart, ShoppingBag, Star } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { normalizeImagePath } from '@/lib/utils';

interface CompareProduct {
  id: number;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string;
  description?: string;
  category?: string;
  rating?: number;
  reviewCount?: number;
  stock?: number;
  colors?: string[];
  sizes?: string[];
  materials?: string[];
  features?: string[];
}

export default function ComparePage() {
  const { data: session } = useSession();
  const [compareProducts, setCompareProducts] = useState<CompareProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load compare products from localStorage
    const stored = localStorage.getItem('compareItems');
    if (stored) {
      try {
        const items = JSON.parse(stored);
        setCompareProducts(items);
      } catch (error) {
        console.error('Error loading compare items:', error);
      }
    }
    setLoading(false);
  }, []);

  const removeFromCompare = (productId: number) => {
    const updated = compareProducts.filter(p => p.id !== productId);
    setCompareProducts(updated);
    localStorage.setItem('compareItems', JSON.stringify(updated));
    toast.success('Product removed from compare');
  };

  const clearAll = () => {
    setCompareProducts([]);
    localStorage.removeItem('compareItems');
    toast.success('Compare list cleared');
  };

  const addToCart = async (product: CompareProduct) => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    try {
      const response = await fetch("/api/cart", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${product.name} added to cart!`);
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    }
  };

  const toggleWishlist = async (product: CompareProduct) => {
    if (!session) {
      toast.error("Please sign in to manage wishlist");
      return;
    }

    try {
      const response = await fetch("/api/wishlist/toggle", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to update wishlist");
        return;
      }

      toast.success(data.isWishlisted ? "Added to wishlist!" : "Removed from wishlist!");
    } catch (err) {
      console.error("Error updating wishlist:", err);
      toast.error("Failed to update wishlist");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (compareProducts.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Product Comparison</h1>
            <p className="text-gray-600 mb-8">No products selected for comparison</p>
            <Link
              href="/products"
              className="inline-block bg-black text-white px-6 py-3 rounded-lg hover:bg-gray-800 transition-colors"
            >
              Browse Products
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-[60px] md:pt-[64px]">
      {/* Header */}
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/products"
                className="flex items-center gap-2 text-gray-600 hover:text-black transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Products</span>
              </Link>
              <h1 className="text-2xl font-bold">Compare Products ({compareProducts.length})</h1>
            </div>
            <button
              onClick={clearAll}
              className="text-sm text-red-600 hover:text-red-700 transition-colors"
            >
              Clear All
            </button>
          </div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              {/* Product Headers */}
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold bg-gray-50 min-w-[150px]">Feature</th>
                  {compareProducts.map((product) => (
                    <th key={product.id} className="p-4 text-center min-w-[250px]">
                      <div className="space-y-2">
                        <button
                          onClick={() => removeFromCompare(product.id)}
                          className="float-right p-1 hover:bg-gray-100 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                        <Link href={`/products/${product.slug}`}>
                          {product.imageUrl ? (
                            <img
                              src={normalizeImagePath(product.imageUrl)}
                              alt={product.name}
                              className="w-32 h-32 object-contain mx-auto mb-2"
                            />
                          ) : (
                            <div className="w-32 h-32 bg-gray-200 rounded mx-auto mb-2 flex items-center justify-center">
                              <span className="text-gray-400 text-xs">No image</span>
                            </div>
                          )}
                        </Link>
                        <Link
                          href={`/products/${product.slug}`}
                          className="block font-medium text-sm hover:text-blue-600 transition-colors line-clamp-2"
                        >
                          {product.name}
                        </Link>
                        <p className="text-lg font-bold">${parseFloat(product.price).toFixed(2)}</p>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => addToCart(product)}
                            className="flex-1 bg-black text-white px-3 py-2 rounded text-sm hover:bg-gray-800 transition-colors flex items-center justify-center gap-1"
                          >
                            <ShoppingBag className="w-3 h-3" />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => toggleWishlist(product)}
                            className="p-2 border border-gray-300 rounded hover:bg-gray-50 transition-colors"
                          >
                            <Heart className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {/* Price */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Price</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      <span className="font-semibold">${parseFloat(product.price).toFixed(2)}</span>
                    </td>
                  ))}
                </tr>

                {/* Rating */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Rating</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.rating ? (
                        <div className="flex items-center justify-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm">{product.rating.toFixed(1)}</span>
                          <span className="text-xs text-gray-500">({product.reviewCount || 0})</span>
                        </div>
                      ) : (
                        <span className="text-gray-400">No rating</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Category */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Category</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.category || <span className="text-gray-400">-</span>}
                    </td>
                  ))}
                </tr>

                {/* Stock */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Availability</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.stock !== undefined ? (
                        <span className={`text-sm ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Colors */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Colors</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.colors && product.colors.length > 0 ? (
                        <div className="flex justify-center gap-1">
                          {product.colors.slice(0, 4).map((color, index) => (
                            <div
                              key={index}
                              className="w-6 h-6 rounded-full border-2 border-gray-300"
                              style={{ backgroundColor: color.toLowerCase() }}
                              title={color}
                            />
                          ))}
                          {product.colors.length > 4 && (
                            <span className="text-xs text-gray-500 self-center">+{product.colors.length - 4}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Sizes */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Sizes</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.sizes && product.sizes.length > 0 ? (
                        <div className="flex flex-wrap justify-center gap-1">
                          {product.sizes.slice(0, 5).map((size) => (
                            <span key={size} className="text-xs px-2 py-1 bg-gray-100 rounded">
                              {size}
                            </span>
                          ))}
                          {product.sizes.length > 5 && (
                            <span className="text-xs text-gray-500">+{product.sizes.length - 5}</span>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Materials */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Materials</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.materials && product.materials.length > 0 ? (
                        <div className="text-sm space-y-1">
                          {product.materials.slice(0, 3).map((material, index) => (
                            <div key={index} className="text-gray-600">{material}</div>
                          ))}
                          {product.materials.length > 3 && (
                            <div className="text-xs text-gray-500">+{product.materials.length - 3} more</div>
                          )}
                        </div>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>

                {/* Description */}
                <tr className="border-b">
                  <td className="p-4 font-medium bg-gray-50">Description</td>
                  {compareProducts.map((product) => (
                    <td key={product.id} className="p-4 text-center">
                      {product.description ? (
                        <p className="text-sm text-gray-600 line-clamp-3">{product.description}</p>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
