"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
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

interface SavedAddress {
  id: number;
  firstName: string;
  lastName: string;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone: string | null;
  isDefault: boolean;
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
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(true);

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
    try {
      // If using a saved address, just save to localStorage
      if (selectedAddressId) {
        localStorage.setItem('checkout_shipping', JSON.stringify({ ...formData, addressId: selectedAddressId }));
      } else {
        // Try to save new address to database if user is logged in
        try {
          const response = await fetch('/api/account/addresses', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            credentials: 'include',
            body: JSON.stringify({
              ...formData,
              isDefault: savedAddresses.length === 0, // Set as default if it's the first address
            }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('checkout_shipping', JSON.stringify({ ...formData, addressId: data.address.id }));
          } else {
            // Not logged in, just save to localStorage
            localStorage.setItem('checkout_shipping', JSON.stringify(formData));
          }
        } catch (error) {
          // Not logged in or error, just save to localStorage
          localStorage.setItem('checkout_shipping', JSON.stringify(formData));
        }
      }
      router.push('/checkout/payment');
    } catch (error) {
      console.error('Error saving shipping address:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Load saved addresses for logged-in users
  useEffect(() => {
    const loadAddresses = async () => {
      try {
        const response = await fetch('/api/account/addresses', {
          credentials: 'include',
        });
        if (response.ok) {
          const data = await response.json();
          if (data.addresses && data.addresses.length > 0) {
            setSavedAddresses(data.addresses);
            // Auto-select default address if available
            const defaultAddress = data.addresses.find((addr: SavedAddress) => addr.isDefault);
            if (defaultAddress) {
              setSelectedAddressId(defaultAddress.id);
              setFormData({
                firstName: defaultAddress.firstName,
                lastName: defaultAddress.lastName,
                addressLine1: defaultAddress.addressLine1,
                addressLine2: defaultAddress.addressLine2 || '',
                city: defaultAddress.city,
                state: defaultAddress.state,
                zipCode: defaultAddress.zipCode,
                country: defaultAddress.country,
                phone: defaultAddress.phone || '',
              });
            }
          } else {
            setShowNewAddressForm(true);
          }
        } else {
          // Not logged in or no addresses, check localStorage
          const saved = localStorage.getItem('checkout_shipping');
          if (saved) {
            try {
              setFormData(JSON.parse(saved));
            } catch (error) {
              console.error('Failed to load saved shipping address:', error);
            }
          }
          setShowNewAddressForm(true);
        }
      } catch (error) {
        console.error('Failed to load addresses:', error);
        // Fallback to localStorage
        const saved = localStorage.getItem('checkout_shipping');
        if (saved) {
          try {
            setFormData(JSON.parse(saved));
          } catch (err) {
            console.error('Failed to load saved shipping address:', err);
          }
        }
        setShowNewAddressForm(true);
      } finally {
        setIsLoadingAddresses(false);
      }
    };

    loadAddresses();
  }, []);

  const handleSelectAddress = (address: SavedAddress) => {
    setSelectedAddressId(address.id);
    setFormData({
      firstName: address.firstName,
      lastName: address.lastName,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || '',
      city: address.city,
      state: address.state,
      zipCode: address.zipCode,
      country: address.country,
      phone: address.phone || '',
    });
    setShowNewAddressForm(false);
  };

  const handleUseNewAddress = () => {
    setSelectedAddressId(null);
    setFormData({
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
    setShowNewAddressForm(true);
  };

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

            {/* Saved Addresses */}
            {isLoadingAddresses ? (
              <div className="bg-white border border-border rounded-lg p-8">
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
                </div>
              </div>
            ) : savedAddresses.length > 0 && !showNewAddressForm ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-border rounded-lg p-8"
              >
                <h2 className="text-lg font-medium mb-4">Select Shipping Address</h2>
                <div className="space-y-3 mb-6">
                  {savedAddresses.map((address) => (
                    <button
                      key={address.id}
                      type="button"
                      onClick={() => handleSelectAddress(address)}
                      className={`w-full text-left p-4 border-2 rounded-lg transition-colors ${
                        selectedAddressId === address.id
                          ? 'border-black bg-gray-50'
                          : 'border-border hover:border-gray-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="font-medium">
                              {address.firstName} {address.lastName}
                            </p>
                            {address.isDefault && (
                              <span className="text-xs bg-black text-white px-2 py-0.5 rounded">DEFAULT</span>
                            )}
                          </div>
                          <p className="text-sm text-secondary-text">{address.addressLine1}</p>
                          {address.addressLine2 && (
                            <p className="text-sm text-secondary-text">{address.addressLine2}</p>
                          )}
                          <p className="text-sm text-secondary-text">
                            {address.city}, {address.state} {address.zipCode}
                          </p>
                          <p className="text-sm text-secondary-text">{address.country}</p>
                          {address.phone && (
                            <p className="text-sm text-secondary-text mt-1">Phone: {address.phone}</p>
                          )}
                        </div>
                        {selectedAddressId === address.id && (
                          <div className="w-5 h-5 border-2 border-black bg-black rounded-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleUseNewAddress}
                  className="w-full flex items-center justify-center gap-2 py-3 border border-border rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium mb-6"
                >
                  <Plus className="w-4 h-4" />
                  Use a Different Address
                </button>
                <form onSubmit={handleSubmit}>
                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedAddressId}
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
                </form>
              </motion.div>
            ) : null}

            {/* Form */}
            {showNewAddressForm && (
              <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onSubmit={handleSubmit}
                className="bg-white border border-border rounded-lg p-8"
              >
                {savedAddresses.length > 0 && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <button
                      type="button"
                      onClick={() => {
                        if (savedAddresses.length > 0) {
                          const defaultAddr = savedAddresses.find(a => a.isDefault) || savedAddresses[0];
                          handleSelectAddress(defaultAddr);
                        } else {
                          setShowNewAddressForm(false);
                        }
                      }}
                      className="text-sm text-secondary-text hover:text-black transition-colors"
                    >
                      ← Use a saved address
                    </button>
                  </div>
                )}
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
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

