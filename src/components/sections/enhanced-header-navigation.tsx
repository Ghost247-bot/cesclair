"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, Menu, X, Minus, Plus, Package, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './search-modal';
import AccountMenu from './account-menu';
import { normalizeImagePath } from '@/lib/utils';

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
  product?: {
    id: number;
    name: string;
    price: string;
    imageUrl?: string;
    sku?: string;
  };
}

interface AccountMenuProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

const EnhancedHeaderNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'women' | 'men'>('women');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [cartSubtotal, setCartSubtotal] = useState('0.00');
  const [cartLoading, setCartLoading] = useState(false);
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Responsive breakpoints
  const [isTablet, setIsTablet] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    // Set initial scroll state on mount
    handleScroll();
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
    };

    // Check initial size
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
  }, [isMobileMenuOpen]);

  // Fetch cart data
  const fetchCart = async () => {
    try {
      setCartLoading(true);
      
      // Get session ID from localStorage if available (for guest users)
      const sessionId = localStorage.getItem('cart_session_id');
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (sessionId) {
        headers['x-session-id'] = sessionId;
      }
      
      const response = await fetch('/api/cart', {
        credentials: 'include',
        headers,
      });
      
      const data = await response.json();
      if (data.items) {
        setCartItems(data.items);
        setCartSubtotal(data.subtotal || '0.00');
      } else {
        // If no items returned, clear cart
        setCartItems([]);
        setCartSubtotal('0.00');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
      setCartItems([]);
      setCartSubtotal('0.00');
    } finally {
      setCartLoading(false);
    }
  };

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(label);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 150);
  };

  const cancelHideDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    setActiveDropdown(null);
  };

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setUpdatingItem(itemId);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setCartItems(prev => 
            prev.map(item => 
              item.id === itemId 
                ? { ...item, quantity: newQuantity }
                : item
            )
          );
          
          // Recalculate subtotal
          const newSubtotal = cartItems.reduce((total, item) => {
            if (item.id === itemId) {
              const price = parseFloat(item.product?.price || '0');
              return total + (price * newQuantity);
            }
            return total;
          }, 0).toFixed(2);
          
          setCartSubtotal(newSubtotal);
        }
      }
    } catch (error) {
      console.error('Failed to update quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
      });
      
      const data = await response.json();
      if (data.success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        
        // Recalculate subtotal
        const newSubtotal = cartItems.reduce((total, item) => {
          if (item.id !== itemId) {
            return total + (parseFloat(item.product?.price || '0') * item.quantity);
          }
          return total;
        }, 0).toFixed(2);
        
        setCartSubtotal(newSubtotal);
      }
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const cartItemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  const navigationItems = [
    { 
      label: 'NEW ARRIVALS', 
      link: '/women/new-arrivals',
      dropdown: {
        categories: [
          { 
            title: 'NEW ARRIVALS', 
            items: [
              { name: 'Shop All New', link: '/women/new-arrivals' },
              { name: 'Holiday Edit', link: '/women/new-arrivals' },
              { name: 'Gift Guide', link: '/women/new-arrivals' }
            ] 
          }
        ]
      }
    },
    { 
      label: 'CLOTHING', 
      dropdown: {
        categories: [
          { 
            title: 'WOMEN', 
            items: [
              { name: 'Sweaters', link: '/women/sweaters' },
              { name: 'Tees & Tops', link: '/women/tees-tops' },
              { name: 'Pants', link: '/women/pants' },
              { name: 'Dresses & Skirts', link: '/women/dresses' },
              { name: 'Outerwear', link: '/women/outerwear' },
              { name: 'Matching Sets', link: '/women/matching-sets' }
            ] 
          },
          { 
            title: 'MEN', 
            items: [
              { name: 'Sweaters', link: '/men/sweaters' },
              { name: 'Tees & Tops', link: '/men/tees-tops' },
              { name: 'Pants', link: '/men/pants' },
              { name: 'Denim', link: '/men/denim' },
              { name: 'Outerwear', link: '/men/outerwear' },
              { name: 'Activewear', link: '/men/activewear' }
            ] 
          }
        ]
      }
    },
    { 
      label: 'SHOES & ACCESSORIES', 
      dropdown: {
        categories: [
          { 
            title: 'WOMEN', 
            items: [
              { name: 'Shoes', link: '/women/shoes' },
              { name: 'Bags', link: '/women/bags' },
              { name: 'Accessories', link: '/women/accessories' },
              { name: 'Socks & Underwear', link: '/women/basics' }
            ] 
          },
          { 
            title: 'MEN', 
            items: [
              { name: 'Shoes', link: '/men/shoes' },
              { name: 'Bags', link: '/men/bags' },
              { name: 'Accessories', link: '/men/accessories' },
              { name: 'Socks & Underwear', link: '/men/basics' }
            ] 
          }
        ]
      }
    },
    { 
      label: 'COLLECTIONS', 
      dropdown: {
        categories: [
          { 
            title: 'FEATURED', 
            items: [
              { name: 'Cashmere Shop', link: '/women/cashmere' },
              { name: 'Best Sellers', link: '/women/best-sellers' },
              { name: 'Sale', link: '/women/sale' }
            ] 
          },
          { 
            title: 'TRENDING', 
            items: [
              { name: 'Minimalist Essentials', link: '/women/minimalist' },
              { name: 'Street Style', link: '/women/street-style' },
              { name: 'Boho Chic', link: '/women/boho' }
            ] 
          }
        ]
      }
    },
    { label: 'SUSTAINABILITY', link: '/sustainability' },
    { label: 'CESWORLD', link: '/cesworld' },
    { label: 'DESIGNERS', link: '/designers' },
    { label: 'HAIRSTYLISTS', link: '/hairstylists' }
  ];

  // Don't render until mounted to prevent hydration mismatch
  if (!isMounted) {
    return (
      <div className="min-h-[60px] md:min-h-[64px] bg-white">
        {/* Placeholder header to maintain layout */}
        <div className="container mx-auto px-3 sm:px-4 lg:px-6 h-full flex items-center">
          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white border-b border-border/50'
        }`}
      >
        <div className={`container mx-auto px-3 sm:px-4 lg:px-6 transition-all duration-300 ${
          isScrolled ? 'py-2' : 'py-4'
        }`}>
          <div className={`flex items-center justify-between transition-all duration-300 ${
            isScrolled ? 'h-[56px] md:h-[60px]' : 'h-[60px] md:h-[64px]'
          }`}>
            
            {/* Left Section - Mobile Menu & Logo */}
            <div className="flex items-center gap-3 lg:gap-8 flex-1">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className={`lg:hidden p-2 hover:opacity-70 transition-opacity ${
                  isMobileMenuOpen ? 'text-primary' : 'text-gray-700'
                }`}
                aria-label="Open menu"
              >
                <Menu className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-300 ${
                  isMobileMenuOpen ? 'rotate-90' : ''
                }`} />
              </button>

              {/* Logo - Responsive positioning */}
              <div className="flex-shrink-0">
                <Link 
                  href="/" 
                  className={`text-xl md:text-2xl lg:text-3xl font-bold tracking-wider hover:opacity-80 transition-opacity ${
                    isMobile ? 'text-base' : ''
                  }`}
                >
                  CESCLAIR
                </Link>
              </div>

              {/* Desktop Navigation - Hidden on mobile/tablet */}
              <nav className="hidden lg:flex items-center gap-6 flex-1">
                {navigationItems.slice(0, isMobile ? 2 : isTablet ? 4 : 6).map((item) => (
                  <div key={item.label} className="relative group">
                    {item.link ? (
                      <Link
                        href={item.link}
                        className="text-sm md:text-base text-gray-700 hover:text-primary transition-colors relative py-2"
                      >
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                      </Link>
                    ) : (
                      <button className="text-sm md:text-base text-gray-700 hover:text-primary transition-colors relative py-2">
                        {item.label}
                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary group-hover:w-full transition-all duration-300"></span>
                      </button>
                    )}
                    
                    {/* Dropdown for items with categories */}
                    {item.dropdown && (
                      <div 
                        className="absolute top-full left-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] z-50"
                        onMouseEnter={() => handleMouseEnter(item.label)}
                        onMouseLeave={handleMouseLeave}
                      >
                        <h3 className="text-sm font-medium text-gray-900 mb-3">{item.dropdown.title}</h3>
                        <div className="space-y-2">
                          {item.dropdown.categories.map((category, idx) => (
                            <div key={idx}>
                              <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                                {category.title}
                              </h4>
                              <ul className="space-y-1">
                                {category.items.map((categoryItem, itemIdx) => (
                                  <li key={itemIdx}>
                                    <Link
                                      href={categoryItem.link}
                                      className="text-sm text-gray-700 hover:text-primary transition-colors block py-1"
                                      onClick={() => cancelHideDropdown()}
                                    >
                                      {categoryItem.name}
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </nav>
            </div>

            {/* Right Section - Icons */}
            <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
              {/* Search - Hidden on mobile */}
              <button
                onClick={() => setIsSearchOpen(true)}
                className={`hidden sm:flex p-2 hover:opacity-70 transition-opacity relative z-20 ${
                  isSearchOpen ? 'text-primary' : 'text-gray-700'
                }`}
                aria-label="Search"
              >
                <Search className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>

              {/* Order Tracking - Hidden on mobile */}
              <Link
                href="/orders/status"
                className={`hidden sm:flex p-2 hover:opacity-70 transition-opacity relative z-20 ${
                  isScrolled ? 'text-primary' : 'text-gray-700'
                }`}
                aria-label="Track order"
                title="Track order"
              >
                <Package className="w-4 h-4 sm:w-5 sm:h-5" />
              </Link>

              {/* Account Menu - Hidden on mobile */}
              <div className="relative">
                <button
                  onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                  className={`hidden sm:flex p-2 hover:opacity-70 transition-opacity relative z-20 ${
                    isAccountMenuOpen ? 'text-primary' : 'text-gray-700'
                  }`}
                  aria-label="Account"
                >
                  <User className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <AccountMenu 
                  isOpen={isAccountMenuOpen} 
                  onClose={() => setIsAccountMenuOpen(false)} 
                  className="hidden sm:block absolute top-full right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg p-4 min-w-[200px] z-50"
                />
              </div>

              {/* Cart - Enhanced with item count */}
              <button
                onClick={() => setIsCartOpen(true)}
                className={`p-2 hover:opacity-70 transition-opacity relative z-20 ${
                  isCartOpen ? 'text-primary' : 'text-gray-700'
                }`}
                aria-label={`Shopping bag with ${cartItemCount} items`}
              >
                <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                {/* Cart item count badge - Responsive */}
                {cartItemCount > 0 && (
                  <span className={`absolute -top-1 -right-1 bg-primary text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center ${
                    isMobile ? 'w-4 h-4 text-[9px]' : 'w-5 h-5 text-[10px]'
                  }`}>
                    {cartItemCount > 99 ? '99+' : cartItemCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu Button - Desktop only */}
        <div className="hidden lg:flex absolute top-full left-0 right-0 bg-white border-b border-border shadow-lg">
          <div className="container mx-auto px-3 sm:px-4 lg:px-6 py-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium">Menu</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:opacity-70 transition-opacity"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            {/* Desktop Navigation Menu */}
            <nav className="hidden lg:block">
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                {navigationItems.map((item) => (
                  <div key={item.label} className="group">
                    <h3 className="text-sm font-medium text-gray-900 mb-4">{item.label}</h3>
                    
                    {item.dropdown ? (
                      <div className="space-y-4">
                        {item.dropdown.categories.map((category, idx) => (
                          <div key={idx}>
                            <h4 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                              {category.title}
                            </h4>
                            <ul className="space-y-2">
                              {category.items.map((categoryItem, itemIdx) => (
                                <li key={itemIdx}>
                                  <Link
                                    href={categoryItem.link}
                                    className="text-sm text-gray-700 hover:text-primary transition-colors block py-2"
                                    onClick={() => setIsMobileMenuOpen(false)}
                                  >
                                    {categoryItem.name}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <Link
                        href={item.link || '#'}
                        className="text-sm text-gray-700 hover:text-primary transition-colors block py-2"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </nav>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50"
            onClick={() => setIsCartOpen(false)}
            aria-hidden="true"
          >
            <div className="absolute inset-0 bg-black/50" onClick={(e) => e.stopPropagation()} />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className={`absolute top-0 right-0 h-full w-full sm:max-w-[400px] md:max-w-[440px] bg-white text-primary-text shadow-xl flex flex-col ${
                isMobile ? 'max-w-full' : ''
              }`}
            >
              {/* Cart Header */}
              <div className="flex items-center justify-between p-4 sm:p-6 border-b border-border">
                <h2 className="text-lg font-medium">Your Bag ({cartItemCount})</h2>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 hover:opacity-70 transition-opacity"
                  aria-label="Close cart"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Free Shipping Progress */}
              <div className="px-4 sm:px-6 py-3 border-b border-border">
                <p className="text-center text-sm text-secondary-text">
                  {parseFloat(cartSubtotal) >= 125 
                    ? "You've qualified for free standard shipping!" 
                    : `$${(125 - parseFloat(cartSubtotal)).toFixed(2)} away from free shipping`
                  }
                </p>
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mt-2">
                  <div 
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (parseFloat(cartSubtotal) / 125) * 100)}%` }}
                  />
                </div>
              </div>

              {/* Cart Items */}
              <div className="flex-grow overflow-y-auto px-4 sm:px-6 py-4">
                {cartLoading ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                  </div>
                ) : cartItems.length === 0 ? (
                  <div className="flex flex-col items-center text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <ShoppingBag className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Your bag is empty.</h3>
                    <p className="text-gray-600 mb-6">Not sure where to start?</p>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                      <Link
                        href="/women/new-arrivals"
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm text-gray-700 hover:text-primary transition-colors py-2 px-4 border border border-gray-300 rounded-lg hover:border-gray-400"
                      >
                        Shop New Arrivals
                      </Link>
                      <Link
                        href="/women/best-sellers"
                        onClick={() => setIsCartOpen(false)}
                        className="text-sm text-gray-700 hover:text-primary transition-colors py-2 px-4 border border border-gray-300 rounded-lg hover:border-gray-400"
                      >
                        Shop Best Sellers
                      </Link>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div key={item.id} className="flex gap-4 pb-4 border-b border-border last:border-0">
                        <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 overflow-hidden rounded">
                          {item.product?.imageUrl ? (
                            <Link
                              href={`/products/${item.productId}`}
                              onClick={() => setIsCartOpen(false)}
                              className="w-full h-full"
                            >
                              <Image
                                src={normalizeImagePath(item.product.imageUrl)}
                                alt={item.product.name}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                                sizes="(max-width: 80px)"
                              />
                            </Link>
                          ) : (
                            <div className="w-full h-full bg-gray-100 rounded flex items-center justify-center">
                              <ShoppingBag className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.productId}`}
                            onClick={() => setIsCartOpen(false)}
                            className="block group"
                          >
                            <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                              {item.product?.name || 'Product'}
                            </h3>
                            {item.size && (
                              <p className="text-xs text-gray-500">Size: {item.size}</p>
                            )}
                            {item.color && (
                              <p className="text-xs text-gray-500">Color: {item.color}</p>
                            )}
                          </Link>

                          <div className="flex items-center justify-between mt-2">
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={updatingItem === item.id || item.quantity <= 1}
                                className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-3 py-1 text-xs font-medium min-w-[2rem] text-center bg-gray-100 rounded">
                                {updatingItem === item.id ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={updatingItem === item.id}
                                className="p-1 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              className="text-xs text-gray-500 hover:text-red-600 transition-colors"
                              aria-label="Remove item"
                            >
                              Remove
                            </button>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Cart Footer */}
              <div className="border-t border-border px-4 sm:px-6 py-4">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-bold">SUBTOTAL</h3>
                  <p className="text-lg font-bold">${cartSubtotal}</p>
                </div>
                
                <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden mb-4">
                  <div 
                    className="h-full bg-green-600 transition-all duration-300"
                    style={{ width: `${Math.min(100, (parseFloat(cartSubtotal) / 125) * 100)}%` }}
                  />
                </div>

                <Link
                  href="/checkout?step=cart"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-primary text-primary-foreground uppercase text-[13px] font-medium tracking-[0.05em] py-4 rounded-[2px] hover:bg-gray-800 transition-colors text-center block"
                >
                  Continue to Checkout
                </Link>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default EnhancedHeaderNavigation;
