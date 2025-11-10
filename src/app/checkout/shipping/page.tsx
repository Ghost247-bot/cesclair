"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Footer from '@/components/sections/footer';

interface ShippingFormData {
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

export default function CheckoutShippingPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<ShippingFormData>({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
  });
  const [errors, setErrors] = useState<Partial<ShippingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<ShippingFormData> = {};

    if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
    if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
    if (!formData.addressLine1.trim()) newErrors.addressLine1 = 'Address is required';
    if (!formData.city.trim()) newErrors.city = 'City is required';
    if (!formData.state.trim()) newErrors.state = 'State is required';
    if (!formData.zipCode.trim()) newErrors.zipCode = 'ZIP code is required';
    if (!formData.country.trim()) newErrors.country = 'Country is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Save shipping address to session/localStorage
    localStorage.setItem('checkout_shipping', JSON.stringify(formData));
    setIsSubmitting(false);
    router.push('/checkout/payment');
  };

  useEffect(() => {
    // Load saved shipping address if exists
    const saved = localStorage.getItem('checkout_shipping');
    if (saved) {
      try {
        setFormData(JSON.parse(saved));
      } catch (error) {
        console.error('Failed to load saved shipping address:', error);
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
                onClick={() => router.push('/checkout?step=cart')}
                className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors mb-4"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Cart
              </button>
              <h1 className="text-3xl font-medium mb-2">Shipping Information</h1>
              <p className="text-secondary-text">
                Enter your shipping address to continue with checkout.
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
                {/* Name Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="firstName" className="block text-sm font-medium mb-2">
                      First Name *
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.firstName ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.firstName && (
                      <p className="mt-1 text-sm text-red-500">{errors.firstName}</p>
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
                      value={formData.lastName}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.lastName ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.lastName && (
                      <p className="mt-1 text-sm text-red-500">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Address Line 1 */}
                <div>
                  <label htmlFor="addressLine1" className="block text-sm font-medium mb-2">
                    Address Line 1 *
                  </label>
                  <input
                    type="text"
                    id="addressLine1"
                    name="addressLine1"
                    value={formData.addressLine1}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                      errors.addressLine1 ? 'border-red-500' : 'border-[#d4d4d4]'
                    }`}
                    required
                  />
                  {errors.addressLine1 && (
                    <p className="mt-1 text-sm text-red-500">{errors.addressLine1}</p>
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
                    value={formData.addressLine2}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                  />
                </div>

                {/* City, State, ZIP */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium mb-2">
                      City *
                    </label>
                    <input
                      type="text"
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.city ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.city && (
                      <p className="mt-1 text-sm text-red-500">{errors.city}</p>
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
                      value={formData.state}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.state ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.state && (
                      <p className="mt-1 text-sm text-red-500">{errors.state}</p>
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
                      value={formData.zipCode}
                      onChange={handleChange}
                      className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                        errors.zipCode ? 'border-red-500' : 'border-[#d4d4d4]'
                      }`}
                      required
                    />
                    {errors.zipCode && (
                      <p className="mt-1 text-sm text-red-500">{errors.zipCode}</p>
                    )}
                  </div>
                </div>

                {/* Country */}
                <div>
                  <label htmlFor="country" className="block text-sm font-medium mb-2">
                    Country *
                  </label>
                  <select
                    id="country"
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                      errors.country ? 'border-red-500' : 'border-[#d4d4d4]'
                    }`}
                    required
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                  {errors.country && (
                    <p className="mt-1 text-sm text-red-500">{errors.country}</p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium mb-2">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                  />
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
                      Continue to Payment
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

