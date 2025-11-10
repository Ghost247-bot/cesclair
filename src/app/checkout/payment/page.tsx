"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Lock } from 'lucide-react';
import Footer from '@/components/sections/footer';

interface PaymentFormData {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  cardholderName: string;
}

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Format card number
    if (name === 'cardNumber') {
      const formatted = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    }
    // Format expiry date
    else if (name === 'expiryDate') {
      const formatted = value.replace(/\D/g, '').replace(/(\d{2})(\d)/, '$1/$2').slice(0, 5);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    }
    // Format CVV (max 3 digits)
    else if (name === 'cvv') {
      const formatted = value.replace(/\D/g, '').slice(0, 3);
      setFormData((prev) => ({ ...prev, [name]: formatted }));
    }
    else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }

    if (errors[name as keyof PaymentFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};

    if (!formData.cardNumber.replace(/\s/g, '').match(/^\d{16}$/)) {
      newErrors.cardNumber = 'Please enter a valid 16-digit card number';
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      newErrors.expiryDate = 'Please enter a valid expiry date (MM/YY)';
    }
    if (!formData.cvv.match(/^\d{3}$/)) {
      newErrors.cvv = 'Please enter a valid CVV';
    }
    if (!formData.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Save payment info to session/localStorage (in production, this would be handled securely)
    localStorage.setItem('checkout_payment', JSON.stringify(formData));
    setIsSubmitting(false);
    router.push('/checkout/review');
  };

  useEffect(() => {
    // Load saved payment info if exists
    const saved = localStorage.getItem('checkout_payment');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved payment info:', error);
      }
    }
  }, []);

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="mb-8">
              <button
                onClick={() => router.push('/checkout/shipping')}
                className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Shipping
              </button>
              <h1 className="text-3xl font-medium mb-2">Payment Information</h1>
              <p className="text-secondary-text flex items-center gap-2">
                <Lock className="w-4 h-4" />
                Your payment information is secure and encrypted.
              </p>
            </div>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-white border border-border rounded-lg p-8"
            >
              <div className="space-y-6">
                {/* Card Number */}
                <div>
                  <label htmlFor="cardNumber" className="block text-sm font-medium mb-2">
                    Card Number *
                  </label>
                  <input
                    type="text"
                    id="cardNumber"
                    name="cardNumber"
                    value={formData.cardNumber}
                    onChange={handleChange}
                    placeholder="1234 5678 9012 3456"
                    maxLength={19}
                    className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                      errors.cardNumber ? 'border-red-500' : 'border-[#d4d4d4]'
                    }`}
                    required
                  />
                  {errors.cardNumber && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardNumber}</p>
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
                    value={formData.cardholderName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                      errors.cardholderName ? 'border-red-500' : 'border-[#d4d4d4]'
                    }`}
                    required
                  />
                  {errors.cardholderName && (
                    <p className="mt-1 text-sm text-red-500">{errors.cardholderName}</p>
                  )}
                </div>

                {/* Expiry and CVV */}
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="expiryDate" className="block text-sm font-medium mb-2">
                      Expiry Date *
                    </label>
                    <input
                      type="text"
                      id="expiryDate"
                      name="expiryDate"
                      value={formData.expiryDate}
                      onChange={handleChange}
                      placeholder="MM/YY"
                      maxLength={5}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.expiryDate ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.expiryDate && (
                      <p className="mt-1 text-sm text-red-500">{errors.expiryDate}</p>
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
                      value={formData.cvv}
                      onChange={handleChange}
                      placeholder="123"
                      maxLength={3}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.cvv ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.cvv && (
                      <p className="mt-1 text-sm text-red-500">{errors.cvv}</p>
                    )}
                  </div>
                </div>

                {/* Security Notice */}
                <div className="bg-gray-50 p-4 rounded-[2px]">
                  <p className="text-sm text-secondary-text">
                    <Lock className="w-4 h-4 inline mr-2" />
                    Your payment information is encrypted and secure. We never store your full card details.
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <div className="mt-8 pt-6 border-t border-border">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-black text-white py-4 uppercase text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    'Processing...'
                  ) : (
                    <>
                      Continue to Review
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

