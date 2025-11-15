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

interface BillingFormData {
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

export default function CheckoutPaymentPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<PaymentFormData>({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    cardholderName: '',
  });
  const [billingData, setBillingData] = useState<BillingFormData>({
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
  const [errors, setErrors] = useState<Partial<PaymentFormData>>({});
  const [billingErrors, setBillingErrors] = useState<Partial<BillingFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useSameAsShipping, setUseSameAsShipping] = useState(true);

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

  const handleBillingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
    if (billingErrors[name as keyof BillingFormData]) {
      setBillingErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<PaymentFormData> = {};
    const newBillingErrors: Partial<BillingFormData> = {};

    // Payment validation
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

    // Billing address validation (only if not using same as shipping)
    if (!useSameAsShipping) {
      if (!billingData.firstName.trim()) newBillingErrors.firstName = 'First name is required';
      if (!billingData.lastName.trim()) newBillingErrors.lastName = 'Last name is required';
      if (!billingData.addressLine1.trim()) newBillingErrors.addressLine1 = 'Address is required';
      if (!billingData.city.trim()) newBillingErrors.city = 'City is required';
      if (!billingData.state.trim()) newBillingErrors.state = 'State is required';
      if (!billingData.zipCode.trim()) newBillingErrors.zipCode = 'ZIP code is required';
      if (!billingData.country.trim()) newBillingErrors.country = 'Country is required';
    }

    setErrors(newErrors);
    setBillingErrors(newBillingErrors);
    return Object.keys(newErrors).length === 0 && Object.keys(newBillingErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    // Save payment and billing info to localStorage
    localStorage.setItem('checkout_payment', JSON.stringify({
      payment: formData,
      billing: useSameAsShipping ? null : billingData,
      useSameAsShipping,
    }));
    setIsSubmitting(false);
    router.push('/checkout/review');
  };

  useEffect(() => {
    // Load saved shipping address to use for billing if "same as shipping" is checked
    const savedShipping = localStorage.getItem('checkout_shipping');
    if (savedShipping) {
      try {
        const shipping = JSON.parse(savedShipping);
        if (useSameAsShipping) {
          setBillingData({
            firstName: shipping.firstName || '',
            lastName: shipping.lastName || '',
            addressLine1: shipping.addressLine1 || '',
            addressLine2: shipping.addressLine2 || '',
            city: shipping.city || '',
            state: shipping.state || '',
            zipCode: shipping.zipCode || '',
            country: shipping.country || 'United States',
            phone: shipping.phone || '',
          });
        }
      } catch (error) {
        console.error('Failed to load saved shipping address:', error);
      }
    }

    // Load saved payment info if exists
    const saved = localStorage.getItem('checkout_payment');
    if (saved) {
      try {
        const payment = JSON.parse(saved);
        setFormData(payment.payment || formData);
        if (payment.billing) {
          setBillingData(payment.billing);
          setUseSameAsShipping(false);
        }
      } catch (error) {
        console.error('Failed to load saved payment info:', error);
      }
    }
  }, []);

  useEffect(() => {
    // Update billing address when "same as shipping" is toggled
    if (useSameAsShipping) {
      const savedShipping = localStorage.getItem('checkout_shipping');
      if (savedShipping) {
        try {
          const shipping = JSON.parse(savedShipping);
          setBillingData({
            firstName: shipping.firstName || '',
            lastName: shipping.lastName || '',
            addressLine1: shipping.addressLine1 || '',
            addressLine2: shipping.addressLine2 || '',
            city: shipping.city || '',
            state: shipping.state || '',
            zipCode: shipping.zipCode || '',
            country: shipping.country || 'United States',
            phone: shipping.phone || '',
          });
          setBillingErrors({});
        } catch (error) {
          console.error('Failed to load saved shipping address:', error);
        }
      }
    }
  }, [useSameAsShipping]);

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
                {/* Billing Address Section */}
                <div className="pb-6 border-b border-border">
                  <h3 className="text-lg font-medium mb-4">Billing Address</h3>
                  
                  <div className="mb-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={useSameAsShipping}
                        onChange={(e) => setUseSameAsShipping(e.target.checked)}
                        className="w-4 h-4 border-border rounded focus:ring-black"
                      />
                      <span className="text-sm">Use same address as shipping</span>
                    </label>
                  </div>

                  {!useSameAsShipping && (
                    <div className="space-y-4 mt-4">
                      {/* Name Fields */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label htmlFor="billingFirstName" className="block text-sm font-medium mb-2">
                            First Name *
                          </label>
                          <input
                            type="text"
                            id="billingFirstName"
                            name="firstName"
                            value={billingData.firstName}
                            onChange={handleBillingChange}
                            className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                              billingErrors.firstName ? 'border-red-500' : 'border-[#d4d4d4]'
                            }`}
                            required={!useSameAsShipping}
                          />
                          {billingErrors.firstName && (
                            <p className="mt-1 text-sm text-red-500">{billingErrors.firstName}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingLastName" className="block text-sm font-medium mb-2">
                            Last Name *
                          </label>
                          <input
                            type="text"
                            id="billingLastName"
                            name="lastName"
                            value={billingData.lastName}
                            onChange={handleBillingChange}
                            className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                              billingErrors.lastName ? 'border-red-500' : 'border-[#d4d4d4]'
                            }`}
                            required={!useSameAsShipping}
                          />
                          {billingErrors.lastName && (
                            <p className="mt-1 text-sm text-red-500">{billingErrors.lastName}</p>
                          )}
                        </div>
                      </div>

                      {/* Address Line 1 */}
                      <div>
                        <label htmlFor="billingAddressLine1" className="block text-sm font-medium mb-2">
                          Address Line 1 *
                        </label>
                        <input
                          type="text"
                          id="billingAddressLine1"
                          name="addressLine1"
                          value={billingData.addressLine1}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            billingErrors.addressLine1 ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required={!useSameAsShipping}
                        />
                        {billingErrors.addressLine1 && (
                          <p className="mt-1 text-sm text-red-500">{billingErrors.addressLine1}</p>
                        )}
                      </div>

                      {/* Address Line 2 */}
                      <div>
                        <label htmlFor="billingAddressLine2" className="block text-sm font-medium mb-2">
                          Address Line 2 (Optional)
                        </label>
                        <input
                          type="text"
                          id="billingAddressLine2"
                          name="addressLine2"
                          value={billingData.addressLine2}
                          onChange={handleBillingChange}
                          className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                        />
                      </div>

                      {/* City, State, ZIP */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label htmlFor="billingCity" className="block text-sm font-medium mb-2">
                            City *
                          </label>
                          <input
                            type="text"
                            id="billingCity"
                            name="city"
                            value={billingData.city}
                            onChange={handleBillingChange}
                            className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                              billingErrors.city ? 'border-red-500' : 'border-[#d4d4d4]'
                            }`}
                            required={!useSameAsShipping}
                          />
                          {billingErrors.city && (
                            <p className="mt-1 text-sm text-red-500">{billingErrors.city}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingState" className="block text-sm font-medium mb-2">
                            State *
                          </label>
                          <input
                            type="text"
                            id="billingState"
                            name="state"
                            value={billingData.state}
                            onChange={handleBillingChange}
                            className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                              billingErrors.state ? 'border-red-500' : 'border-[#d4d4d4]'
                            }`}
                            required={!useSameAsShipping}
                          />
                          {billingErrors.state && (
                            <p className="mt-1 text-sm text-red-500">{billingErrors.state}</p>
                          )}
                        </div>
                        <div>
                          <label htmlFor="billingZipCode" className="block text-sm font-medium mb-2">
                            ZIP Code *
                          </label>
                          <input
                            type="text"
                            id="billingZipCode"
                            name="zipCode"
                            value={billingData.zipCode}
                            onChange={handleBillingChange}
                            className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                              billingErrors.zipCode ? 'border-red-500' : 'border-[#d4d4d4]'
                            }`}
                            required={!useSameAsShipping}
                          />
                          {billingErrors.zipCode && (
                            <p className="mt-1 text-sm text-red-500">{billingErrors.zipCode}</p>
                          )}
                        </div>
                      </div>

                      {/* Country */}
                      <div>
                        <label htmlFor="billingCountry" className="block text-sm font-medium mb-2">
                          Country *
                        </label>
                        <select
                          id="billingCountry"
                          name="country"
                          value={billingData.country}
                          onChange={handleBillingChange}
                          className={`w-full px-4 py-3 border rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none ${
                            billingErrors.country ? 'border-red-500' : 'border-[#d4d4d4]'
                          }`}
                          required={!useSameAsShipping}
                        >
                          <option value="United States">United States</option>
                          <option value="Canada">Canada</option>
                          <option value="United Kingdom">United Kingdom</option>
                          <option value="Australia">Australia</option>
                        </select>
                        {billingErrors.country && (
                          <p className="mt-1 text-sm text-red-500">{billingErrors.country}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Information */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                </div>

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

