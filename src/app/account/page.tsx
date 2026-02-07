"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Link from 'next/link';
import { useSession, robustSignOut } from '@/lib/auth-client';
import { useInactivityLogout } from '@/lib/hooks/useInactivityLogout';
import { Shield, Package, ArrowRight, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

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
  items: OrderItem[];
}

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user?.role === "admin";
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Auto logout after 5 minutes of inactivity; ends session and redirects to login
  useInactivityLogout({
    redirectTo: '/cesworld/login',
    onLogout: robustSignOut,
    enabled: !!session?.user,
  });

  useEffect(() => {
    if (session?.user) {
      fetchRecentOrders();
    }
  }, [session]);

  const fetchRecentOrders = async () => {
    try {
      const response = await fetch('/api/account/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders?.slice(0, 3) || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto space-y-4">
            <h1 className="text-4xl md:text-5xl font-medium mb-8">My Account</h1>
            <div className="space-y-4">
              {isAdmin && (
                <Link 
                  href="/admin" 
                  className="block p-6 border border-border hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5" />
                    <div>
                      <h2 className="text-xl font-medium mb-2">Admin Panel</h2>
                      <p className="text-sm text-secondary-text">Manage designers and products</p>
                    </div>
                  </div>
                </Link>
              )}
              <Link 
                href="/account/orders" 
                className="block p-6 border border-border hover:bg-secondary transition-colors"
              >
                <h2 className="text-xl font-medium mb-2">Orders</h2>
                <p className="text-sm text-secondary-text">View your order history and track shipments</p>
              </Link>

              {ordersLoading ? (
                <div className="p-6 border border-border flex items-center justify-center">
                  <Loader2 className="w-5 h-5 animate-spin" />
                </div>
              ) : orders.length > 0 && (
                <div className="p-6 border border-border">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-medium">Recent Orders</h2>
                    <Link
                      href="/account/orders"
                      className="text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      View All
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/orders/status?orderNumber=${order.orderNumber}`}
                        className="block p-4 border border-border hover:bg-secondary transition-colors"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-secondary-text">
                              {formatDate(order.createdAt)}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                              {order.status.toUpperCase()}
                            </p>
                            <p className="text-sm text-secondary-text">
                              ${parseFloat(order.total).toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary-text">
                          <Package className="w-4 h-4" />
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              <Link 
                href="/account/profile" 
                className="block p-6 border border-border hover:bg-secondary transition-colors"
              >
                <h2 className="text-xl font-medium mb-2">Profile</h2>
                <p className="text-sm text-secondary-text">Manage your account information</p>
              </Link>
              <Link 
                href="/account/addresses" 
                className="block p-6 border border-border hover:bg-secondary transition-colors"
              >
                <h2 className="text-xl font-medium mb-2">Addresses</h2>
                <p className="text-sm text-secondary-text">Manage your shipping addresses</p>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
