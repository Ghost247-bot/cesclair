"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Loader2, Check, Mail, Gift, Sparkles } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function EmailSignupPage() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        if (data.discountCode) {
          setDiscountCode(data.discountCode);
        }
        
        if (data.code === 'SUBSCRIPTION_SUCCESS') {
          toast.success(data.message);
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
        } else if (data.code === 'ALREADY_SUBSCRIBED') {
          toast.info(data.message);
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
        } else if (data.code === 'RESUBSCRIBED') {
          toast.success(data.message);
          if (data.discountCode) {
            toast.info(`Your discount code: ${data.discountCode}`, {
              duration: 10000,
            });
          }
        }
        setEmail('');
      } else {
        if (data.code === 'INVALID_EMAIL') {
          toast.error('Please enter a valid email address');
        } else if (data.code === 'MISSING_EMAIL') {
          toast.error('Email is required');
        } else {
          toast.error(data.error || 'Failed to subscribe. Please try again.');
        }
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      toast.error('Something went wrong. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderNavigation />
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16 md:py-24">
          <div className="max-w-2xl mx-auto">
            {/* Hero Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                className="inline-block mb-6"
              >
                <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center">
                  <Mail className="w-10 h-10 text-white" />
                </div>
              </motion.div>
              
              <h1 className="text-4xl md:text-5xl font-medium mb-4 tracking-tight">
                Stay in the Loop
              </h1>
              <p className="text-lg md:text-xl text-secondary-text mb-8">
                Sign up for our newsletter and receive exclusive updates, early access to new collections, and special offers.
              </p>
            </motion.div>

            {/* Benefits Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12"
            >
              <div className="text-center p-6 bg-white border border-border rounded-lg">
                <Gift className="w-8 h-8 mx-auto mb-3 text-black" />
                <h3 className="font-medium mb-2">20% Off First Order</h3>
                <p className="text-sm text-secondary-text">
                  Get an exclusive discount code when you sign up
                </p>
              </div>
              <div className="text-center p-6 bg-white border border-border rounded-lg">
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-black" />
                <h3 className="font-medium mb-2">Early Access</h3>
                <p className="text-sm text-secondary-text">
                  Be the first to know about new collections and launches
                </p>
              </div>
              <div className="text-center p-6 bg-white border border-border rounded-lg">
                <Mail className="w-8 h-8 mx-auto mb-3 text-black" />
                <h3 className="font-medium mb-2">Exclusive Content</h3>
                <p className="text-sm text-secondary-text">
                  Receive styling tips, sustainability updates, and more
                </p>
              </div>
            </motion.div>

            {/* Signup Form */}
            {!isSuccess ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="bg-white border border-border rounded-lg p-8 md:p-12"
              >
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium mb-2">
                      Email Address
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        disabled={isLoading}
                        className="flex-1 px-4 py-3 border border-[#d4d4d4] rounded-[2px] placeholder:text-tertiary-text placeholder:text-sm focus:ring-1 focus:ring-black focus:border-black outline-none disabled:opacity-50 disabled:cursor-not-allowed"
                      />
                      <motion.button
                        type="submit"
                        disabled={isLoading}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="bg-black text-white px-6 py-3 rounded-[2px] hover:bg-[#333] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 min-w-[120px]"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span className="hidden sm:inline">Subscribing...</span>
                          </>
                        ) : (
                          <>
                            <span>Subscribe</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </motion.button>
                    </div>
                  </div>

                  <p className="text-xs text-secondary-text">
                    By providing your email, you agree to receive marketing emails and accept our{' '}
                    <Link href="/privacy" className="underline hover:text-primary-text">
                      Privacy Policy
                    </Link>{' '}
                    and{' '}
                    <Link href="/terms" className="underline hover:text-primary-text">
                      Terms
                    </Link>.
                  </p>
                </form>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, type: "spring" }}
                className="bg-white border border-border rounded-lg p-8 md:p-12 text-center"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2, type: "spring" }}
                  className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6"
                >
                  <Check className="w-8 h-8 text-white" />
                </motion.div>
                
                <h2 className="text-2xl md:text-3xl font-medium mb-4">
                  You're All Set!
                </h2>
                <p className="text-lg text-secondary-text mb-6">
                  Thank you for subscribing to our newsletter. Check your email for confirmation and your exclusive discount code.
                </p>

                {discountCode && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.4 }}
                    className="bg-gray-50 border border-border rounded-lg p-6 mb-6"
                  >
                    <p className="text-sm text-secondary-text mb-2">Your Exclusive Discount Code</p>
                    <p className="text-2xl font-bold font-mono tracking-wider">{discountCode}</p>
                    <p className="text-sm text-secondary-text mt-2">Use this code at checkout for 20% off your first order</p>
                  </motion.div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link
                    href="/women/new-arrivals"
                    className="inline-flex items-center justify-center gap-2 bg-black text-white px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors"
                  >
                    Start Shopping
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      setIsSuccess(false);
                      setDiscountCode(null);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-white border border-black text-black px-8 py-3 uppercase text-sm font-medium tracking-wider hover:bg-gray-50 transition-colors"
                  >
                    Subscribe Another Email
                  </button>
                </div>
              </motion.div>
            )}

            {/* Additional Info */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-12 text-center"
            >
              <p className="text-sm text-secondary-text mb-4">
                Already have an account?{' '}
                <Link href="/account" className="underline hover:text-primary-text">
                  Sign in
                </Link>
                {' '}or{' '}
                <Link href="/cesworld" className="underline hover:text-primary-text">
                  Join Cesworld
                </Link>
              </p>
            </motion.div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

