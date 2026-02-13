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

interface ParsedDescription {
  badge?: string;
  sustainability?: string;
  description?: string;
  features?: string[];
}

interface Review {
  id: number;
  rating: number;
  comment: string;
  userName: string;
  createdAt: string;
  helpful: number;
}

interface ProductVariant {
  color?: string;
  size?: string;
  price?: string;
  stock?: number;
  imageUrl?: string;
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
  const [expandedSection, setExpandedSection] = useState<string | null>("details");
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isAddingToWishlist, setIsAddingToWishlist] = useState(false);
  
  // Zoom state
  const [isMagnified, setIsMagnified] = useState(false);
  const [magnifyLevel, setMagnifyLevel] = useState(1);
  
  // Additional states
  const [reviews, setReviews] = useState<Review[]>([]);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Product[]>([]);
  const [showSizeGuide, setShowSizeGuide] = useState(false);
  const [selectedTab, setSelectedTab] = useState("description");
  const [notification, setNotification] = useState<string | null>(null);

  // Parse description for badge and sustainability info
  const parseDescription = (description: string | null): ParsedDescription => {
    if (!description) return {};
    
    const badgeMatch = description.match(/Badge:\s*\$?[\d.]+/);
    const sustainabilityMatch = description.match(/Sustainability:\s*([^.]*)/);
    
    return {
      badge: badgeMatch ? badgeMatch[0] : undefined,
      sustainability: sustainabilityMatch ? sustainabilityMatch[1].trim() : undefined,
      description: description
        .replace(/Badge:\s*\$?[\d.]+\.\s*/, "")
        .replace(/Sustainability:\s*[^.]*/g, "")
        .trim()
    };
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!productSlug) return;

      try {
        setIsLoading(true);
        setError(null);

        // Try slug-based API first, then fallback to ID
        let response = await fetch(`/api/products/slug/${productSlug}`);
        let data = await response.json();

        if (!response.ok) {
          // If slug fails, try ID as fallback
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
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleMagnify = (level: number) => {
    setMagnifyLevel(level);
    setIsMagnified(level > 1);
  };
  
  const handleImageClick = (index: number) => {
    setActiveImage(index);
    setIsMagnified(false);
    setMagnifyLevel(1);
  };
  
  const getMagnifyTransform = () => {
    const scale = isMagnified ? 2 : 1;
    return {
      transform: `scale(${scale})`,
      transition: "transform 0.3s ease-in-out"
    };
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error || !product) {

const addToCart = async () => {
  if (!product || !session) {
    toast.error("Please sign in to add items to cart");
    return;
  }
            
            {/* Rating */}
            {product.rating && (
              <div className="flex items-center gap-2 mb-3">
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                    />
                  ))}
        {notification && (
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="fixed top-4 right-4 z-50 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg"
          >
            {notification}
          </motion.div>
        )}
      </AnimatePresence>

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
              
              {/* Zoom Controls */}
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleMagnify(2)}
                  className="p-2 bg-white rounded-full shadow-md hover:scale-110 transition-transform"
                >
                  <ZoomIn size={16} />
                </button>
              </div>

              {/* Badge */}
              {parsedDesc.badge && (
                <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                  {parsedDesc.badge}
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
            {/* Brand and Rating */}
            <div>
              {product.brand && (
                <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
              {/* Rating */}
              {product.rating && (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                      />
                    ))}
                  </div>
                  <span className="text-sm font-medium">{product.rating.toFixed(1)}</span>
                  <span className="text-sm text-gray-500">({product.reviewCount || 0} reviews)</span>
                  <Link href="#reviews" className="text-sm text-blue-600 hover:underline">
                    Write a review
                  </Link>
                </div>
              )}
              
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

        {/* Product Tabs */}
        <div className="mb-12">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8">
              {["description", "details", "reviews", "shipping"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    selectedTab === tab
                      ? "border-black text-black"
                      : "border-transparent text-gray-500 hover:text-gray-700"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-8">
            {/* Description Tab */}
            {selectedTab === "description" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {parsedDesc.description && (
                  <div>
                    <h3 className="font-semibold mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{parsedDesc.description}</p>
                  </div>
                )}

                {parsedDesc.sustainability && (
                  <div className="bg-blue-50 text-blue-800 p-6 rounded-lg">
                    <h3 className="font-semibold mb-2">Sustainability</h3>
                    <p className="text-sm">{parsedDesc.sustainability}</p>
                  </div>
                )}

                {product.materials && product.materials.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-3">Materials</h3>
                    <div className="flex flex-wrap gap-2">
                      {product.materials.map((material, index) => (
                        <span
                          key={index}
                          className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-sm"
                        >
                          {material}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Details Tab */}
            {selectedTab === "details" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-semibold mb-4">Product Details</h3>
                  <dl className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-gray-600">SKU:</dt>
                      <dd className="font-medium">{product.sku || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-gray-600">Brand:</dt>
                      <dd className="font-medium">{product.brand || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-gray-600">Category:</dt>
                      <dd className="font-medium">{product.category || "N/A"}</dd>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                      <dt className="text-gray-600">Stock:</dt>
                      <dd className="font-medium">
                        {product.stock > 0 ? `${product.stock} available` : "Out of stock"}
                      </dd>
                    </div>
                    {product.madeIn && (
                      <div className="flex justify-between py-2 border-b">
                        <dt className="text-gray-600">Made In:</dt>
                        <dd className="font-medium">{product.madeIn}</dd>
                      </div>
                    )}
                  </dl>
                </div>

                {product.dimensions && (
                  <div>
                    <h3 className="font-semibold mb-4">Dimensions</h3>
                    <dl className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {product.dimensions.width && (
                        <div>
                          <dt className="text-gray-600">Width</dt>
                          <dd className="font-medium">{product.dimensions.width} cm</dd>
                        </div>
                      )}
                      {product.dimensions.height && (
                        <div>
                          <dt className="text-gray-600">Height</dt>
                          <dd className="font-medium">{product.dimensions.height} cm</dd>
                        </div>
                      )}
                      {product.dimensions.depth && (
                        <div>
                          <dt className="text-gray-600">Depth</dt>
                          <dd className="font-medium">{product.dimensions.depth} cm</dd>
                        </div>
                      )}
                      {product.dimensions.weight && (
                        <div>
                          <dt className="text-gray-600">Weight</dt>
                          <dd className="font-medium">{product.dimensions.weight} g</dd>
                        </div>
                      )}
                    </dl>
                  </div>
                )}

                {product.careInstructions && (
                  <div>
                    <h3 className="font-semibold mb-3">Care Instructions</h3>
                    <p className="text-gray-700">{product.careInstructions}</p>
                  </div>
                )}
              </motion.div>
            )}

            {/* Reviews Tab */}
            {selectedTab === "reviews" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                id="reviews"
                className="space-y-6"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Customer Reviews</h3>
                  <button className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800">
                    Write a Review
                  </button>
                </div>

                {/* Review Summary */}
                {product.rating && (
                  <div className="bg-gray-50 p-6 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold">{product.rating.toFixed(1)}</div>
                        <div className="flex justify-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < Math.floor(product.rating!) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                            />
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">{product.reviewCount || 0} reviews</p>
                      </div>
                      <div className="flex-1">
                        {[5, 4, 3, 2, 1].map((rating) => (
                          <div key={rating} className="flex items-center gap-2 mb-1">
                            <span className="text-sm w-3">{rating}</span>
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-yellow-400 h-2 rounded-full"
                                style={{ width: `${Math.random() * 100}%` }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Reviews List */}
                <div className="space-y-4">
                  {reviews.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">
                      No reviews yet. Be the first to review this product!
                    </p>
                  ) : (
                    reviews.map((review) => (
                      <div key={review.id} className="border-b pb-4">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  size={12}
                                  className={i < review.rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
                                />
                              ))}
                            </div>
                            <span className="font-medium">{review.userName}</span>
                          </div>
                          <span className="text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-gray-700 mb-2">{review.comment}</p>
                        <div className="flex items-center gap-4 text-sm">
                          <button className="text-gray-600 hover:text-gray-900">
                            Helpful ({review.helpful})
                          </button>
                          <button className="text-gray-600 hover:text-gray-900">Report</button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* Shipping Tab */}
            {selectedTab === "shipping" && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                <div>
                  <h3 className="font-semibold mb-4">Shipping & Returns</h3>
                  <div className="space-y-4 text-sm">
                    <div>
                      <h4 className="font-medium mb-2">Shipping Options</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          Standard Shipping (5-7 business days) - $5.99
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          Express Shipping (2-3 business days) - $12.99
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          Free Shipping on orders over $100
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Return Policy</h4>
                      <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          30-day return policy from date of delivery
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          Items must be unworn and in original packaging
                        </li>
                        <li className="flex items-center gap-2">
                          <Check size={16} className="text-green-500" />
                          Free returns on defective items
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>

        {/* Related Products */}
        {relatedProducts.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {relatedProducts.map((relatedProduct) => (
                <div key={relatedProduct.id} className="group">
                  <Link href={`/products/${relatedProduct.slug}`}>
                    <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-3">
                      {relatedProduct.imageUrl ? (
                        <Image
                          src={normalizeImagePath(relatedProduct.imageUrl)}
                          alt={relatedProduct.name}
                          width={300}
                          height={300}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400">
                          No image
                        </div>
                      )}
                    </div>
                    <h3 className="font-medium text-sm mb-1 line-clamp-1">{relatedProduct.name}</h3>
                    <p className="font-semibold">${parseFloat(relatedProduct.price).toFixed(2)}</p>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
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
        )}
      </AnimatePresence>
    </div>
  );
}
}