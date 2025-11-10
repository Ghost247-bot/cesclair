"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Package, Loader2 } from 'lucide-react';
import Link from 'next/link';

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
  createdAt: Date;
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
  items: OrderItem[];
}

export default function OrdersPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/orders');
    } else if (session?.user) {
      fetchOrders();
    }
  }, [session, isPending, router]);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/account/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders);
      } else {
        console.error('Failed to load orders');
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'delivered':
        return 'text-green-600';
      case 'shipped':
        return 'text-blue-600';
      case 'processing':
        return 'text-yellow-600';
      case 'cancelled':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
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
            <h1 className="text-4xl md:text-5xl font-medium mb-8">Order History</h1>

            {orders.length === 0 ? (
              <div className="text-center py-16">
                <Package className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h2 className="text-2xl font-medium mb-4">NO ORDERS YET</h2>
                <p className="text-body text-muted-foreground mb-8">
                  When you make your first purchase, your order history will appear here.
                </p>
                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                  <span className="text-button-primary">START SHOPPING</span>
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-6 border border-border bg-white"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-lg font-medium mb-1">
                          Order #{order.orderNumber}
                        </p>
                        <p className="text-body text-secondary-text">
                          Placed on {formatDate(order.createdAt)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-body font-medium mb-1 ${getStatusColor(order.status)}`}>
                          {order.status.toUpperCase()}
                        </p>
                        <p className="text-lg font-medium">
                          ${parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex gap-4">
                          {item.productImage && (
                            <img
                              src={item.productImage}
                              alt={item.productName}
                              className="w-16 h-16 object-cover"
                            />
                          )}
                          <div className="flex-1">
                            <p className="text-body font-medium">{item.productName}</p>
                            <p className="text-body-small text-secondary-text">
                              Quantity: {item.quantity} × ${parseFloat(item.price).toFixed(2)}
                            </p>
                            {item.size && (
                              <p className="text-body-small text-secondary-text">
                                Size: {item.size}
                              </p>
                            )}
                            {item.color && (
                              <p className="text-body-small text-secondary-text">
                                Color: {item.color}
                              </p>
                            )}
                          </div>
                          <p className="text-body font-medium">
                            ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                          </p>
                        </div>
                      ))}
                    </div>

                    {order.trackingNumber && (
                      <p className="text-body-small text-secondary-text mb-2">
                        Tracking: {order.trackingNumber}
                      </p>
                    )}

                    {order.shippedAt && (
                      <p className="text-body-small text-secondary-text mb-2">
                        Shipped on {formatDate(order.shippedAt)}
                      </p>
                    )}

                    <div className="pt-4 border-t border-border">
                      <div className="flex justify-between text-body-small text-secondary-text mb-2">
                        <span>Subtotal:</span>
                        <span>${parseFloat(order.subtotal).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-body-small text-secondary-text mb-2">
                        <span>Shipping:</span>
                        <span>${parseFloat(order.shipping).toFixed(2)}</span>
                      </div>
                      {parseFloat(order.tax) > 0 && (
                        <div className="flex justify-between text-body-small text-secondary-text mb-2">
                          <span>Tax:</span>
                          <span>${parseFloat(order.tax).toFixed(2)}</span>
                        </div>
                      )}
                      {parseFloat(order.discount) > 0 && (
                        <div className="flex justify-between text-body-small text-secondary-text mb-2">
                          <span>Discount:</span>
                          <span>-${parseFloat(order.discount).toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-body font-medium pt-2 border-t border-border">
                        <span>Total:</span>
                        <span>${parseFloat(order.total).toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

