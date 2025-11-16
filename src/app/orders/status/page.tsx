"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { Package, Search, Loader2, CheckCircle, Truck, XCircle, Copy, Check, Printer, Download, Mail, RefreshCw, MessageCircle, ExternalLink, Share2, FileText, Calendar, CreditCard, ArrowLeft, User, ChevronDown, HelpCircle, Clock, History, AlertCircle, Info } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';

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

function OrderStatusContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const [orderNumber, setOrderNumber] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [searchType, setSearchType] = useState<'orderNumber' | 'email'>('orderNumber');
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [showRecentOrders, setShowRecentOrders] = useState(false);
  const [loadingRecentOrders, setLoadingRecentOrders] = useState(false);
  const [showHelpTips, setShowHelpTips] = useState(false);

  useEffect(() => {
    const orderNum = searchParams.get('orderNumber');
    if (orderNum) {
      setOrderNumber(orderNum);
      fetchOrderStatus(orderNum);
    } else {
      setOrderNumber('');
    }
  }, [searchParams]);

  useEffect(() => {
    if (session?.user) {
      fetchRecentOrders();
    }
  }, [session]);

  const fetchOrderStatus = async (orderNum: string, searchEmail?: string) => {
    if (searchType === 'orderNumber' && !orderNum.trim()) {
      setError('Please enter an order number');
      return;
    }
    if (searchType === 'email' && !searchEmail?.trim()) {
      setError('Please enter an email address');
      return;
    }

    setLoading(true);
    setError(null);
    setOrder(null);

    try {
      let url = '/api/orders/status/';
      if (searchType === 'orderNumber') {
        url += orderNum;
      } else {
        url += 'search'; // Use a placeholder path for email search
        url += `?email=${encodeURIComponent(searchEmail || '')}`;
      }
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok) {
        setOrder(data);
        // Update URL without reload
        if (searchType === 'orderNumber') {
          router.replace(`/orders/status?orderNumber=${orderNum}`, { scroll: false });
        }
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

  const fetchRecentOrders = async () => {
    if (!session?.user?.id) return;
    
    setLoadingRecentOrders(true);
    try {
      const response = await fetch('/api/account/orders?limit=5');
      if (response.ok) {
        const data = await response.json();
        setRecentOrders(data.orders || []);
      }
    } catch (err) {
      console.error('Error fetching recent orders:', err);
    } finally {
      setLoadingRecentOrders(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchType === 'orderNumber') {
      fetchOrderStatus(orderNumber);
    } else {
      fetchOrderStatus('', email);
    }
  };

  const handleSelectRecentOrder = (orderNum: string) => {
    setOrderNumber(orderNum);
    setSearchType('orderNumber');
    setShowRecentOrders(false);
    fetchOrderStatus(orderNum);
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

  const copyOrderNumber = async () => {
    if (!order?.orderNumber) return;
    
    try {
      await navigator.clipboard.writeText(order.orderNumber);
      setCopied(true);
      toast.success('Order number copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
      toast.error('Failed to copy order number');
    }
  };

  const handlePrint = () => {
    setIsPrinting(true);
    window.print();
    setTimeout(() => setIsPrinting(false), 1000);
  };

  const handleDownloadPDF = async () => {
    if (!order) return;
    setIsDownloading(true);
    try {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        const content = `
          <html>
            <head>
              <title>Order ${order.orderNumber}</title>
              <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                h1 { color: #000; }
                table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                th { background-color: #f2f2f2; }
              </style>
            </head>
            <body>
              <h1>Order ${order.orderNumber}</h1>
              <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
              <p><strong>Status:</strong> ${order.status.toUpperCase()}</p>
              <h2>Items</h2>
              <table>
                <tr><th>Product</th><th>Quantity</th><th>Price</th><th>Total</th></tr>
                ${order.items.map(item => `
                  <tr>
                    <td>${item.productName}</td>
                    <td>${item.quantity}</td>
                    <td>$${parseFloat(item.price).toFixed(2)}</td>
                    <td>$${(parseFloat(item.price) * item.quantity).toFixed(2)}</td>
                  </tr>
                `).join('')}
              </table>
              <h2>Summary</h2>
              <p>Subtotal: $${parseFloat(order.subtotal).toFixed(2)}</p>
              <p>Shipping: $${parseFloat(order.shipping).toFixed(2)}</p>
              <p>Tax: $${parseFloat(order.tax).toFixed(2)}</p>
              <p><strong>Total: $${parseFloat(order.total).toFixed(2)}</strong></p>
            </body>
          </html>
        `;
        printWindow.document.write(content);
        printWindow.document.close();
        printWindow.print();
      }
      toast.success('Order details ready to print');
    } catch (err) {
      console.error('Failed to generate PDF:', err);
      toast.error('Failed to generate order PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleShareOrder = async () => {
    if (!order) return;
    const url = `${window.location.origin}/orders/status?orderNumber=${order.orderNumber}`;
    try {
      if (navigator.share) {
        await navigator.share({
          title: `Order ${order.orderNumber}`,
          text: `Check out my order status: ${order.orderNumber}`,
          url: url,
        });
        toast.success('Order shared successfully');
      } else {
        await navigator.clipboard.writeText(url);
        toast.success('Order link copied to clipboard');
      }
    } catch (err) {
      console.error('Failed to share:', err);
    }
  };

  const handleTrackPackage = () => {
    if (!order?.trackingNumber) {
      toast.error('No tracking number available');
      return;
    }
    const trackingUrl = `https://tools.usps.com/go/TrackConfirmAction?tLabels=${order.trackingNumber}`;
    window.open(trackingUrl, '_blank');
  };

  const handleReorder = () => {
    if (!order) return;
    toast.info('Reorder feature coming soon!');
  };

  const handleReturnRequest = () => {
    if (!order) return;
    router.push(`/account/orders?return=${order.orderNumber}`);
  };

  const handleContactSupport = () => {
    const subject = encodeURIComponent(`Order Inquiry: ${order?.orderNumber || ''}`);
    const body = encodeURIComponent(`I need help with my order ${order?.orderNumber || ''}`);
    window.location.href = `mailto:support@cesclair.store?subject=${subject}&body=${body}`;
  };

  const getEstimatedDelivery = () => {
    if (!order) return null;
    if (order.status === 'delivered') return null;
    if (order.shippedAt) {
      const shippedDate = new Date(order.shippedAt);
      const estimatedDate = new Date(shippedDate);
      estimatedDate.setDate(estimatedDate.getDate() + 5);
      return estimatedDate;
    }
    if (order.status === 'processing' || order.status === 'pending') {
      const orderDate = new Date(order.createdAt);
      const estimatedDate = new Date(orderDate);
      estimatedDate.setDate(estimatedDate.getDate() + 7);
      return estimatedDate;
    }
    return null;
  };

  const estimatedDelivery = getEstimatedDelivery();

  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-4 mb-6">
              <Link
                href="/"
                className="flex items-center gap-2 text-secondary-text hover:text-primary-text transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span className="text-sm">Back to Home</span>
              </Link>
            </div>
            <h1 className="text-2xl sm:text-3xl font-medium mb-2">Check Order Status</h1>
            <p className="text-sm sm:text-base text-secondary-text mb-6 sm:mb-8">
              Enter your order number or email to check the status of your order.
            </p>

            {/* Recent Orders for Logged-in Users */}
            {session?.user && recentOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-white border border-border rounded-lg p-4 sm:p-6 mb-6"
              >
                <button
                  onClick={() => setShowRecentOrders(!showRecentOrders)}
                  className="w-full flex items-center justify-between text-left"
                >
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-secondary-text" />
                    <span className="text-sm font-medium">Recent Orders</span>
                    <span className="text-xs text-secondary-text">({recentOrders.length})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 text-secondary-text transition-transform ${showRecentOrders ? 'rotate-180' : ''}`} />
                </button>
                {showRecentOrders && (
                  <div className="mt-4 space-y-2 border-t border-border pt-4">
                    {loadingRecentOrders ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-4 h-4 animate-spin text-primary" />
                      </div>
                    ) : (
                      recentOrders.map((recentOrder) => (
                        <button
                          key={recentOrder.id}
                          onClick={() => handleSelectRecentOrder(recentOrder.orderNumber)}
                          className="w-full flex items-center justify-between p-3 hover:bg-gray-50 rounded-md transition-colors text-left border border-transparent hover:border-border"
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-sm font-medium">{recentOrder.orderNumber}</span>
                              <span className={`text-xs px-2 py-0.5 rounded-full ${getStatusColor(recentOrder.status)}`}>
                                {recentOrder.status.toUpperCase()}
                              </span>
                            </div>
                            <div className="flex items-center gap-3 text-xs text-secondary-text">
                              <span>{new Date(recentOrder.createdAt).toLocaleDateString()}</span>
                              <span>${parseFloat(recentOrder.total).toFixed(2)}</span>
                            </div>
                          </div>
                          <ArrowLeft className="w-4 h-4 text-secondary-text rotate-180" />
                        </button>
                      ))
                    )}
                  </div>
                )}
              </motion.div>
            )}

            {/* Search Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              onSubmit={handleSubmit}
              className="bg-white border border-border rounded-lg p-4 sm:p-6 mb-6 sm:mb-8"
            >
              {/* Search Type Tabs */}
              <div className="flex gap-2 mb-4 border-b border-border">
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('orderNumber');
                    setError(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'orderNumber'
                      ? 'border-black text-black'
                      : 'border-transparent text-secondary-text hover:text-primary-text'
                  }`}
                >
                  Order Number
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSearchType('email');
                    setError(null);
                  }}
                  className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
                    searchType === 'email'
                      ? 'border-black text-black'
                      : 'border-transparent text-secondary-text hover:text-primary-text'
                  }`}
                >
                  Email Address
                </button>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <div className="flex-1">
                  <label htmlFor={searchType === 'orderNumber' ? 'orderNumber' : 'email'} className="block text-sm font-medium mb-2">
                    {searchType === 'orderNumber' ? 'Order Number' : 'Email Address'}
                  </label>
                  {searchType === 'orderNumber' ? (
                    <input
                      type="text"
                      id="orderNumber"
                      value={orderNumber}
                      onChange={(e) => setOrderNumber(e.target.value.toUpperCase())}
                      placeholder="ORD-1234567890-ABC123"
                      className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none uppercase"
                      required
                    />
                  ) : (
                    <input
                      type="email"
                      id="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      className="w-full px-4 py-3 border border-[#d4d4d4] rounded-[2px] focus:ring-1 focus:ring-black focus:border-black outline-none"
                      required
                    />
                  )}
                  {searchType === 'orderNumber' && (
                    <p className="text-xs text-secondary-text mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Find your order number in your confirmation email
                    </p>
                  )}
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

            {/* Help Tips Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
              className="bg-white border border-border rounded-lg p-4 sm:p-6 mb-6"
            >
              <button
                onClick={() => setShowHelpTips(!showHelpTips)}
                className="w-full flex items-center justify-between text-left"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-secondary-text" />
                  <span className="text-sm font-medium">Need Help Finding Your Order?</span>
                </div>
                <ChevronDown className={`w-4 h-4 text-secondary-text transition-transform ${showHelpTips ? 'rotate-180' : ''}`} />
              </button>
              {showHelpTips && (
                <div className="mt-4 space-y-3 border-t border-border pt-4">
                  <div className="flex items-start gap-3">
                    <Mail className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Check Your Email</p>
                      <p className="text-xs text-secondary-text">
                        Your order confirmation email contains your order number. Look for an email from us with the subject "Order Confirmation".
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <User className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Logged in?</p>
                      <p className="text-xs text-secondary-text">
                        If you have an account, you can view all your orders in{' '}
                        <Link href="/account/orders" className="text-primary hover:underline">
                          your account dashboard
                        </Link>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Can't Find Your Order?</p>
                      <p className="text-xs text-secondary-text">
                        Contact our support team at{' '}
                        <a href="mailto:support@cesclair.store" className="text-primary hover:underline">
                          support@cesclair.store
                        </a>{' '}
                        or{' '}
                        <button onClick={handleContactSupport} className="text-primary hover:underline">
                          click here to send us a message
                        </button>.
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium mb-1">Order Processing Time</p>
                      <p className="text-xs text-secondary-text">
                        Most orders are processed within 1-2 business days. You'll receive a shipping confirmation email once your order ships.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>

            {/* Quick Links */}
            {!order && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 mb-6"
              >
                {session?.user && (
                  <Link
                    href="/account/orders"
                    className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <History className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-sm font-medium">View All Orders</p>
                      <p className="text-xs text-secondary-text">See your complete order history</p>
                    </div>
                  </Link>
                )}
                <Link
                  href="/shipping"
                  className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <Truck className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Shipping Info</p>
                    <p className="text-xs text-secondary-text">Delivery times and policies</p>
                  </div>
                </Link>
                <Link
                  href="/returns"
                  className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <RefreshCw className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Return Policy</p>
                    <p className="text-xs text-secondary-text">How to return or exchange</p>
                  </div>
                </Link>
                <button
                  onClick={handleContactSupport}
                  className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors text-left"
                >
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Contact Support</p>
                    <p className="text-xs text-secondary-text">Get help with your order</p>
                  </div>
                </button>
                <Link
                  href="/help"
                  className="flex items-center gap-3 p-4 bg-white border border-border rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <HelpCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">Help Center</p>
                    <p className="text-xs text-secondary-text">FAQs and guides</p>
                  </div>
                </Link>
              </motion.div>
            )}

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
                  <div className="mb-4 sm:mb-0 flex-1">
                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                      <h2 className="text-xl sm:text-2xl font-medium">
                        Order #{order.orderNumber}
                      </h2>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={copyOrderNumber}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary-text hover:text-primary-text hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-border"
                          title="Copy order number"
                        >
                          {copied ? (
                            <>
                              <Check className="w-4 h-4 text-green-600" />
                              <span className="text-green-600">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-4 h-4" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={handleShareOrder}
                          className="flex items-center gap-2 px-3 py-1.5 text-sm text-secondary-text hover:text-primary-text hover:bg-gray-100 rounded-md transition-colors border border-transparent hover:border-border"
                          title="Share order"
                        >
                          <Share2 className="w-4 h-4" />
                          <span>Share</span>
                        </button>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-text">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Placed on {formatDate(order.createdAt)}</span>
                      </div>
                      {estimatedDelivery && (
                        <div className="flex items-center gap-2">
                          <Truck className="w-4 h-4" />
                          <span>Est. delivery: {estimatedDelivery.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${getStatusColor(order.status)}`}>
                    {getStatusIcon(order.status)}
                    <span className="font-medium text-sm sm:text-base">
                      {order.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="mb-6 pb-6 border-b border-border">
                  <div className="flex flex-wrap gap-3">
                    <button
                      onClick={handlePrint}
                      disabled={isPrinting}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <Printer className="w-4 h-4" />
                      {isPrinting ? 'Printing...' : 'Print'}
                    </button>
                    <button
                      onClick={handleDownloadPDF}
                      disabled={isDownloading}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors disabled:opacity-50"
                    >
                      <Download className="w-4 h-4" />
                      {isDownloading ? 'Generating...' : 'Download PDF'}
                    </button>
                    {order.trackingNumber && (
                      <button
                        onClick={handleTrackPackage}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track Package
                      </button>
                    )}
                    {order.status !== 'cancelled' && order.status !== 'delivered' && (
                      <button
                        onClick={handleReturnRequest}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Return/Exchange
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <button
                        onClick={handleReorder}
                        className="flex items-center gap-2 px-4 py-2 text-sm bg-primary text-white hover:bg-primary/90 transition-colors"
                      >
                        <RefreshCw className="w-4 h-4" />
                        Reorder
                      </button>
                    )}
                    <button
                      onClick={handleContactSupport}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Contact Support
                    </button>
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
                          <Link
                            href={`/products/${item.productId}`}
                            className="font-medium mb-1 truncate hover:underline block"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-secondary-text">
                            Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                          </p>
                          {item.size && (
                            <p className="text-sm text-secondary-text">Size: {item.size}</p>
                          )}
                          {item.color && (
                            <p className="text-sm text-secondary-text">Color: {item.color}</p>
                          )}
                          {item.sku && (
                            <p className="text-xs text-secondary-text mt-1">SKU: {item.sku}</p>
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
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-medium mb-2">Tracking Information</h3>
                        <div className="flex items-center gap-2 mb-2">
                          <p className="text-secondary-text">
                            <span className="font-medium">Tracking Number:</span> {order.trackingNumber}
                          </p>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(order.trackingNumber || '');
                              toast.success('Tracking number copied');
                            }}
                            className="p-1 hover:bg-gray-100 rounded transition-colors"
                            title="Copy tracking number"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        {order.shippedAt && (
                          <p className="text-secondary-text">
                            Shipped on {formatDate(order.shippedAt)}
                          </p>
                        )}
                        {estimatedDelivery && (
                          <p className="text-secondary-text mt-1">
                            Estimated delivery: {estimatedDelivery.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                          </p>
                        )}
                      </div>
                      <button
                        onClick={handleTrackPackage}
                        className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors whitespace-nowrap"
                      >
                        <ExternalLink className="w-4 h-4" />
                        Track
                      </button>
                    </div>
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

                {/* Payment Information */}
                <div className="mb-6 pb-6 border-b border-border">
                  <h3 className="text-lg font-medium mb-4">Payment Information</h3>
                  <div className="flex items-center gap-3 text-secondary-text">
                    <CreditCard className="w-5 h-5" />
                    <div>
                      <p className="font-medium text-primary-text">Payment Method</p>
                      <p className="text-sm">Card ending in •••• (Paid on {formatDate(order.createdAt)})</p>
                    </div>
                  </div>
                </div>

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
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Discount:</span>
                        <span>-${parseFloat(order.discount).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="pt-4 border-t border-border flex justify-between font-medium text-lg">
                      <span>Total:</span>
                      <span>${parseFloat(order.total).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Quick Links */}
                <div className="mt-6 pt-6 border-t border-border">
                  <h3 className="text-lg font-medium mb-4">Need Help?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <Link
                      href="/shipping"
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                    >
                      <Truck className="w-4 h-4" />
                      Shipping Info
                    </Link>
                    <Link
                      href="/returns"
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                    >
                      <RefreshCw className="w-4 h-4" />
                      Return Policy
                    </Link>
                    <Link
                      href="/help"
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Help Center
                    </Link>
                    <button
                      onClick={handleContactSupport}
                      className="flex items-center gap-2 px-4 py-2 text-sm border border-border hover:bg-secondary transition-colors text-left"
                    >
                      <Mail className="w-4 h-4" />
                      Email Support
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </main>
    </>
  );
}

function OrderStatusLoading() {
  return (
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 md:py-16">
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm text-secondary-text">Loading order status...</p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<OrderStatusLoading />}>
      <OrderStatusContent />
    </Suspense>
  );
}

