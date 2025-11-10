"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Minus, Plus, Heart, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Footer from "@/components/sections/footer";

// Mock product data - in real app this would come from API/database
const getProductData = (id: string) => {
  return {
    id,
    name: 'The Cashmere Crew',
    price: 125,
    colors: [
      { name: 'Heather Grey', hex: '#B8B8B8', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg' },
      { name: 'Black', hex: '#0A0A0A', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg' },
      { name: 'Camel', hex: '#C8A882', image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg' },
    ],
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    images: [
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/e3425db7_4c00-3.jpg',
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg',
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/1650930e_3c0c-4.jpg',
      'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg',
    ],
    description: 'Our signature cashmere crew sweater, crafted from Grade-A Mongolian cashmere for unparalleled softness. A timeless essential that gets better with every wear.',
    details: [
      'Grade-A Mongolian cashmere',
      'Ribbed crew neckline, cuffs, and hem',
      'Relaxed fit',
      'Hits at hip',
      '100% Cashmere',
    ],
    care: [
      'Dry clean or hand wash cold',
      'Lay flat to dry',
      'Cool iron if needed',
      'Store folded to maintain shape',
    ],
    shipping: 'Free standard shipping on orders over $125. Express shipping available at checkout.',
    returns: '30-day returns for unworn items in original condition.',
  };
};

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductData(params.id);
  const [selectedColor, setSelectedColor] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [expandedSection, setExpandedSection] = useState<string | null>('details');

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

  return (
    <>
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      <div className="container mx-auto py-4 sm:py-6 md:py-8 px-4 sm:px-6">
        {/* Breadcrumb */}
        <nav className="mb-4 sm:mb-6 text-xs sm:text-body-small">
          <Link href="/" className="text-muted-foreground hover:text-foreground">Home</Link>
          <span className="mx-1 sm:mx-2 text-muted-foreground">/</span>
          <Link href="/women/sweaters" className="text-muted-foreground hover:text-foreground">Sweaters</Link>
          <span className="mx-1 sm:mx-2 text-muted-foreground">/</span>
          <span className="text-foreground truncate block sm:inline">{product.name}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="relative aspect-[3/4] overflow-hidden bg-secondary">
              <Image
                src={product.images[activeImage]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            </div>

            {/* Thumbnail Grid */}
            <div className="grid grid-cols-4 gap-2">
              {product.images.map((image, index) => (
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
          </div>

          {/* Product Info */}
          <div className="lg:sticky lg:top-24 lg:h-fit">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium mb-2">{product.name}</h1>
            <p className="text-xl sm:text-2xl mb-4 sm:mb-6">${product.price}</p>

            {/* Color Selection */}
            <div className="mb-4 sm:mb-6">
              <div className="flex items-center justify-between mb-2 sm:mb-3">
                <label className="text-xs sm:text-body-small text-muted-foreground uppercase tracking-wider">
                  Color: {product.colors[selectedColor].name}
                </label>
              </div>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, index) => (
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
                {product.sizes.map((size) => (
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
                          {product.details.map((detail, index) => (
                            <motion.li 
                              key={index} 
                              className="text-body text-muted-foreground flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <span className="mr-2">•</span>
                              <span>{detail}</span>
                            </motion.li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Care Instructions */}
              <div className="border-b border-border">
                <motion.button
                  onClick={() => toggleSection('care')}
                  className="w-full flex items-center justify-between py-3 sm:py-4 text-left"
                  whileHover={{ x: 2 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="text-xs sm:text-navigation">CARE INSTRUCTIONS</span>
                  <motion.div
                    animate={{ rotate: expandedSection === 'care' ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ChevronDown className="w-5 h-5" />
                  </motion.div>
                </motion.button>
                <AnimatePresence initial={false}>
                  {expandedSection === 'care' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      style={{ overflow: "hidden" }}
                    >
                      <div className="pb-4">
                        <ul className="space-y-2">
                          {product.care.map((instruction, index) => (
                            <motion.li 
                              key={index} 
                              className="text-body text-muted-foreground flex items-start"
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                              <span className="mr-2">•</span>
                              <span>{instruction}</span>
                            </motion.li>
                          ))}
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
                          {product.shipping}
                        </motion.p>
                        <motion.p 
                          className="text-body text-muted-foreground"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.05 }}
                        >
                          {product.returns}
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