"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, ShoppingBag, Truck, CreditCard, FileCheck } from 'lucide-react';
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

const steps = [
  { id: 'cart', label: 'Cart', icon: ShoppingBag },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileCheck },
];

export default function CheckoutPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const step = searchParams.get('step') || 'cart';
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState('0.00');

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await fetch('/api/cart');
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

  const currentStepIndex = steps.findIndex((s) => s.id === step);

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

  if (cartItems.length === 0 && step === 'cart') {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl sm:text-3xl font-medium mb-3 sm:mb-4">Your cart is empty</h1>
              <p className="text-sm sm:text-base text-secondary-text mb-6 sm:mb-8">
                Add items to your cart to continue checkout.
              </p>
              <Link
                href="/women/new-arrivals"
                className="inline-block bg-black text-white px-6 sm:px-8 py-2.5 sm:py-3 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
              >
                Continue Shopping
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
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          {/* Step Indicator */}
          <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
            <div className="flex items-center justify-between overflow-x-auto pb-4">
              {steps.map((stepItem, index) => {
                const Icon = stepItem.icon;
                const isActive = index === currentStepIndex;
                const isCompleted = index < currentStepIndex;
                const isClickable = index <= currentStepIndex;

                return (
                  <React.Fragment key={stepItem.id}>
                    <div className="flex flex-col items-center flex-shrink-0 min-w-[80px] sm:flex-1">
                      <Link
                        href={isClickable ? `/checkout?step=${stepItem.id}` : '#'}
                        className={`flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 transition-all ${
                          isActive
                            ? 'border-black bg-black text-white'
                            : isCompleted
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-400'
                        } ${!isClickable ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                      >
                        {isCompleted ? (
                          <Check className="w-5 h-5 sm:w-6 sm:h-6" />
                        ) : (
                          <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                        )}
                      </Link>
                      <span
                        className={`mt-2 text-[10px] sm:text-xs font-medium uppercase tracking-wider text-center ${
                          isActive ? 'text-black' : 'text-gray-400'
                        }`}
                      >
                        {stepItem.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 sm:mx-4 hidden sm:block ${
                          isCompleted ? 'bg-black' : 'bg-gray-300'
                        }`}
                      />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Step Content */}
          <div className="max-w-4xl mx-auto">
            {step === 'cart' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">Shopping Cart</h2>
                  <div className="space-y-6">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-start sm:items-center gap-3 sm:gap-6 pb-4 sm:pb-6 border-b border-border last:border-0"
                      >
                        {item.product?.imageUrl && (
                          <div className="w-16 h-16 sm:w-24 sm:h-24 relative flex-shrink-0">
                            <img
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              className="w-full h-full object-cover rounded"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm sm:text-base font-medium mb-1 truncate">{item.product?.name}</h3>
                          {item.size && (
                            <p className="text-xs sm:text-sm text-secondary-text">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-xs sm:text-sm text-secondary-text">Color: {item.color}</p>
                          )}
                          <p className="text-xs sm:text-sm text-secondary-text mt-1">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="text-sm sm:text-base font-medium">
                            ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 sm:mt-8 pt-4 sm:pt-6 border-t border-border">
                    <div className="flex justify-between items-center mb-3 sm:mb-4">
                      <span className="text-base sm:text-lg font-medium">Subtotal</span>
                      <span className="text-base sm:text-lg font-medium">${subtotal}</span>
                    </div>
                    <button
                      onClick={() => router.push('/checkout?step=shipping')}
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Shipping
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">Shipping Information</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Please enter your shipping details to continue.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => router.push('/checkout?step=payment')}
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Payment
                    </button>
                    <button
                      onClick={() => router.push('/checkout?step=cart')}
                      className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">Payment Information</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Please enter your payment details to continue.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => router.push('/checkout?step=review')}
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Review
                    </button>
                    <button
                      onClick={() => router.push('/checkout?step=shipping')}
                      className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Back to Shipping
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'review' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6">Review Your Order</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Please review your order before placing it.
                  </p>
                  <div className="space-y-3 sm:space-y-4">
                    <button
                      onClick={() => router.push('/checkout/success')}
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Place Order
                    </button>
                    <button
                      onClick={() => router.push('/checkout?step=payment')}
                      className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Back to Payment
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

