"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2, User, Mail, Lock } from 'lucide-react';

export default function SettingsPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/settings');
    } else if (session?.user) {
      setIsLoading(false);
    }
  }, [session, isPending, router]);

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
          <div className="max-w-2xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-8">Account Settings</h1>
            
            <div className="space-y-6">
              {/* Personal Information */}
              <div className="p-6 border border-border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <User className="w-5 h-5" />
                  <h2 className="text-xl font-medium">Personal Information</h2>
                </div>
                <div className="space-y-4">
                  <div>
                    <p className="text-label mb-1">NAME</p>
                    <p className="text-body">{session.user.name}</p>
                  </div>
                  <div>
                    <p className="text-label mb-1">EMAIL</p>
                    <p className="text-body">{session.user.email}</p>
                  </div>
                </div>
              </div>

              {/* Email Preferences */}
              <div className="p-6 border border-border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <Mail className="w-5 h-5" />
                  <h2 className="text-xl font-medium">Email Preferences</h2>
                </div>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className="text-body">Receive promotional emails</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" defaultChecked className="mr-3" />
                    <span className="text-body">Order updates and confirmations</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-3" />
                    <span className="text-body">New product announcements</span>
                  </label>
                </div>
              </div>

              {/* Security */}
              <div className="p-6 border border-border bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <Lock className="w-5 h-5" />
                  <h2 className="text-xl font-medium">Security</h2>
                </div>
                <button className="px-6 py-3 border border-primary text-primary hover:bg-secondary transition-colors">
                  <span className="text-button-secondary">CHANGE PASSWORD</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
