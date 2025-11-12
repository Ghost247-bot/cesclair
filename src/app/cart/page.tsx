"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Minus, Plus, X, ShoppingBag, ArrowRight } from 'lucide-react';
import Footer from '@/components/sections/footer';

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

export default function CartPage() {
  const router = useRouter();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState('0.00');
  const [updatingItem, setUpdatingItem] = useState<number | null>(null);
  const [removingItem, setRemovingItem] = useState<number | null>(null);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart', {
        credentials: 'include',
      });
      const data = await response.json();
      if (data.items) {
        setCartItems(data.items);
        setSubtotal(data.subtotal || '0.00');
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setLoading(false);
    }
  };

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
      } else {
        console.error('Failed to update quantity');
      }
    } catch (error) {
      console.error('Error updating quantity:', error);
    } finally {
      setUpdatingItem(null);
    }
  };

  const removeItem = async (itemId: number) => {
    setRemovingItem(itemId);
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (response.ok) {
        await fetchCart();
      } else {
        console.error('Failed to remove item');
      }
    } catch (error) {
      console.error('Error removing item:', error);
    } finally {
      setRemovingItem(null);
    }
  };

  const handleCheckout = () => {
    router.push('/checkout?step=shipping');
  };

  if (loading) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (cartItems.length === 0) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <div className="mb-8 flex justify-center">
                <ShoppingBag className="w-24 h-24 text-gray-300" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-medium mb-3 sm:mb-4">Your cart is empty</h1>
              <p className="text-sm sm:text-base text-secondary-text mb-6 sm:mb-8">
                Add items to your cart to continue shopping.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Shop Women
                </Link>
                <Link
                  href="/men/new-arrivals"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-black text-black px-6 sm:px-8 py-2.5 sm:py-3 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                >
                  <ArrowRight className="w-4 h-4" />
                  Shop Men
                </Link>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="max-w-5xl mx-auto"
          >
            <div className="mb-6 sm:mb-8">
              <h1 className="text-2xl sm:text-3xl font-medium mb-2">Shopping Cart</h1>
              <p className="text-sm sm:text-base text-secondary-text">
                {cartItems.length} {cartItems.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
              {/* Cart Items */}
              <div className="lg:col-span-2">
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <div className="space-y-4 sm:space-y-6">
                    {cartItems.map((item) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: removingItem === item.id ? 0 : 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.2 }}
                        className={`flex items-start sm:items-center gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-border last:border-0 ${
                          removingItem === item.id ? 'opacity-50' : ''
                        }`}
                      >
                        {item.product?.imageUrl ? (
                          <Link
                            href={`/products/${item.productId}`}
                            className="w-20 h-20 sm:w-28 sm:h-28 relative flex-shrink-0 group overflow-hidden rounded"
                          >
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded transition-transform group-hover:scale-105"
                              sizes="(max-width: 640px) 80px, 112px"
                            />
                          </Link>
                        ) : (
                          <div className="w-20 h-20 sm:w-28 sm:h-28 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center">
                            <ShoppingBag className="w-8 h-8 text-gray-400" />
                          </div>
                        )}

                        <div className="flex-1 min-w-0">
                          <Link
                            href={`/products/${item.productId}`}
                            className="block mb-1 sm:mb-2"
                          >
                            <h3 className="text-sm sm:text-base font-medium hover:text-gray-600 transition-colors truncate">
                              {item.product?.name || 'Product'}
                            </h3>
                          </Link>
                          {item.size && (
                            <p className="text-xs sm:text-sm text-secondary-text">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-xs sm:text-sm text-secondary-text">Color: {item.color}</p>
                          )}
                          {item.product?.sku && (
                            <p className="text-xs text-secondary-text mt-1">SKU: {item.product.sku}</p>
                          )}

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-3 mt-3 sm:mt-4">
                            <div className="flex items-center border border-border rounded">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                disabled={updatingItem === item.id || item.quantity <= 1}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-4 h-4" />
                              </button>
                              <span className="px-4 py-2 text-sm font-medium min-w-[3rem] text-center">
                                {updatingItem === item.id ? '...' : item.quantity}
                              </span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                disabled={updatingItem === item.id}
                                className="p-2 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-4 h-4" />
                              </button>
                            </div>
                            <button
                              onClick={() => removeItem(item.id)}
                              disabled={removingItem === item.id}
                              className="text-xs sm:text-sm text-secondary-text hover:text-black transition-colors disabled:opacity-50"
                              aria-label="Remove item"
                            >
                              {removingItem === item.id ? 'Removing...' : 'Remove'}
                            </button>
                          </div>
                        </div>

                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-medium mb-1">
                            ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                          </p>
                          {item.quantity > 1 && (
                            <p className="text-xs text-secondary-text">
                              ${parseFloat(item.product?.price || '0').toFixed(2)} each
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Continue Shopping */}
                <div className="mt-6">
                  <Link
                    href="/women/new-arrivals"
                    className="inline-flex items-center gap-2 text-sm font-medium text-secondary-text hover:text-black transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 rotate-180" />
                    Continue Shopping
                  </Link>
                </div>
              </div>

              {/* Order Summary */}
              <div className="lg:col-span-1">
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8 sticky top-24">
                  <h2 className="text-lg sm:text-xl font-medium mb-4 sm:mb-6">Order Summary</h2>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6 sm:mb-8">
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-secondary-text">Subtotal</span>
                      <span className="font-medium">${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm sm:text-base">
                      <span className="text-secondary-text">Shipping</span>
                      <span className="font-medium">Calculated at checkout</span>
                    </div>
                    <div className="pt-3 sm:pt-4 border-t border-border">
                      <div className="flex justify-between text-base sm:text-lg">
                        <span className="font-medium">Total</span>
                        <span className="font-medium">${subtotal}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleCheckout}
                    className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors mb-3 sm:mb-4"
                  >
                    Proceed to Checkout
                  </button>

                  <p className="text-xs text-secondary-text text-center">
                    Free shipping on orders over $125
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
      <Footer />
    </>
  );
}

