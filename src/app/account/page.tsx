"use client";

import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import Link from 'next/link';
import { useSession } from '@/lib/auth-client';
import { Shield } from 'lucide-react';

export default function AccountPage() {
  const { data: session, isPending } = useSession();
  const isAdmin = session?.user?.role === "admin";

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-2xl mx-auto">
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
      <Footer />
    </>
  );
}
