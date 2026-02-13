"use client";

import { useState } from 'react';
import { X, Heart, ShoppingBag, Star, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';
import { normalizeImagePath } from '@/lib/utils';

interface ProductQuickViewProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    description?: string | null;
    imageUrl?: string | null;
    stock: number;
    rating?: number;
    reviewCount?: number;
    colors?: string[];
    sizes?: string[];
  };
  isOpen: boolean;
  onClose: () => void;
}

export default function ProductQuickView({ 
  product, 
  isOpen, 
  onClose 
}: ProductQuickViewProps) {
  const { data: session } = useSession();
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  if (!isOpen) return null;

  const productImages = product.imageUrl ? [product.imageUrl] : [];

  const addToCart = async () => {
    if (!session) {
      toast.error("Please sign in to add items to cart");
      return;
    }

    setIsAddingToCart(true);
    try {
      const response = await fetch("/api/cart/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          productId: product.id,
          quantity,
          size: selectedSize || undefined,
          color: selectedColor || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Failed to add to cart");
        return;
      }

      toast.success(`${product.name} added to cart!`);
      onClose();
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
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

      setIsWishlisted(data.isWishlisted);
      toast.success(data.isWishlisted ? "Added to wishlist!" : "Removed from wishlist!");
    } catch (err) {
      console.error("Error updating wishlist:", err);
      toast.error("Failed to update wishlist");
    }
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Quick View</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 max-h-[calc(90vh-80px)] overflow-y-auto">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
              {productImages.length > 0 ? (
                <Image
                  src={normalizeImagePath(productImages[activeImage])}
                  alt={product.name}
                  width={400}
                  height={400}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-400">No image available</span>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`w-12 h-12 rounded border-2 transition-all ${
                      activeImage === index ? "border-black scale-105" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={normalizeImagePath(productImages[index])}
                      alt={`${product.name} ${index + 1}`}
                      width={48}
                      height={48}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              
              {product.rating && (
                <div className="flex items-center gap-2 mb-2">
                  {renderStars(product.rating)}
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
                </div>
              )}
              
              <p className="text-2xl font-semibold mb-3">${parseFloat(product.price).toFixed(2)}</p>
              
              {product.description && (
                <p className="text-gray-600 text-sm line-clamp-3">{product.description}</p>
              )}
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Color: {product.colors[selectedColor]}</h4>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-8 h-8 rounded-full border-2 transition-all ${
                        selectedColor === index ? "border-black scale-110" : "border-gray-300 hover:border-gray-400"
                      }`}
                      style={{ backgroundColor: color.toLowerCase() }}
                      title={color}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div>
                <h4 className="font-medium mb-2">Size</h4>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-3 py-1 border rounded text-sm transition-all ${
                        selectedSize === size
                          ? "border-black bg-black text-white"
                          : "border-gray-300 hover:border-gray-400"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <h4 className="font-medium mb-2">Quantity</h4>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-1 hover:bg-gray-100"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-3 py-1 min-w-[50px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-1 hover:bg-gray-100"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
                
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={addToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full bg-black text-white py-3 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    Add to Cart
                    {product.stock === 0 && <span className="text-sm">(Out of Stock)</span>}
                  </>
                )}
              </button>

              <button
                onClick={toggleWishlist}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Heart 
                  className={`w-4 h-4 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} 
                />
                {isWishlisted ? "Remove from Wishlist" : "Add to Wishlist"}
              </button>

              <button
                onClick={() => window.open(`/products/${product.slug}`, '_blank')}
                className="w-full text-center text-sm text-blue-600 hover:underline"
              >
                View Full Details
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
