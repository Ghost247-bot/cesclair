"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { ChevronDown, Minus, Plus, Heart, Share2, Star, Truck, Shield, RefreshCw, Info, Check, X, ZoomIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/utils";

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
  materials?: string[];
  careInstructions?: string;
  dimensions?: {
    width?: number;
    height?: number;
    depth?: number;
    weight?: number;
  };
  colors?: string[];
  sizes?: string[];
  brand?: string;
  madeIn?: string;
  sustainability?: string;
}

export default function ProductDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const productSlug = params?.slug as string;
  const { data: session } = useSession();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");

  useEffect(() => {
    async function fetchProduct() {
      if (!productSlug) return;

      try {
        setIsLoading(true);
        setError(null);

        let response = await fetch(`/api/products/slug/${productSlug}`);
        let data = await response.json();

        if (!response.ok) {
          response = await fetch(`/api/products/${productSlug}`);
          data = await response.json();
        }

        if (!response.ok) {
          setError(data.error || "Product not found");
          return;
        }

        setProduct(data);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError("Failed to load product. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchProduct();
  }, [productSlug]);

  const addToCart = async () => {
    if (!product || !session) {
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
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error("Failed to add to cart");
    } finally {
      setIsAddingToCart(false);
    }
  };

  const toggleWishlist = async () => {
    if (!product || !session) {
      toast.error("Please sign in to manage wishlist");
      return;
    }

    setIsAddingToWishlist(true);
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
    } finally {
      setIsAddingToWishlist(false);
    }
  };

  const shareProduct = () => {
    if (navigator.share && product) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Cesclair`,
        url: window.location.href,
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleImageClick = (index: number) => {
    setActiveImage(index);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">{error || "The product you are looking for could not be found."}</p>
          <Link 
            href="/products" 
            className="inline-block bg-black text-white px-6 py-3 rounded hover:bg-gray-800 transition-colors"
          >
            Browse Products
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.imageUrl ? [product.imageUrl] : [];

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm">
          <Link href="/" className="hover:underline">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/products" className="hover:underline">Products</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-500">{product.name}</span>
        </nav>

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
              {productImages[activeImage] ? (
                <Image
                  src={normalizeImagePath(productImages[activeImage])}
                  alt={product.name}
                  width={600}
                  height={600}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  No image available
                </div>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {productImages.length > 1 && (
              <div className="flex gap-2">
                {productImages.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageClick(index)}
                    className={`w-16 h-16 rounded border-2 transition-all ${
                      activeImage === index ? "border-black scale-105" : "border-gray-200 hover:border-gray-400"
                    }`}
                  >
                    <Image
                      src={normalizeImagePath(productImages[index])}
                      alt={`${product.name} ${index + 1}`}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              <p className="text-2xl font-semibold">${parseFloat(product.price).toFixed(2)}</p>
            </div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">Color: {product.colors[selectedColor]}</h3>
                <div className="flex gap-2">
                  {product.colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-10 h-10 rounded-full border-2 transition-all ${
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
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold">Size</h3>
                  <button
                    onClick={() => setShowSizeGuide(true)}
                    className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                  >
                    <Info size={14} />
                    Size Guide
                  </button>
                </div>
                <div className="flex gap-2">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border rounded transition-all ${
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
              <h3 className="font-semibold mb-3">Quantity</h3>
              <div className="flex items-center gap-4">
                <div className="flex items-center border rounded">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="px-4 py-2 min-w-[60px] text-center">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2 hover:bg-gray-100"
                  >
                    <Plus size={16} />
                  </button>
                </div>
                
                <span className="text-sm text-gray-600">
                  {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="space-y-4">
              <button
                onClick={addToCart}
                disabled={isAddingToCart || product.stock === 0}
                className="w-full bg-black text-white py-3 rounded hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {isAddingToCart ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <>
                    Add to Cart
                    {product.stock === 0 && <span className="text-sm">(Out of Stock)</span>}
                  </>
                )}
              </button>

              <div className="flex gap-4">
                <button
                  onClick={toggleWishlist}
                  disabled={isAddingToWishlist}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50"
                >
                  <Heart 
                    size={16} 
                    className={isWishlisted ? "fill-red-500 text-red-500" : ""}
                  />
                  {isWishlisted ? "Wishlisted" : "Add to Wishlist"}
                </button>

                <button
                  onClick={shareProduct}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  <Share2 size={16} />
                  Share
                </button>
              </div>
            </div>

            {/* Product Features */}
            <div className="space-y-3 pt-6 border-t">
              <div className="flex items-center gap-3">
                <Truck size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Free Shipping</p>
                  <p className="text-sm text-gray-600">On orders over $100</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Shield size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Secure Payment</p>
                  <p className="text-sm text-gray-600">SSL encrypted checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <RefreshCw size={20} className="text-gray-600" />
                <div>
                  <p className="font-medium">Easy Returns</p>
                  <p className="text-sm text-gray-600">30-day return policy</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Size Guide Modal */}
        <AnimatePresence>
          {showSizeGuide && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
              onClick={() => setShowSizeGuide(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Size Guide</h2>
                  <button
                    onClick={() => setShowSizeGuide(false)}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X size={20} />
                  </button>
                </div>
              
                <div className="space-y-6">
                  <div>
                    <h3 className="font-medium mb-3">Size Chart</h3>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-sm">
                        <thead>
                          <tr className="border-b">
                            <th className="text-left p-2">Size</th>
                            <th className="text-left p-2">Chest (cm)</th>
                            <th className="text-left p-2">Waist (cm)</th>
                            <th className="text-left p-2">Hips (cm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-b">
                            <td className="p-2">XS</td>
                            <td className="p-2">84-88</td>
                            <td className="p-2">68-72</td>
                            <td className="p-2">92-96</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">S</td>
                            <td className="p-2">88-92</td>
                            <td className="p-2">72-76</td>
                            <td className="p-2">96-100</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">M</td>
                            <td className="p-2">92-96</td>
                            <td className="p-2">76-80</td>
                            <td className="p-2">100-104</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">L</td>
                            <td className="p-2">96-100</td>
                            <td className="p-2">80-84</td>
                            <td className="p-2">104-108</td>
                          </tr>
                          <tr className="border-b">
                            <td className="p-2">XL</td>
                            <td className="p-2">100-104</td>
                            <td className="p-2">84-88</td>
                            <td className="p-2">108-112</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                
                  <div>
                    <h3 className="font-medium mb-3">How to Measure</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <p><strong>Chest:</strong> Measure around the fullest part of your chest.</p>
                      <p><strong>Waist:</strong> Measure around your natural waistline.</p>
                      <p><strong>Hips:</strong> Measure around the fullest part of your hips.</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
