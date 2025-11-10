"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { MapPin, Loader2, Plus } from 'lucide-react';

export default function AddressesPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/addresses');
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
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-4xl md:text-5xl font-medium">Saved Addresses</h1>
              <button className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-button-secondary">ADD ADDRESS</span>
              </button>
            </div>
            
            {/* Empty State */}
            <div className="text-center py-16">
              <MapPin className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-2xl font-medium mb-4">No saved addresses</h2>
              <p className="text-body text-muted-foreground mb-8">
                Add a shipping address to make checkout faster and easier.
              </p>
              <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors">
                <Plus className="w-4 h-4" />
                <span className="text-button-primary">ADD YOUR FIRST ADDRESS</span>
              </button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
