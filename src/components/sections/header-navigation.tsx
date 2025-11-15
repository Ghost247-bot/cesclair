"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, Menu, X, Minus, Plus } from 'lucide-react';
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

const HeaderNavigation = () => {
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

  // Ensure client-side only for scroll state to prevent hydration mismatch
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

  // Fetch cart on mount and when cart opens
  useEffect(() => {
    fetchCart();
  }, []);

  useEffect(() => {
    if (isCartOpen) {
      fetchCart();
    }
  }, [isCartOpen]);

  // Listen for cart updates from other components
  useEffect(() => {
    const handleCartUpdate = () => {
      fetchCart();
    };
    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    setUpdatingItem(itemId);
    try {
      const response = await fetch('/api/cart', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchCart();
      }
    } catch (error) {
      console.error('Error removing item:', error);
    }
  };

  const cartItemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const handleMouseEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(label);
    }, 1000);
  };

  const handleMouseLeave = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
    dropdownTimeoutRef.current = setTimeout(() => {
      setActiveDropdown(null);
    }, 1000);
  };

  const cancelHideDropdown = () => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
    }
  };

  useEffect(() => {
    return () => {
      if (dropdownTimeoutRef.current) {
        clearTimeout(dropdownTimeoutRef.current);
      }
    };
  }, []);

  const navigationItems = [
    {
      label: 'WOMEN',
      dropdown: {
        categories: [
          { 
            title: 'NEW ARRIVALS', 
            items: [
              { name: 'Shop All New', link: '/women/new-arrivals' },
              { name: 'The Sweater Shop', link: '/women/sweaters' },
              { name: 'Holiday Edit', link: '/women/new-arrivals' },
              { name: 'Gift Guide', link: '/women/new-arrivals' }
            ] 
          },
          { 
            title: 'CLOTHING', 
            items: [
              { name: 'Sweaters', link: '/women/sweaters' },
              { name: 'Tees & Tops', link: '/women/tees-tops' },
              { name: 'Pants', link: '/women/pants' },
              { name: 'Denim', link: '/women/denim' },
              { name: 'Dresses & Skirts', link: '/women/dresses' },
              { name: 'Outerwear', link: '/women/outerwear' },
              { name: 'Matching Sets', link: '/women/matching-sets' }
            ] 
          },
          { 
            title: 'SHOES & ACCESSORIES', 
            items: [
              { name: 'Shoes', link: '/women/shoes' },
              { name: 'Bags', link: '/women/bags' },
              { name: 'Accessories', link: '/women/accessories' },
              { name: 'Socks & Underwear', link: '/women/basics' }
            ] 
          },
          { 
            title: 'COLLECTIONS', 
            items: [
              { name: 'Cashmere Shop', link: '/women/cashmere' },
              { name: 'Best Sellers', link: '/women/best-sellers' },
              { name: 'Sale', link: '/women/sale' }
            ] 
          }
        ]
      }
    },
    {
      label: 'MEN',
      dropdown: {
        categories: [
          { 
            title: 'NEW ARRIVALS', 
            items: [
              { name: 'Shop All New', link: '/men/new-arrivals' },
              { name: 'Gift Guide', link: '/men/gifts' },
              { name: 'Holiday Outfitting', link: '/men/new-arrivals' }
            ] 
          },
          { 
            title: 'CLOTHING', 
            items: [
              { name: 'Sweaters', link: '/men/sweaters' },
              { name: 'Tees & Tops', link: '/men/tees-tops' },
              { name: 'Pants', link: '/men/pants' },
              { name: 'Denim', link: '/men/denim' },
              { name: 'Outerwear', link: '/men/outerwear' },
              { name: 'Activewear', link: '/men/activewear' }
            ] 
          },
          { 
            title: 'SHOES & ACCESSORIES', 
            items: [
              { name: 'Shoes', link: '/men/shoes' },
              { name: 'Bags', link: '/men/bags' },
              { name: 'Accessories', link: '/men/accessories' },
              { name: 'Socks & Underwear', link: '/men/basics' }
            ] 
          },
          { 
            title: 'COLLECTIONS', 
            items: [
              { name: 'Cashmere Shop', link: '/men/cashmere' },
              { name: 'Best Sellers', link: '/men/best-sellers' },
              { name: 'Sale', link: '/men/sale' }
            ] 
          }
        ]
      }
    },
    { label: 'SUSTAINABILITY', link: '/sustainability' },
    { label: 'CESWORLD', link: '/cesworld' },
    { label: 'DESIGNERS', link: '/designers' }
  ];

  return (
    <>
      <header
        suppressHydrationWarning
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isMounted && isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white border-b border-border'
        }`}
      >
        <div className="container mx-auto px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between h-[60px] md:h-[64px] relative">
            {/* Mobile Menu Button - Left Side */}
            <div className="lg:hidden flex-shrink-0 w-10 flex items-center justify-start z-10">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="p-2 -ml-2 hover:opacity-70 transition-opacity"
                aria-label="Open menu"
              >
                <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
            </div>

            {/* Desktop Navigation - Left */}
            <nav className="hidden lg:flex items-center gap-8 flex-1">
              {navigationItems.map((item) => (
                <div
                  key={item.label}
                  className="relative"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                  suppressHydrationWarning
                >
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="text-navigation hover:opacity-70 transition-opacity relative group"
                    >
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300" />
                    </Link>
                  ) : (
                    <button className="text-navigation hover:opacity-70 transition-opacity relative group">
                      {item.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300" />
                    </button>
                  )}
                </div>
              ))}
            </nav>

            {/* Logo - Centered on all screen sizes */}
            <div
              className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-auto max-w-[calc(100%-140px)]"
            >
              <Link href="/" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wider hover:opacity-80 transition-opacity whitespace-nowrap block text-center">
                CESCLAIR
              </Link>
            </div>

            {/* Right Icons */}
            <div className="flex-shrink-0 z-20 ml-auto">
              <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-6">
                <button
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20 flex-shrink-0" 
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </button>
                <div className="relative flex-shrink-0">
                  <button
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20" 
                    aria-label="Account"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </button>
                  <AccountMenu isOpen={isAccountMenuOpen} onClose={() => setIsAccountMenuOpen(false)} />
                </div>
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20 flex-shrink-0" 
                  aria-label="Shopping bag"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-black text-white text-[10px] font-medium rounded-full w-4 h-4 flex items-center justify-center">
                      {cartItemCount > 99 ? '99+' : cartItemCount}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Dropdown Menus */}
        {activeDropdown && (
          <div
            className="hidden lg:block absolute top-[60px] md:top-[64px] left-0 right-0 bg-white border-b border-border shadow-sm"
            onMouseEnter={cancelHideDropdown}
            onMouseLeave={handleMouseLeave}
          >
              <div className="container mx-auto py-8 lg:py-12">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-12">
                  {navigationItems
                    .find((item) => item.label === activeDropdown)
                    ?.dropdown?.categories.map((category, idx) => (
                      <div key={idx}>
                        <h3 className="text-label font-medium mb-4">{category.title}</h3>
                        <ul className="space-y-3">
                          {category.items.map((item, itemIdx) => (
                            <li key={itemIdx}>
                              <Link
                                href={item.link}
                                className="text-body hover:opacity-70 transition-opacity block"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {item.name}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                </div>
              </div>
            </div>
          )}
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50" 
              onClick={() => setIsCartOpen(false)}
              aria-hidden="true" 
            />
            <motion.aside
              initial={false}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute top-0 right-0 h-full w-full sm:max-w-[400px] md:max-w-[440px] bg-white text-primary-text shadow-xl flex flex-col"
            >
            <div className="border-b border-border">
              <div className="px-6 pt-4 pb-3">
                <p className="text-center text-[13px] text-secondary-text mb-1.5">
                  <span className="font-medium text-primary-text">$125.00</span> away from free standard shipping
                </p>
                <div className="w-full bg-[#f8f6f4] h-1 rounded-full overflow-hidden">
                  <div className="h-full bg-green-800" style={{ width: '0%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center px-6 py-4 border-b border-border">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.08em]">
                Your Bag ({cartItemCount})
              </h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart" 
                className="p-1 hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5 text-primary-text" />
              </button>
            </div>

            <div className="flex-grow overflow-y-auto">
              {cartLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              ) : cartItems.length === 0 ? (
                <div className="flex flex-col items-center text-center pt-8 pb-12 px-6">
                  <div className="relative w-full max-w-[352px] aspect-[4/5]">
                    <Image
                      src={normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/Empty_Bag_State_Image-1.jpg")}
                      alt="Your cart is empty"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                  <h3 className="text-xl font-medium mt-4">
                    Your bag is empty.
                    <br />
                    Not sure where to start?
                  </h3>
                  <div className="mt-8 flex flex-col items-center space-y-4">
                    <Link 
                      href="/women/new-arrivals" 
                      onClick={() => setIsCartOpen(false)}
                      className="text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover underline"
                    >
                      Shop New Arrivals →
                    </Link>
                    <Link 
                      href="/women/best-sellers"
                      onClick={() => setIsCartOpen(false)}
                      className="text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover underline"
                    >
                      Shop Best Sellers →
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="px-6 py-4 space-y-4">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 pb-4 border-b border-border last:border-0"
                    >
                      {item.product?.imageUrl ? (
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="w-20 h-20 relative flex-shrink-0 overflow-hidden rounded"
                        >
                          <Image
                            src={normalizeImagePath(item.product.imageUrl)}
                            alt={item.product.name}
                            fill
                            className="object-cover rounded"
                            sizes="80px"
                            unoptimized
                          />
                        </Link>
                      ) : (
                        <div className="w-20 h-20 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                          <ShoppingBag className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/products/${item.productId}`}
                          onClick={() => setIsCartOpen(false)}
                          className="block mb-1"
                        >
                          <h3 className="text-sm font-medium hover:text-gray-600 transition-colors truncate">
                            {item.product?.name || 'Product'}
                          </h3>
                        </Link>
                        {item.size && (
                          <p className="text-xs text-secondary-text">Size: {item.size}</p>
                        )}
                        {item.color && (
                          <p className="text-xs text-secondary-text">Color: {item.color}</p>
                        )}

                        <div className="flex items-center gap-3 mt-2">
                          <div className="flex items-center border border-border rounded">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingItem === item.id || item.quantity <= 1}
                              className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-3 py-1 text-xs font-medium min-w-[2rem] text-center">
                              {updatingItem === item.id ? '...' : item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingItem === item.id}
                              className="p-1.5 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <button
                            onClick={() => removeItem(item.id)}
                            className="text-xs text-secondary-text hover:text-black transition-colors"
                            aria-label="Remove item"
                          >
                            Remove
                          </button>
                        </div>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-medium">
                          ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cartItems.length > 0 && (
              <div className="mt-auto px-6 pt-4 pb-6 border-t border-border bg-white">
                <div className="flex justify-between items-center py-4">
                  <h3 className="text-lg font-bold">SUBTOTAL</h3>
                  <p className="text-lg font-bold">${cartSubtotal}</p>
                </div>

                <Link
                  href="/checkout?step=shipping"
                  onClick={() => setIsCartOpen(false)}
                  className="w-full bg-primary text-primary-foreground uppercase text-[13px] font-medium tracking-[0.05em] py-4 rounded-[2px] hover:bg-gray-800 transition-colors text-center block"
                >
                  Continue to Checkout
                </Link>
              </div>
            )}
          </motion.aside>
        </div>
        )}
      </AnimatePresence>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={false}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={false}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-full max-w-md bg-white z-50 overflow-y-auto lg:hidden"
            >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-xl font-medium tracking-wider">CESCLAIR</h2>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 -mr-2"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-border">
              <button
                onClick={() => setMobileActiveTab('women')}
                className={`flex-1 py-4 text-navigation transition-colors ${
                  mobileActiveTab === 'women'
                    ? 'border-b-2 border-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                WOMEN
              </button>
              <button
                onClick={() => setMobileActiveTab('men')}
                className={`flex-1 py-4 text-navigation transition-colors ${
                  mobileActiveTab === 'men'
                    ? 'border-b-2 border-primary font-medium'
                    : 'text-muted-foreground'
                }`}
              >
                MEN
              </button>
            </div>

            {/* Menu Content */}
            <div className="p-6">
              {navigationItems
                .find((item) => item.label === mobileActiveTab.toUpperCase())
                ?.dropdown?.categories.map((category, idx) => (
                  <div key={idx} className="mb-8">
                    <h3 className="text-label font-medium mb-4">{category.title}</h3>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIdx) => (
                        <li key={itemIdx}>
                          <Link
                            href={item.link}
                            className="text-body hover:opacity-70 transition-opacity block py-1"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}

              {/* Additional Links */}
              <div className="pt-6 border-t border-border space-y-4">
                <Link
                  href="/sustainability"
                  className="text-navigation hover:opacity-70 transition-opacity block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  SUSTAINABILITY
                </Link>
                <Link
                  href="/cesworld"
                  className="text-navigation hover:opacity-70 transition-opacity block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  CESWORLD
                </Link>
                <Link
                  href="/designers"
                  className="text-navigation hover:opacity-70 transition-opacity block"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  DESIGNERS
                </Link>
              </div>
            </div>
          </motion.div>
        </>
        )}
      </AnimatePresence>
    </>
  );
};

export default HeaderNavigation;