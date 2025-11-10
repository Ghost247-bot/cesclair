"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Search, User, ShoppingBag, Menu, X } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import SearchModal from './search-modal';
import AccountMenu from './account-menu';

const HeaderNavigation = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [mobileActiveTab, setMobileActiveTab] = useState<'women' | 'men'>('women');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const dropdownTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
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
      <motion.header
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-sm' : 'bg-white border-b border-border'
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
              {navigationItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="relative"
                  onMouseEnter={() => item.dropdown && handleMouseEnter(item.label)}
                  onMouseLeave={handleMouseLeave}
                >
                  {item.link ? (
                    <Link
                      href={item.link}
                      className="text-navigation hover:opacity-70 transition-opacity relative group"
                    >
                      {item.label}
                      <motion.span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"
                        initial={false}
                      />
                    </Link>
                  ) : (
                    <button className="text-navigation hover:opacity-70 transition-opacity relative group">
                      {item.label}
                      <motion.span
                        className="absolute bottom-0 left-0 w-0 h-0.5 bg-black group-hover:w-full transition-all duration-300"
                        initial={false}
                      />
                    </button>
                  )}
                </motion.div>
              ))}
            </nav>

            {/* Logo - Centered on all screen sizes */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="absolute left-1/2 -translate-x-1/2 z-0 pointer-events-auto"
              style={{
                maxWidth: 'calc(100% - 140px)'
              }}
            >
              <Link href="/" className="text-sm sm:text-lg md:text-xl lg:text-2xl font-medium tracking-wider hover:opacity-80 transition-opacity whitespace-nowrap block text-center">
                CESCLAIR
              </Link>
            </motion.div>

            {/* Right Icons */}
            <div className="flex-shrink-0 z-20 ml-auto">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.3 }}
                className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-6"
              >
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsSearchOpen(true)}
                  className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20 flex-shrink-0" 
                  aria-label="Search"
                >
                  <Search className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
                <div className="relative flex-shrink-0">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsAccountMenuOpen(!isAccountMenuOpen)}
                    className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20" 
                    aria-label="Account"
                  >
                    <User className="w-4 h-4 sm:w-5 sm:h-5" />
                  </motion.button>
                  <AccountMenu isOpen={isAccountMenuOpen} onClose={() => setIsAccountMenuOpen(false)} />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setIsCartOpen(true)}
                  className="p-1.5 sm:p-2 hover:opacity-70 transition-opacity relative z-20 flex-shrink-0" 
                  aria-label="Shopping bag"
                >
                  <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5" />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </div>

        {/* Desktop Dropdown Menus */}
        <AnimatePresence>
          {activeDropdown && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="hidden lg:block absolute top-[60px] md:top-[64px] left-0 right-0 bg-white border-b border-border shadow-sm"
              onMouseEnter={cancelHideDropdown}
              onMouseLeave={handleMouseLeave}
            >
              <div className="container mx-auto py-8 lg:py-12">
                <div className="grid grid-cols-2 xl:grid-cols-4 gap-6 lg:gap-8 xl:gap-12">
                  {navigationItems
                    .find((item) => item.label === activeDropdown)
                    ?.dropdown?.categories.map((category, idx) => (
                      <motion.div
                        key={idx}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: idx * 0.1 }}
                      >
                        <h3 className="text-label font-medium mb-4">{category.title}</h3>
                        <ul className="space-y-3">
                          {category.items.map((item, itemIdx) => (
                            <motion.li
                              key={itemIdx}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: (idx * 0.1) + (itemIdx * 0.05) }}
                            >
                              <Link
                                href={item.link}
                                className="text-body hover:opacity-70 transition-opacity block"
                                onClick={() => setActiveDropdown(null)}
                              >
                                {item.name}
                              </Link>
                            </motion.li>
                          ))}
                        </ul>
                      </motion.div>
                    ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.header>

      {/* Search Modal */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 z-50">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="absolute inset-0 bg-black/50" 
              onClick={() => setIsCartOpen(false)}
              aria-hidden="true" 
            />
            <motion.aside
              initial={{ x: '100%' }}
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

            <div className="flex justify-between items-center px-6 py-4">
              <h2 className="text-[11px] font-medium uppercase tracking-[0.08em]">Your Bag (0)</h2>
              <button 
                onClick={() => setIsCartOpen(false)}
                aria-label="Close cart" 
                className="p-1 hover:opacity-70 transition-opacity"
              >
                <X className="h-5 w-5 text-primary-text" />
              </button>
            </div>

            <div className="flex-grow flex flex-col items-center pt-8 pb-12 px-6 overflow-y-auto">
              <div className="w-full flex flex-col items-center text-center">
                <div className="relative w-full max-w-[352px] aspect-[4/5]">
                  <img
                    src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/Empty_Bag_State_Image-1.jpg"
                    alt="Your cart is empty"
                    className="w-full h-full object-contain"
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
            </div>

            <div className="mt-auto px-6 pt-4 pb-6 border-t border-border bg-white">
              <div className="flex justify-between items-center py-4">
                <h3 className="text-lg font-bold">SUBTOTAL</h3>
                <p className="text-lg font-bold">$0.00</p>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsCartOpen(false)}
                className="w-full bg-primary text-primary-foreground uppercase text-[13px] font-medium tracking-[0.05em] py-4 rounded-[2px] hover:bg-gray-800 transition-colors text-center block"
              >
                Continue to Checkout
              </Link>
            </div>
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
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/40 z-50 lg:hidden"
              onClick={() => setIsMobileMenuOpen(false)}
            />

            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
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