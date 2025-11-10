"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function ProfilePage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/profile');
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
            <h1 className="text-4xl md:text-5xl font-medium mb-8">My Profile</h1>
            
            <div className="p-6 border border-border bg-white">
              <div className="space-y-6">
                <div>
                  <label className="block text-label mb-2">FULL NAME</label>
                  <input
                    type="text"
                    defaultValue={session.user.name}
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <div>
                  <label className="block text-label mb-2">EMAIL ADDRESS</label>
                  <input
                    type="email"
                    defaultValue={session.user.email}
                    disabled
                    className="w-full px-4 py-3 border border-input bg-secondary text-muted-foreground"
                  />
                  <p className="text-caption text-muted-foreground mt-1">
                    Contact support to change your email address
                  </p>
                </div>
                <div>
                  <label className="block text-label mb-2">PHONE NUMBER (OPTIONAL)</label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 000-0000"
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                <button className="w-full bg-primary text-white py-4 px-6 hover:bg-primary/90 transition-colors">
                  <span className="text-button-primary">SAVE CHANGES</span>
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
