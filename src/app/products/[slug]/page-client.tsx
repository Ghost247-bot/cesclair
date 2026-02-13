"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { Minus, Plus, Heart, Share2, Star, Truck, Shield, RefreshCw, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "@/lib/auth-client";
import { toast } from "sonner";
import { normalizeImagePath } from "@/lib/utils";
import { 
  RelatedProducts, 
  ProductDetailsTabs, 
  CustomerReviews, 
  SustainabilitySection, 
  CompleteTheLook,
  ProductNavigation,
  ProductActions,
  ProductBreadcrumbs,
  ProductQuickView
} from "@/components/product-detail";

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
  rating?: number;
  reviewCount?: number;
  colors?: string[];
  sizes?: string[];
  brand?: string;
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
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

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
    setImageLoading(true);
    setImageError(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
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
    <div className="min-h-screen bg-white pt-[60px] md:pt-[64px]">
      <div className="container mx-auto px-4 py-8">
        {/* Product Navigation */}
        <ProductNavigation 
          currentProductId={product.id.toString()}
          categoryName={product.category}
        />

        {/* Breadcrumb */}
        <ProductBreadcrumbs 
          productName={product.name}
          categoryName={product.category}
          brand={product.brand}
        />

        {/* Product Details */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          {/* Product Images */}
          <div className="space-y-4">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden relative group">
              {/* Loading skeleton */}
              {imageLoading && !imageError && (
                <div className="absolute inset-0 bg-gray-200 animate-pulse z-10" />
              )}
              
              {/* Product image */}
              {!imageError ? (
                <Image
                  src={normalizeImagePath(productImages[activeImage])}
                  alt={product.name}
                  width={600}
                  height={600}
                  className={`w-full h-full object-contain group-hover:scale-105 transition-transform duration-300 ${
                    imageLoading ? 'opacity-0' : 'opacity-100'
                  }`}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex flex-col items-center justify-center p-8">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mb-4 flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-gray-500 text-center">Image not available</span>
                  <span className="text-sm text-gray-400 text-center mt-2">{product.name}</span>
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
              {product.brand && (
                <p className="text-sm text-gray-500 mb-1">{product.brand}</p>
              )}
              <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
              
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
            <ProductActions
              product={product}
              onAddToCart={addToCart}
              onToggleWishlist={toggleWishlist}
              isWishlisted={isWishlisted}
              isAddingToCart={isAddingToCart}
              isAddingToWishlist={isAddingToWishlist}
            />

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
          )}
        </AnimatePresence>

        {/* Related Products Section */}
        {product && (
          <RelatedProducts 
            currentProductId={product.id.toString()}
            category={product.category || undefined}
            limit={12}
          />
        )}

        {/* Product Details Tabs */}
        {product && (
          <ProductDetailsTabs 
            description={product.description}
            category={product.category}
            materials={[
              "100% Organic Cotton",
              "Recycled Polyester",
              "Natural Dyes"
            ]}
            careInstructions={[
              "Machine wash cold with like colors",
              "Tumble dry low",
              "Do not bleach",
              "Iron on low heat if needed"
            ]}
            fit={{
              type: "Regular fit, true to size",
              rise: "High-rise waist",
              legOpening: "Wide-leg opening",
              inseam: "Available in 30\" and 32\" inseam",
              recommendations: [
                "If you're between sizes, we recommend sizing up",
                "Model is 5'9\" and wears size M",
                "For a more relaxed fit, consider one size up"
              ]
            }}
          />
        )}

        {/* Complete the Look Section */}
        {product && (
          <CompleteTheLook 
            currentProductId={product.id.toString()}
            category={product.category || undefined}
            style="casual"
          />
        )}

        {/* Customer Reviews Section */}
        {product && (
          <CustomerReviews 
            productId={product.id.toString()}
            productName={product.name}
            averageRating={product.rating || 4.2}
            totalReviews={product.reviewCount || 127}
          />
        )}

        {/* Sustainability Section */}
        {product && (
          <SustainabilitySection 
            materials={{
              sustainable: ["Organic Cotton", "Hemp", "Bamboo"],
              recycled: ["Recycled Polyester", "Upcycled Materials"],
              organic: ["100% Organic Cotton", "Natural Dyes"]
            }}
            production={{
              fairTrade: true,
              ethicalLabor: true,
              carbonNeutral: true,
              waterReduction: 40
            }}
            impact={{
              waterSaved: "2,500 gallons",
              carbonReduced: "15 lbs",
              wasteReduced: "80%"
            }}
          />
        )}
      </div>
    </div>
  );
}
