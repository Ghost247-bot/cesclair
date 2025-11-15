"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { ArrowLeft, Check, Lock } from 'lucide-react';
import { toast } from 'sonner';
import { useSession } from '@/lib/auth-client';
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

interface ShippingData {
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function CheckoutReviewPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [shippingData, setShippingData] = useState<ShippingData | null>(null);
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [subtotal, setSubtotal] = useState('0.00');
  const [shipping, setShipping] = useState('10.00');
  const [tax, setTax] = useState('0.00');
  const [total, setTotal] = useState('0.00');
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCheckoutData();
  }, []);

  const loadCheckoutData = async () => {
    try {
      // Load cart
      const cartResponse = await fetch('/api/cart');
      const cartData = await cartResponse.json();
      if (cartData.items) {
        setCartItems(cartData.items);
        setSubtotal(cartData.subtotal || '0.00');
      }

      // Load shipping data
      const savedShipping = localStorage.getItem('checkout_shipping');
      if (savedShipping) {
        setShippingData(JSON.parse(savedShipping));
      }

      // Load payment data
      const savedPayment = localStorage.getItem('checkout_payment');
      if (savedPayment) {
        const payment = JSON.parse(savedPayment);
        // Mask card number for display
        const maskedCard = payment.cardNumber.replace(/\s/g, '').slice(-4).padStart(16, '•');
        setPaymentData({ ...payment, cardNumber: maskedCard });
      }

      // Calculate totals
      const subtotalNum = parseFloat(cartData.subtotal || '0');
      const shippingNum = subtotalNum >= 125 ? 0 : 10;
      const taxNum = subtotalNum * 0.08;
      const totalNum = subtotalNum + shippingNum + taxNum;

      setShipping(shippingNum.toFixed(2));
      setTax(taxNum.toFixed(2));
      setTotal(totalNum.toFixed(2));
    } catch (error) {
      console.error('Failed to load checkout data:', error);
      toast.error('Failed to load checkout information');
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!shippingData || !paymentData) {
      toast.error('Please complete shipping and payment information');
      return;
    }

    setIsPlacingOrder(true);

    try {
      // Get email from session if available, otherwise use email from shipping data
      const isGuestCheckout = localStorage.getItem('checkout_guest') === 'true';
      const email = session?.user?.email || 
                    (shippingData.email || 
                     (isGuestCheckout && shippingData.firstName && shippingData.lastName
                       ? `${shippingData.firstName.toLowerCase()}.${shippingData.lastName.toLowerCase()}@guest.temp`
                       : shippingData.firstName.toLowerCase() + '@example.com'));

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email, // API will prioritize session email if available
          shippingAddress: shippingData,
          paymentMethod: 'card',
          paymentIntentId: null, // In production, create Stripe payment intent
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Clear checkout data
        localStorage.removeItem('checkout_shipping');
        localStorage.removeItem('checkout_payment');
        localStorage.removeItem('checkout_guest');

        // If guest checkout and user just signed up, try to link orders
        if (isGuestCheckout && session?.user) {
          try {
            await fetch('/api/orders/link-guest-orders', { method: 'POST' });
          } catch (error) {
            console.error('Failed to link guest orders:', error);
          }
        }

        // Redirect to success page with order number
        router.push(`/checkout/success?orderNumber=${data.order.orderNumber || data.orderNumber}`);
      } else {
        toast.error(data.error || 'Failed to place order');
        setIsPlacingOrder(false);
      }
    } catch (error) {
      console.error('Place order error:', error);
      toast.error('Failed to place order. Please try again.');
      setIsPlacingOrder(false);
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

  if (!shippingData || !paymentData) {
    return (
      <>
        <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-2xl mx-auto text-center">
              <h1 className="text-2xl font-medium mb-4">Missing Information</h1>
              <p className="text-secondary-text mb-8">
                Please complete shipping and payment information first.
              </p>
              <div className="space-y-4">
                {!shippingData && (
                  <button
                    onClick={() => router.push('/checkout/shipping')}
                    className="w-full bg-black text-white py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Complete Shipping Information
                  </button>
                )}
                {!paymentData && (
                  <button
                    onClick={() => router.push('/checkout/payment')}
                    className="w-full bg-black text-white py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Complete Payment Information
                  </button>
                )}
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
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/checkout/payment')}
                className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Payment
              </button>
              <h1 className="text-3xl font-medium mb-2">Review Your Order</h1>
              <p className="text-secondary-text">
                Please review your order details before placing it.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Order Summary */}
              <div className="lg:col-span-2 space-y-6">
                {/* Shipping Address */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white border border-border rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Shipping Address</h2>
                    <button
                      onClick={() => router.push('/checkout/shipping')}
                      className="text-sm text-secondary-text hover:text-primary-text underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-secondary-text">
                    <p className="font-medium text-primary-text">
                      {shippingData.firstName} {shippingData.lastName}
                    </p>
                    <p>{shippingData.addressLine1}</p>
                    {shippingData.addressLine2 && <p>{shippingData.addressLine2}</p>}
                    <p>
                      {shippingData.city}, {shippingData.state} {shippingData.zipCode}
                    </p>
                    <p>{shippingData.country}</p>
                    {shippingData.phone && <p className="mt-2">Phone: {shippingData.phone}</p>}
                  </div>
                </motion.div>

                {/* Payment Method */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white border border-border rounded-lg p-6"
                >
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Payment Method</h2>
                    <button
                      onClick={() => router.push('/checkout/payment')}
                      className="text-sm text-secondary-text hover:text-primary-text underline"
                    >
                      Edit
                    </button>
                  </div>
                  <div className="text-secondary-text">
                    <p className="font-medium text-primary-text flex items-center gap-2">
                      <Lock className="w-4 h-4" />
                      Card ending in {paymentData.cardNumber.slice(-4)}
                    </p>
                    <p className="mt-1">{paymentData.cardholderName}</p>
                    <p className="mt-1">Expires: {paymentData.expiryDate}</p>
                  </div>
                </motion.div>

                {/* Order Items */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white border border-border rounded-lg p-6"
                >
                  <h2 className="text-lg font-medium mb-4">Order Items</h2>
                  <div className="space-y-4">
                    {cartItems.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-4 pb-4 border-b border-border last:border-0"
                      >
                        {item.product?.imageUrl && (
                          <div className="w-20 h-20 relative flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h3 className="font-medium">{item.product?.name}</h3>
                          {item.size && (
                            <p className="text-sm text-secondary-text">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm text-secondary-text">Color: {item.color}</p>
                          )}
                          <p className="text-sm text-secondary-text">Quantity: {item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(parseFloat(item.product?.price || '0') * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              </div>

              {/* Order Summary Sidebar */}
              <div className="lg:col-span-1">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white border border-border rounded-lg p-6 sticky top-24"
                >
                  <h2 className="text-lg font-medium mb-6">Order Summary</h2>
                  <div className="space-y-4 mb-6">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Subtotal</span>
                      <span>${subtotal}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Shipping</span>
                      <span>${shipping}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Tax</span>
                      <span>${tax}</span>
                    </div>
                    <div className="pt-4 border-t border-border flex justify-between font-medium">
                      <span>Total</span>
                      <span>${total}</span>
                    </div>
                  </div>
                  <button
                    onClick={handlePlaceOrder}
                    disabled={isPlacingOrder}
                    className="w-full bg-black text-white py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isPlacingOrder ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        Placing Order...
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        Place Order
                      </>
                    )}
                  </button>
                  <p className="text-xs text-secondary-text mt-4 text-center">
                    By placing your order, you agree to our Terms of Service and Privacy Policy.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

