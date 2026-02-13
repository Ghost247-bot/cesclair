"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import CautionBanners from '@/components/caution-banner';
import Link from 'next/link';
import { useSession, robustSignOut } from '@/lib/auth-client';
import { useInactivityLogout } from '@/lib/hooks/useInactivityLogout';
import { Shield, Package, ArrowRight, Loader2, User, Heart } from 'lucide-react';
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
      <div className="w-full border-b border-border/50">
        {session?.user ? (
          // Authenticated user view - Show personalized dashboard
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-4xl mx-auto">
              {/* Welcome Section */}
              <div className="text-center mb-12">
                <h1 className="text-3xl md:text-4xl font-medium mb-4">
                  Welcome back, {session.user.name}!
                </h1>
                <p className="text-body text-muted-foreground">
                  Manage your account, orders, and preferences
                </p>
              </div>

              {/* Quick Actions Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <Link 
                  href="/account/profile"
                  className="block p-6 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Profile</h3>
                  </div>
                  <p className="text-sm text-secondary-text">Personal information</p>
                </Link>

                <Link 
                  href="/account/orders"
                  className="block p-6 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Orders</h3>
                  </div>
                  <p className="text-sm text-secondary-text">Order history & tracking</p>
                </Link>

                <Link 
                  href="/account/favorites"
                  className="block p-6 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Heart className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Favorites</h3>
                  </div>
                  <p className="text-sm text-secondary-text">Wishlist items</p>
                </Link>

                <Link 
                  href="/account/addresses"
                  className="block p-6 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Package className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Addresses</h3>
                  </div>
                  <p className="text-sm text-secondary-text">Shipping addresses</p>
                </Link>

                <Link 
                  href="/account/settings"
                  className="block p-6 border border-border rounded-lg hover:bg-secondary transition-colors"
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                      <Shield className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-lg font-medium">Settings</h3>
                  </div>
                  <p className="text-sm text-secondary-text">Account preferences</p>
                </Link>
              </div>

              {/* Recent Orders Preview */}
              <div className="bg-muted/50 rounded-lg p-6">
                <h2 className="text-xl font-medium mb-4">Recent Orders</h2>
                {ordersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin" />
                  </div>
                ) : orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div key={order.id} className="border border-border rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <p className="font-medium">Order #{order.orderNumber}</p>
                            <p className="text-sm text-secondary-text">{formatDate(order.createdAt)}</p>
                          </div>
                          <span className={`text-sm font-medium ${getStatusColor(order.status)}`}>
                            {order.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-secondary-text">
                          <Package className="w-4 h-4" />
                          <span>{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center">
                    <p className="text-sm text-secondary-text">No recent orders</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          // Non-authenticated user view - Show login/register options
          <div className="container mx-auto px-6 py-16">
            <div className="max-w-md mx-auto text-center">
              <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-medium mb-4">Account Access</h1>
                <p className="text-body text-muted-foreground mb-8">
                  Sign in or create an account to manage your orders, wishlist, and preferences
                </p>
              </div>
              
              <div className="space-y-4">
                <Link 
                  href="/cesworld/login"
                  className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-6 py-4 hover:bg-secondary transition-colors"
                >
                  <span className="font-medium">Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                
                <Link 
                  href="/cesworld/register"
                  className="w-full flex items-center justify-center gap-3 border border-border rounded-lg px-6 py-4 hover:bg-secondary transition-colors"
                >
                  <span className="font-medium">Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
