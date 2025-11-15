"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { Check, ShoppingBag, Truck, CreditCard, FileCheck, User } from 'lucide-react';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';

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

interface ShippingFormData {
  firstName: string;
  lastName: string;
  email: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string;
}

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

const steps = [
  { id: 'cart', label: 'Cart', icon: ShoppingBag },
  { id: 'auth', label: 'Account', icon: User },
  { id: 'shipping', label: 'Shipping', icon: Truck },
  { id: 'payment', label: 'Payment', icon: CreditCard },
  { id: 'review', label: 'Review', icon: FileCheck },
];

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session, isPending: sessionPending } = useSession();
  const step = searchParams.get('step') || 'cart';
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [subtotal, setSubtotal] = useState('0.00');
  const [guestCheckout, setGuestCheckout] = useState(false);
  const [shippingData, setShippingData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    email: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });
  const [paymentData, setPaymentData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [shippingErrors, setShippingErrors] = useState<Partial<ShippingFormData>>({});
  const [paymentErrors, setPaymentErrors] = useState<Partial<PaymentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchCart();
    // Load saved shipping data from localStorage
    const savedShipping = localStorage.getItem('checkout_shipping');
    if (savedShipping) {
      try {
        const parsed = JSON.parse(savedShipping);
        setShippingData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved shipping data:', e);
      }
    }
    // Load saved payment data from localStorage
    const savedPayment = localStorage.getItem('checkout_payment');
    if (savedPayment) {
      try {
        const parsed = JSON.parse(savedPayment);
        setPaymentData(prev => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error('Failed to parse saved payment data:', e);
      }
    }
    
    // If user is logged in, set email from session
    if (!sessionPending && session?.user?.email && !shippingData.email) {
      setShippingData(prev => ({ ...prev, email: session.user.email || '' }));
    }
  }, [sessionPending, session]);

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

  const handleShippingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setShippingData(prev => ({ ...prev, [name]: value }));
    if (shippingErrors[name as keyof ShippingFormData]) {
      setShippingErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const handlePaymentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    let formattedValue = value;

    // Format card number with spaces
    if (name === 'cardNumber') {
      formattedValue = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (formattedValue.length > 19) formattedValue = formattedValue.slice(0, 19);
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      formattedValue = value.replace(/\D/g, '').replace(/(\d{2})(\d{0,2})/, '$1/$2').slice(0, 5);
    }
    // Format CVV
    else if (name === 'cvv') {
      formattedValue = value.replace(/\D/g, '').slice(0, 3);
    }

    setPaymentData(prev => ({ ...prev, [name]: formattedValue }));
    if (paymentErrors[name as keyof PaymentFormData]) {
      setPaymentErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  const validateShipping = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};
    if (!shippingData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!shippingData.lastName.trim()) newErrors.lastName = 'Last name is required';
    
    // Require email for guest checkout
    const isGuest = !session?.user || localStorage.getItem('checkout_guest') === 'true';
    if (isGuest && !shippingData.email.trim()) {
      newErrors.email = 'Email is required for guest checkout';
    } else if (isGuest && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }
    
    if (!shippingData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!shippingData.city.trim()) newErrors.city = 'City is required';
    if (!shippingData.state.trim()) newErrors.state = 'State is required';
    if (!shippingData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!shippingData.country.trim()) newErrors.country = 'Country is required';
    setShippingErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePayment = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    const cardNumberDigits = paymentData.cardNumber.replace(/\s/g, '');
    if (cardNumberDigits.length < 13 || cardNumberDigits.length > 19) {
      newErrors.cardNumber = 'Please enter a valid card number';
    }
    if (!paymentData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    if (!paymentData.cvv.match(/^\d{3}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!paymentData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }
    setPaymentErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateShipping()) return;
    localStorage.setItem('checkout_shipping', JSON.stringify(shippingData));
    router.push('/checkout?step=payment');
  };

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validatePayment()) return;
    localStorage.setItem('checkout_payment', JSON.stringify(paymentData));
    router.push('/checkout?step=review');
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
                        {isCompleted && stepItem.id !== 'auth' ? (
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
                          <div className="w-16 h-16 sm:w-24 sm:h-24 relative flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.product.imageUrl}
                              alt={item.product.name}
                              fill
                              className="object-cover rounded"
                              sizes="(max-width: 640px) 64px, 96px"
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
                      onClick={() => {
                        // Check if user is logged in, if not go to auth step
                        if (!sessionPending && !session?.user) {
                          router.push('/checkout?step=auth');
                        } else {
                          router.push('/checkout?step=shipping');
                        }
                      }}
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Checkout
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 'auth' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 uppercase">Account Information</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Sign in to your account, create a new account, or continue as a guest.
                  </p>
                  
                  <div className="space-y-3 sm:space-y-4 mb-6">
                    {!session?.user ? (
                      <>
                        <Link
                          href={`/cesworld/login?redirect=${encodeURIComponent('/checkout?step=shipping')}`}
                          className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors flex items-center justify-center"
                        >
                          Sign In
                        </Link>
                        <Link
                          href={`/cesworld/register?redirect=${encodeURIComponent('/checkout?step=shipping')}`}
                          className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors flex items-center justify-center"
                        >
                          Create Account
                        </Link>
                        <button
                          onClick={() => {
                            setGuestCheckout(true);
                            localStorage.setItem('checkout_guest', 'true');
                            router.push('/checkout?step=shipping');
                          }}
                          className="w-full bg-white border border-gray-300 text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                        >
                          Continue as Guest
                        </button>
                      </>
                    ) : (
                      <div className="bg-gray-50 rounded-lg p-4 mb-4">
                        <p className="text-sm text-secondary-text mb-4">
                          Signed in as <span className="font-medium text-primary-text">{session.user.email}</span>
                        </p>
                        <button
                          onClick={() => router.push('/checkout?step=shipping')}
                          className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                        >
                          Continue to Shipping
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push('/checkout?step=cart')}
                    className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                  >
                    Back to Cart
                  </button>
                </div>
              </motion.div>
            )}

            {step === 'shipping' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handleShippingSubmit} className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 uppercase">Shipping Information</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Please enter your shipping details to continue.
                  </p>
                  <div className="space-y-4 sm:space-y-6 mb-6">
                    {/* Name Fields */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                          First Name *
                        </label>
                        <input
                          type="text"
                          id="firstName"
                          name="firstName"
                          value={shippingData.firstName}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.firstName ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {shippingErrors.firstName && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.firstName}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="lastName" className="block text-sm font-medium mb-2">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          id="lastName"
                          name="lastName"
                          value={shippingData.lastName}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.lastName ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {shippingErrors.lastName && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.lastName}</p>
                        )}
                      </div>
                    </div>

                    {/* Email Field - Required for guest checkout */}
                    {(!session?.user || localStorage.getItem('checkout_guest') === 'true') && (
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          id="email"
                          name="email"
                          value={shippingData.email}
                          onChange={handleShippingChange}
                          placeholder="your.email@example.com"
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.email ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required={!session?.user}
                        />
                        {shippingErrors.email && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.email}</p>
                        )}
                        {!session?.user && (
                          <p className="mt-1 text-xs text-secondary-text">
                            We'll use this email to send your order confirmation and tracking updates.
                          </p>
                        )}
                      </div>
                    )}

                    {/* Address Line 1 */}
                    <div>
                      <label htmlFor="addressLine1" className="block text-sm font-medium mb-2">
                        Address Line 1 *
                      </label>
                      <input
                        type="text"
                        id="addressLine1"
                        name="addressLine1"
                        value={shippingData.addressLine1}
                        onChange={handleShippingChange}
                        className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                          shippingErrors.addressLine1 ? 'border-red-500' : 'border-[#d4d4d4]'
                        }`}
                        required
                      />
                      {shippingErrors.addressLine1 && (
                        <p className="mt-1 text-sm text-red-500">{shippingErrors.addressLine1}</p>
                      )}
                    </div>

                    {/* Address Line 2 */}
                    <div>
                      <label htmlFor="addressLine2" className="block text-sm font-medium mb-2">
                        Address Line 2 (Optional)
                      </label>
                      <input
                        type="text"
                        id="addressLine2"
                        name="addressLine2"
                        value={shippingData.addressLine2}
                        onChange={handleShippingChange}
                        className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                      />
                    </div>

                    {/* City, State, ZIP */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="city" className="block text-sm font-medium mb-2">
                          City *
                        </label>
                        <input
                          type="text"
                          id="city"
                          name="city"
                          value={shippingData.city}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.city ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {shippingErrors.city && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.city}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="state" className="block text-sm font-medium mb-2">
                          State *
                        </label>
                        <input
                          type="text"
                          id="state"
                          name="state"
                          value={shippingData.state}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.state ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {shippingErrors.state && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.state}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="zipCode" className="block text-sm font-medium mb-2">
                          ZIP Code *
                        </label>
                        <input
                          type="text"
                          id="zipCode"
                          name="zipCode"
                          value={shippingData.zipCode}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.zipCode ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {shippingErrors.zipCode && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.zipCode}</p>
                        )}
                      </div>
                    </div>

                    {/* Country and Phone */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="country" className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <select
                          id="country"
                          name="country"
                          value={shippingData.country}
                          onChange={handleShippingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            shippingErrors.country ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {shippingErrors.country && (
                          <p className="mt-1 text-sm text-red-500">{shippingErrors.country}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium mb-2">
                          Phone (Optional)
                        </label>
                        <input
                          type="tel"
                          id="phone"
                          name="phone"
                          value={shippingData.phone}
                          onChange={handleShippingChange}
                          className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Payment
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/checkout?step=cart')}
                      className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Back to Cart
                    </button>
                  </div>
                </form>
              </motion.div>
            )}

            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <form onSubmit={handlePaymentSubmit} className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8">
                  <h2 className="text-xl sm:text-2xl font-medium mb-4 sm:mb-6 uppercase">Payment Information</h2>
                  <p className="text-sm sm:text-base text-secondary-text mb-4 sm:mb-6">
                    Please enter your payment details to continue.
                  </p>
                  <div className="space-y-4 sm:space-y-6 mb-6">
                    {/* Card Number */}
                    <div>
                      <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        id="cardNumber"
                        name="cardNumber"
                        value={paymentData.cardNumber}
                        onChange={handlePaymentChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength={19}
                        className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                          paymentErrors.cardNumber ? 'border-red-500' : 'border-[#d4d4d4]'
                        }`}
                        required
                      />
                      {paymentErrors.cardNumber && (
                        <p className="mt-1 text-sm text-red-500">{paymentErrors.cardNumber}</p>
                      )}
                    </div>

                    {/* Cardholder Name */}
                    <div>
                      <label htmlFor="cardholderName" className="block text-sm font-medium mb-2">
                        Cardholder Name *
                      </label>
                      <input
                        type="text"
                        id="cardholderName"
                        name="cardholderName"
                        value={paymentData.cardholderName}
                        onChange={handlePaymentChange}
                        placeholder="John Doe"
                        className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                          paymentErrors.cardholderName ? 'border-red-500' : 'border-[#d4d4d4]'
                        }`}
                        required
                      />
                      {paymentErrors.cardholderName && (
                        <p className="mt-1 text-sm text-red-500">{paymentErrors.cardholderName}</p>
                      )}
                    </div>

                    {/* Expiry and CVV */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                      <div>
                        <label htmlFor="expiryDate" className="block text-sm font-medium mb-2">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          id="expiryDate"
                          name="expiryDate"
                          value={paymentData.expiryDate}
                          onChange={handlePaymentChange}
                          placeholder="MM/YY"
                          maxLength={5}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            paymentErrors.expiryDate ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {paymentErrors.expiryDate && (
                          <p className="mt-1 text-sm text-red-500">{paymentErrors.expiryDate}</p>
                        )}
                      </div>
                      <div>
                        <label htmlFor="cvv" className="block text-sm font-medium mb-2">
                          CVV *
                        </label>
                        <input
                          type="text"
                          id="cvv"
                          name="cvv"
                          value={paymentData.cvv}
                          onChange={handlePaymentChange}
                          placeholder="123"
                          maxLength={3}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            paymentErrors.cvv ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required
                        />
                        {paymentErrors.cvv && (
                          <p className="mt-1 text-sm text-red-500">{paymentErrors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 sm:space-y-4">
                    <button
                      type="submit"
                      className="w-full bg-black text-white py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                    >
                      Continue to Review
                    </button>
                    <button
                      type="button"
                      onClick={() => router.push('/checkout?step=shipping')}
                      className="w-full bg-white border border-black text-black py-3 sm:py-4 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                    >
                      Back to Shipping
                    </button>
                  </div>
                </form>
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

export default function CheckoutPage() {
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
      <CheckoutContent />
    </Suspense>
  );
}

