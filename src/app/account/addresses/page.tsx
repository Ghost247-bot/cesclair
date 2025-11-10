"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Plus, Edit, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';

interface Address {
  id: number;
  userId: string;
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
  createdAt: Date;
  updatedAt: Date;
}

export default function AddressesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    addressLine1: '',
    addressLine2: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'United States',
    phone: '',
    isDefault: false,
  });

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/addresses');
    } else if (session?.user) {
      fetchAddresses();
    }
  }, [session, isPending, router]);

  const fetchAddresses = async () => {
    try {
      const response = await fetch('/api/account/addresses');
      if (response.ok) {
        const data = await response.json();
        setAddresses(data.addresses);
      } else {
        toast.error('Failed to load addresses');
      }
    } catch (error) {
      console.error('Error fetching addresses:', error);
      toast.error('Failed to load addresses');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
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
        isDefault: address.isDefault,
      });
    } else {
      setEditingAddress(null);
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
        isDefault: addresses.length === 0, // First address is default
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
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
      isDefault: false,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const url = editingAddress
        ? `/api/account/addresses/${editingAddress.id}`
        : '/api/account/addresses';
      const method = editingAddress ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingAddress ? 'Address updated successfully' : 'Address added successfully');
        handleCloseModal();
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to save address');
      }
    } catch (error) {
      console.error('Error saving address:', error);
      toast.error('Failed to save address');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this address?')) {
      return;
    }

    try {
      const response = await fetch(`/api/account/addresses/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Address deleted successfully');
        fetchAddresses();
      } else {
        const error = await response.json();
        toast.error(error.error || 'Failed to delete address');
      }
    } catch (error) {
      console.error('Error deleting address:', error);
      toast.error('Failed to delete address');
    }
  };

  if (isPending || isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return null;
  }

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-medium">Saved Addresses</h1>
              <button
                onClick={() => handleOpenModal()}
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span className="text-button-secondary">ADD ADDRESS</span>
              </button>
            </div>

            {addresses.length === 0 ? (
              <div className="text-center py-16">
                <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-medium mb-4">NO SAVED ADDRESSES</h2>
                <p className="text-body text-muted-foreground mb-8">
                  Add a shipping address to make checkout faster and easier.
                </p>
                <button
                  onClick={() => handleOpenModal()}
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span className="text-button-primary">ADD YOUR FIRST ADDRESS</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {addresses.map((address) => (
                  <div
                    key={address.id}
                    className="p-6 border border-border bg-white relative"
                  >
                    {address.isDefault && (
                      <span className="absolute top-4 right-4 text-xs font-medium text-primary bg-primary/10 px-2 py-1">
                        DEFAULT
                      </span>
                    )}
                    <div className="pr-20">
                      <p className="text-lg font-medium mb-2">
                        {address.firstName} {address.lastName}
                      </p>
                      <p className="text-body text-secondary-text mb-1">
                        {address.addressLine1}
                      </p>
                      {address.addressLine2 && (
                        <p className="text-body text-secondary-text mb-1">
                          {address.addressLine2}
                        </p>
                      )}
                      <p className="text-body text-secondary-text mb-1">
                        {address.city}, {address.state} {address.zipCode}
                      </p>
                      <p className="text-body text-secondary-text mb-1">
                        {address.country}
                      </p>
                      {address.phone && (
                        <p className="text-body text-secondary-text">
                          {address.phone}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2 mt-4">
                      <button
                        onClick={() => handleOpenModal(address)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-border hover:bg-secondary transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                        <span className="text-body-small">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDelete(address.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span className="text-body-small">Delete</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Address Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-medium">
                {editingAddress ? 'Edit Address' : 'Add New Address'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-secondary transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label mb-2">First Name *</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-label mb-2">Last Name *</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label mb-2">Address Line 1 *</label>
                <input
                  type="text"
                  value={formData.addressLine1}
                  onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div>
                <label className="block text-label mb-2">Address Line 2</label>
                <input
                  type="text"
                  value={formData.addressLine2}
                  onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label mb-2">City *</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-label mb-2">State *</label>
                  <input
                    type="text"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-label mb-2">ZIP Code *</label>
                  <input
                    type="text"
                    value={formData.zipCode}
                    onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-label mb-2">Country *</label>
                  <input
                    type="text"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-label mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={formData.isDefault}
                  onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                  className="w-4 h-4"
                />
                <label htmlFor="isDefault" className="text-body">
                  Set as default address
                </label>
              </div>

              <div className="flex gap-4 pt-4">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 bg-primary text-white py-3 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="text-button-primary">
                    {isSaving ? 'SAVING...' : editingAddress ? 'UPDATE ADDRESS' : 'ADD ADDRESS'}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="px-6 py-3 border border-border hover:bg-secondary transition-colors"
                >
                  <span className="text-button-secondary">CANCEL</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
