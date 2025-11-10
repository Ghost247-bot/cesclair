"use client";

import { useEffect, useState } from 'react';
import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';
import { Gift, Loader2 } from 'lucide-react';

export default function GiftCardPage() {
  const { data: session, isPending } = useSession();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [giftCardCode, setGiftCardCode] = useState('');

  useEffect(() => {
    if (!isPending && !session?.user) {
      router.push('/cesworld/login?redirect=/account/gift-card');
    } else if (session?.user) {
      setIsLoading(false);
    }
  }, [session, isPending, router]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle gift card redemption
    console.log('Redeeming gift card:', giftCardCode);
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
          <div className="max-w-2xl mx-auto">
            <div className="text-center mb-12">
              <Gift className="w-16 h-16 mx-auto mb-4 text-primary" />
              <h1 className="text-4xl md:text-5xl font-medium mb-4">Redeem Gift Card</h1>
              <p className="text-body text-muted-foreground">
                Enter your gift card code below to add it to your account
              </p>
            </div>
            
            <div className="p-8 border border-border bg-white">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="giftCardCode" className="block text-label mb-2">
                    GIFT CARD CODE
                  </label>
                  <input
                    id="giftCardCode"
                    type="text"
                    value={giftCardCode}
                    onChange={(e) => setGiftCardCode(e.target.value.toUpperCase())}
                    placeholder="XXXX-XXXX-XXXX-XXXX"
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring font-mono text-lg tracking-wider"
                    required
                  />
                  <p className="text-caption text-muted-foreground mt-2">
                    Enter the code exactly as it appears on your gift card
                  </p>
                </div>
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 px-6 hover:bg-primary/90 transition-colors"
                >
                  <span className="text-button-primary">REDEEM GIFT CARD</span>
                </button>
              </form>
            </div>

            {/* Info Section */}
            <div className="mt-8 p-6 bg-secondary">
              <h3 className="text-body-large font-medium mb-3">How it works</h3>
              <ul className="space-y-2 text-body text-muted-foreground">
                <li>• Gift card balances are added to your account immediately</li>
                <li>• Use your balance at checkout on any purchase</li>
                <li>• Gift cards never expire and can be combined with promotions</li>
                <li>• Check your gift card balance anytime in your account</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
