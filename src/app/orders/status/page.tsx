"use client";

import React, { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Package, Search, Loader2, CheckCircle, Truck, XCircle } from 'lucide-react';
import Footer from '@/components/sections/footer';

interface OrderItem {
  id: number;
  orderId: number;
  productId: number;
  productName: string;
  productImage: string | null;
  price: string;
  quantity: number;
  size: string | null;
  color: string | null;
  sku: string | null;
}

interface Order {
  id: number;
  orderNumber: string;
  userId: string | null;
  email: string;
  status: string;
  subtotal: string;
  shipping: string;
  tax: string;
  discount: string;
  total: string;
  trackingNumber: string | null;
  shippedAt: Date | null;
  deliveredAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  shippingFirstName: string | null;
  shippingLastName: string | null;
  shippingAddressLine1: string | null;
  shippingCity: string | null;
  shippingState: string | null;
  shippingZipCode: string | null;
  shippingCountry: string | null;
  items: OrderItem[];
}

export default function OrderStatusPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('orderNumber') || '');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const orderNum = searchParams.get('orderNumber');
    if (orderNum) {
      setOrderNumber(orderNum);
      fetchOrderStatus(orderNum);
    }
  }, [searchParams]);

  const fetchOrderStatus = async (orderNum: string) => {
    if (!orderNum.trim()) {
      setError('Please enter an order number');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      const response = await fetch(`/api/orders/status/${orderNum}`);
      const data = await response.json();

      if (response.ok) {
        setOrder(data);
        // Update URL without reload
        router.replace(`/orders/status?orderNumber=${orderNum}`, { scroll: false });
      } else {
        setError(data.error || 'Order not found');
      }
    } catch (err) {
      console.error('Error fetching order:', err);
      setError('Failed to fetch order status. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchOrderStatus(orderNumber);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600 bg-green-50';
      case 'shipped':
        return 'text-blue-600 bg-blue-50';
      case 'processing':
        return 'text-yellow-600 bg-yellow-50';
      case 'cancelled':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return <CheckCircle className="w-5 h-5" />;
      case 'shipped':
        return <Truck className="w-5 h-5" />;
      case 'cancelled':
        return <XCircle className="w-5 h-5" />;
      default:
        return <Package className="w-5 h-5" />;
    }
  };

  const formatDate = (date: Date | string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-2xl sm:text-3xl font-medium mb-2">Check Order Status</h1>
            <p className="text-sm sm:text-base text-secondary-text mb-6 sm:mb-8">
              Enter your order number to check the status of your order.
            </p>

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-white border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
            >
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label htmlFor="orderNumber" className="block text-sm font-medium mb-2">
                    Order Number
                  </label>
                  <input
                    type="text"
                    id="orderNumber"
                    value={orderNumber}
                    onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                    placeholder="ORD-1234567890-ABC123"
                    className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none uppercase"
                    required
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto bg-black text-white px-6 sm:px-8 py-3 uppercase text-xs sm:text-sm font-medium tracking-wider hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4" />
                        Search
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.form>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6"
              >
                <p className="text-red-800">{error}</p>
              </motion.div>
            )}

            {/* Order Details */}
            {order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="bg-white border border-border rounded-lg p-4 sm:p-6 md:p-8"
              >
                {/* Order Header */}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between mb-6 pb-6 border-b border-border">
                  <div className="mb-4 sm:mb-0">
                    <h2 className="text-xl sm:text-2xl font-medium mb-2">
                      Order #{order.orderNumber}
                    </h2>
                    <p className="text-sm sm:text-base text-secondary-text">
                      Placed on {formatDate(order.createdAt)}
                    </p>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-medium text-sm sm:text-base">
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h3 className="text-lg font-medium mb-4">Order Items</h3>
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-4 pb-4 border-b border-border last:border-0"
                      >
                        {item.productImage && (
                          <div className="w-16 h-16 sm:w-20 sm:h-20 relative flex-shrink-0 overflow-hidden rounded">
                            <Image
                              src={item.productImage}
                              alt={item.productName}
                              fill
                              className="object-cover rounded"
                              sizes="80px"
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium mb-1 truncate">{item.productName}</h4>
                          <p className="text-sm text-secondary-text">
                            Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                          </p>
                          {item.size && (
                            <p className="text-sm text-secondary-text">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm text-secondary-text">Color: {item.color}</p>
                          )}
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Information */}
                {order.shippingFirstName && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="text-lg font-medium mb-4">Shipping Address</h3>
                    <div className="text-secondary-text">
                      <p className="font-medium text-primary-text">
                        {order.shippingFirstName} {order.shippingLastName}
                      </p>
                      {order.shippingAddressLine1 && <p>{order.shippingAddressLine1}</p>}
                      {order.shippingCity && order.shippingState && order.shippingZipCode && (
                        <p>
                          {order.shippingCity}, {order.shippingState} {order.shippingZipCode}
                        </p>
                      )}
                      {order.shippingCountry && <p>{order.shippingCountry}</p>}
                    </div>
                  </div>
                )}

                {/* Tracking Information */}
                {order.trackingNumber && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="text-lg font-medium mb-2">Tracking Information</h3>
                    <p className="text-secondary-text">
                      <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                    </p>
                    {order.shippedAt && (
                      <p className="text-secondary-text mt-1">
                        Shipped on {formatDate(order.shippedAt)}
                      </p>
                    )}
                  </div>
                )}

                {/* Status Timeline */}
                {order.status !== 'pending' && (
                  <div className="mb-6 pb-6 border-b border-border">
                    <h3 className="text-lg font-medium mb-4">Order Timeline</h3>
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="font-medium">Order Placed</p>
                          <p className="text-sm text-secondary-text">{formatDate(order.createdAt)}</p>
                        </div>
                      </div>
                      {order.status === 'processing' || order.status === 'shipped' || order.status === 'delivered' ? (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Order Processing</p>
                            <p className="text-sm text-secondary-text">Order is being prepared</p>
                          </div>
                        </div>
                      ) : null}
                      {order.status === 'shipped' || order.status === 'delivered' ? (
                        <div className="flex items-start gap-3">
                          <Truck className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Order Shipped</p>
                            <p className="text-sm text-secondary-text">
                              {order.shippedAt ? formatDate(order.shippedAt) : 'In transit'}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {order.status === 'delivered' ? (
                        <div className="flex items-start gap-3">
                          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Order Delivered</p>
                            <p className="text-sm text-secondary-text">
                              {order.deliveredAt ? formatDate(order.deliveredAt) : 'Delivered'}
                            </p>
                          </div>
                        </div>
                      ) : null}
                      {order.status === 'cancelled' ? (
                        <div className="flex items-start gap-3">
                          <XCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
                          <div>
                            <p className="font-medium">Order Cancelled</p>
                            <p className="text-sm text-secondary-text">This order has been cancelled</p>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>
                )}

                {/* Order Summary */}
                <div>
                  <h3 className="text-lg font-medium mb-4">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Subtotal:</span>
                      <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-secondary-text">Shipping:</span>
                      <span>${parseFloat(order.shipping).toFixed(2)}</span>
                    </div>
                    {parseFloat(order.tax) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Tax:</span>
                        <span>${parseFloat(order.tax).toFixed(2)}</span>
                      </div>
                    )}
                    {parseFloat(order.discount) > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-secondary-text">Discount:</span>
                        <span>-${parseFloat(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-border flex justify-between font-medium">
                      <span>Total:</span>
                      <span>${parseFloat(order.total).toFixed(2)}</span>
                    </div>
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

