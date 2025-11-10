"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronDown, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from "@/components/sections/footer";

interface Product {
  id: number;
  name: string;
  price: string;
  description: string | null;
  category: string | null;
  imageUrl: string | null;
  stock: number;
  sku: string | null;
}

export default function ProductDetailPageClient() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            setError('Product not found');
          } else {
            setError('Failed to load product');
          }
          return;
        }
        
        const data = await response.json();
        setProduct(data);
      } catch (err) {
        console.error('Error fetching product:', err);
        setError('Failed to load product');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProduct();
  }, [productId]);

  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  const handleAddToBag = () => {
    if (!selectedSize) {
      alert('Please select a size');
      return;
    }
    // In real app, this would add to cart
    console.log('Adding to bag:', { product, selectedColor, selectedSize, quantity });
  };

  // Default product images if none available
  const productImages = product?.imageUrl 
    ? [product.imageUrl] 
    : ['/placeholder-image.jpg'];
  
  // Mock colors for now - can be enhanced later
  const colors = [
    { name: 'Default', hex: '#B8B8B8', image: productImages[0] },
  ];
  
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'];

  if (isLoading) {
    return (
      <>
        <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
          <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6">
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !product) {
    return (
      <>
        <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
          <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6">
            <div className="text-center py-20">
              <p className="text-body-large text-secondary-text text-red-500">
                {error || 'Product not found'}
              </p>
              <Link href="/" className="mt-4 text-primary hover:underline">
                Return to home
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-body-small">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          {product.category && (
            <>
              <span className="mx-1 sm:mx-2 text-muted-foreground">/</span>
              <Link href={`/${product.category}`} className="text-muted-foreground hover:text-foreground capitalize">
                {product.category}
              </Link>
            </>
          )}
          <span className="mx-1 sm:mx-2 text-muted-foreground">/</span>
          <span className="text-foreground truncate block sm:inline">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              <Image
                src={productImages[activeImage] || '/placeholder-image.jpg'}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail Grid */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveImage(index)}
                    className={`relative aspect-[3/4] overflow-hidden bg-secondary border-2 transition-colors ${
                      activeImage === index ? 'border-primary' : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} view ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-2">{product.name}</h1>
            <p className="text-xl sm:text-2xl mb-4 sm:mb-6">${parseFloat(product.price || '0').toFixed(2)}</p>

            {/* Color Selection */}
            {colors.length > 1 && (
              <div className="mb-4 sm:mb-6">
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  <label className="text-xs sm:text-body-small text-muted-foreground uppercase tracking-wider">
                    Color: {colors[selectedColor].name}
                  </label>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {colors.map((color, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedColor(index)}
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all ${
                        selectedColor === index ? 'border-primary scale-110' : 'border-border'
                      }`}
                      style={{ backgroundColor: color.hex }}
                      title={color.name}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Size Selection */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <label className="text-xs sm:text-body-small text-muted-foreground uppercase tracking-wider">
                  Size
                </label>
                <button className="text-xs sm:text-body-small underline hover:no-underline">
                  Size Guide
                </button>
              </div>
              <div className="grid grid-cols-4 sm:grid-cols-7 gap-2">
                {sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`py-2 sm:py-3 text-xs sm:text-body font-medium border transition-colors ${
                      selectedSize === size
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-background border-border hover:border-primary'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-4 sm:mb-6">
              <label className="text-xs sm:text-body-small text-muted-foreground uppercase tracking-wider mb-2 sm:mb-3 block">
                Quantity
              </label>
              <div className="flex items-center gap-3 sm:gap-4 border border-border w-fit">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 sm:p-3 hover:bg-secondary transition-colors"
                  disabled={quantity <= 1}
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm sm:text-body font-medium min-w-[2ch] text-center">{quantity}</span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 sm:p-3 hover:bg-secondary transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Add to Bag Button */}
            <button
              onClick={handleAddToBag}
              className="w-full bg-primary text-primary-foreground py-3 sm:py-4 text-xs sm:text-navigation hover:bg-primary/90 transition-colors mb-3 sm:mb-4"
            >
              ADD TO BAG
            </button>

            {/* Wishlist & Share */}
            <div className="flex gap-2 sm:gap-4 mb-6 sm:mb-8">
              <motion.button 
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 border border-border hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Heart className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-body hidden sm:inline">Add to Wishlist</span>
                <span className="text-xs sm:hidden">Wishlist</span>
              </motion.button>
              <motion.button 
                className="flex-1 flex items-center justify-center gap-1 sm:gap-2 py-2.5 sm:py-3 border border-border hover:bg-secondary transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Share2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-body">Share</span>
              </motion.button>
            </div>

            {/* Product Description */}
            {product.description && (
              <motion.div 
                className="mb-4 sm:mb-6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <p className="text-sm sm:text-base md:text-body-large text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </motion.div>
            )}

            {/* Accordion Sections */}
            <div className="border-t border-border">
              {/* Details */}
              <div className="border-b border-border">
                <motion.button
                  onClick={() => toggleSection('details')}
                  className="w-full flex items-center justify-between py-3 sm:py-4 text-left"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs sm:text-navigation">PRODUCT DETAILS</span>
                  <motion.div
                    animate={{ rotate: expandedSection === 'details' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'details' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pb-4">
                        <ul className="space-y-2">
                          {product.description && (
                            <motion.li 
                              className="text-body text-muted-foreground flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <span className="mr-2">•</span>
                              <span>{product.description}</span>
                            </motion.li>
                          )}
                          {product.category && (
                            <motion.li 
                              className="text-body text-muted-foreground flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.05 }}
                            >
                              <span className="mr-2">•</span>
                              <span>Category: {product.category}</span>
                            </motion.li>
                          )}
                          {product.sku && (
                            <motion.li 
                              className="text-body text-muted-foreground flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: 0.1 }}
                            >
                              <span className="mr-2">•</span>
                              <span>SKU: {product.sku}</span>
                            </motion.li>
                          )}
                          <motion.li 
                            className="text-body text-muted-foreground flex items-start"
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.15 }}
                          >
                            <span className="mr-2">•</span>
                            <span>Stock: {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}</span>
                          </motion.li>
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Shipping */}
              <div className="border-b border-border">
                <motion.button
                  onClick={() => toggleSection('shipping')}
                  className="w-full flex items-center justify-between py-3 sm:py-4 text-left"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs sm:text-navigation">SHIPPING & RETURNS</span>
                  <motion.div
                    animate={{ rotate: expandedSection === 'shipping' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'shipping' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pb-4 space-y-3">
                        <motion.p 
                          className="text-body text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3 }}
                        >
                          Free standard shipping on orders over $125. Express shipping available at checkout.
                        </motion.p>
                        <motion.p 
                          className="text-body text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                        >
                          30-day returns for unworn items in original condition.
                        </motion.p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}

