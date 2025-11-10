"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Check, Package, Mail, ArrowRight } from 'lucide-react';
import Footer from '@/components/sections/footer';

function CheckoutSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const [orderData, setOrderData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (orderNumber) {
      fetchOrderDetails();
    } else {
      setLoading(false);
    }
  }, [orderNumber]);

  const fetchOrderDetails = async () => {
    try {
      const response = await fetch(`/api/orders?orderId=${orderNumber}`);
      if (response.ok) {
        const data = await response.json();
        setOrderData(data);
      }
    } catch (error) {
      console.error('Failed to fetch order details:', error);
    } finally {
      setLoading(false);
    }
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

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto text-center">
            {/* Success Icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="mb-8"
            >
              <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
                <Check className="w-12 h-12 text-white" />
              </div>
            </motion.div>

            {/* Success Message */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <h1 className="text-4xl font-medium mb-4">Order Confirmed!</h1>
              <p className="text-lg text-secondary-text mb-8">
                Thank you for your purchase. We've received your order and will send you a confirmation email shortly.
              </p>
            </motion.div>

            {/* Order Details */}
            {orderNumber && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="bg-white border border-border rounded-lg p-8 mb-8 text-left"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between pb-4 border-b border-border">
                    <span className="text-secondary-text">Order Number</span>
                    <span className="font-medium">{orderNumber}</span>
                  </div>
                  {orderData && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Order Total</span>
                        <span className="font-medium">${orderData.total}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-secondary-text">Status</span>
                        <span className="font-medium capitalize">{orderData.status}</span>
                      </div>
                    </>
                  )}
                </div>
              </motion.div>
            )}

            {/* Next Steps */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="space-y-4"
            >
              <div className="bg-gray-50 rounded-lg p-6 mb-8">
                <h2 className="text-lg font-medium mb-4">What's Next?</h2>
                <div className="space-y-3 text-left">
                  <div className="flex items-start gap-3">
                    <Mail className="w-5 h-5 text-secondary-text mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Confirmation Email</p>
                      <p className="text-sm text-secondary-text">
                        You'll receive an order confirmation email with all the details.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Package className="w-5 h-5 text-secondary-text mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-sm">Shipping Updates</p>
                      <p className="text-sm text-secondary-text">
                        We'll send you tracking information once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/account/orders"
                  className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                >
                  View Order
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center justify-center gap-2 bg-white border border-black text-black px-8 py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                >
                  Continue Shopping
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
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
    }>
      <CheckoutSuccessContent />
    </Suspense>
  );
}

