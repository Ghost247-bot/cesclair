"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Gift, Truck, CreditCard, Star, Loader2 } from "lucide-react";
import { useSession } from "@/lib/auth-client";
import { useEffect, useState } from "react";

interface Member {
  id: number;
  userId: string;
  tier: string;
  points: number;
  annualSpending: string;
}

export default function Cesworld() {
  const { data: session, isPending } = useSession();
  const [member, setMember] = useState<Member | null>(null);
  const [isLoadingMember, setIsLoadingMember] = useState(false);

  useEffect(() => {
    const fetchMember = async () => {
      if (!session?.user?.id) return;
      
      setIsLoadingMember(true);
      try {
        const token = localStorage.getItem("bearer_token");
        const res = await fetch(`/api/cesworld/members/user/${session.user.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setMember(data);
        }
      } catch (error) {
        console.error("Error fetching member:", error);
      } finally {
        setIsLoadingMember(false);
      }
    };

    if (session?.user) {
      fetchMember();
    }
  }, [session]);

  const getTierName = (tier: string) => {
    return tier.charAt(0).toUpperCase() + tier.slice(1);
  };

  return (
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        <Image
          src="https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/project-uploads/a7697d88-840c-467f-b726-f555a6a2eb36/generated_images/lifestyle-product-photography-of-premium-52a1c872-20251109091318.jpg"
          alt="Premium rewards and shopping experience"
          fill
          className="object-cover object-center"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-br from-accent/60 to-accent-background/60" />
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
          <div className="text-6xl md:text-8xl font-bold mb-6 tracking-tight">CESWORLD</div>
          <p className="text-xl md:text-2xl mb-8 text-muted-foreground">
            Your world of perks, points, and exclusive access
          </p>
          
          {/* Role-based CTAs */}
          {isPending || isLoadingMember ? (
            <div className="flex justify-center">
              <Loader2 className="w-8 h-8 animate-spin" />
            </div>
          ) : session?.user && member ? (
            // Logged in - Show member info and dashboard link
            <div className="space-y-4">
              <div className="bg-white/90 backdrop-blur-sm p-6 rounded-lg inline-block">
                <p className="text-body mb-2">Welcome back, {session.user.name?.split(" ")[0]}!</p>
                <div className="flex items-center gap-6 justify-center">
                  <div className="text-center">
                    <p className="text-label text-muted-foreground mb-1">YOUR TIER</p>
                    <p className="text-xl font-medium">{getTierName(member.tier)}</p>
                  </div>
                  <div className="w-px h-12 bg-border" />
                  <div className="text-center">
                    <p className="text-label text-muted-foreground mb-1">POINTS</p>
                    <p className="text-xl font-medium">{member.points.toLocaleString()}</p>
                  </div>
                </div>
              </div>
              <Link
                href="/cesworld/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">VIEW DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            // Not logged in - Show join/login buttons
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/cesworld/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">JOIN NOW - IT'S FREE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/cesworld/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-secondary transition-colors"
              >
                <span className="text-button-primary">MEMBER LOGIN</span>
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* Benefits Overview */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">MEMBERSHIP BENEFITS</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Star className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-4">Earn Points</h3>
              <p className="text-body text-muted-foreground">
                Get 1 point for every $1 spent. Redeem for discounts on future purchases.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Gift className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-4">Birthday Rewards</h3>
              <p className="text-body text-muted-foreground">
                Receive a special gift on your birthday as our thank you.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <Truck className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-4">Free Shipping</h3>
              <p className="text-body text-muted-foreground">
                Enjoy free standard shipping on orders over $99.
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-secondary flex items-center justify-center">
                <CreditCard className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-medium mb-4">Early Access</h3>
              <p className="text-body text-muted-foreground">
                Shop new arrivals and sales before anyone else.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Tiers Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-4">MEMBERSHIP TIERS</h2>
          <p className="text-center text-body-large text-muted-foreground mb-16 max-w-2xl mx-auto">
            The more you shop, the more you save. Move up tiers to unlock additional benefits.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Member Tier */}
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-2xl font-medium mb-2">MEMBER</div>
              <div className="text-muted-foreground mb-6">$0 - $499 annually</div>
              <ul className="space-y-3 text-left text-body mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Earn 1 point per $1 spent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Birthday reward</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Free shipping over $99</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Early access to sales</span>
                </li>
              </ul>
            </div>

            {/* Plus Tier */}
            <div className="bg-white p-8 rounded-lg text-center border-2 border-primary relative">
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white px-4 py-1 text-caption">
                MOST POPULAR
              </div>
              <div className="text-2xl font-medium mb-2">PLUS</div>
              <div className="text-muted-foreground mb-6">$500 - $999 annually</div>
              <ul className="space-y-3 text-left text-body mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>All Member benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Earn 1.25 points per $1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Free shipping on all orders</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Exclusive member-only sales</span>
                </li>
              </ul>
            </div>

            {/* Premier Tier */}
            <div className="bg-white p-8 rounded-lg text-center">
              <div className="text-2xl font-medium mb-2">PREMIER</div>
              <div className="text-muted-foreground mb-6">$1000+ annually</div>
              <ul className="space-y-3 text-left text-body mb-8">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>All Plus benefits</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Earn 1.5 points per $1</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Priority customer service</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-1">✓</span>
                  <span>Exclusive events & experiences</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-4xl">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">HOW IT WORKS</h2>
          <div className="space-y-12">
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                1
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Sign Up for Free</h3>
                <p className="text-body text-muted-foreground">
                  Create your Cesworld account in seconds. No cost, no credit card required.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                2
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Shop & Earn Points</h3>
                <p className="text-body text-muted-foreground">
                  Every purchase earns you points. Watch your balance grow with each order.
                </p>
              </div>
            </div>
            <div className="flex gap-6 items-start">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center text-xl font-medium">
                3
              </div>
              <div>
                <h3 className="text-xl font-medium mb-2">Redeem Rewards</h3>
                <p className="text-body text-muted-foreground">
                  Use your points for discounts on future purchases. 100 points = $10 off.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent to-accent-background text-center">
        <div className="container mx-auto max-w-3xl">
          {session?.user && member ? (
            <>
              <h2 className="text-3xl md:text-4xl font-medium mb-6">Keep Earning, Keep Saving</h2>
              <p className="text-body-large text-muted-foreground mb-8">
                You're a {getTierName(member.tier)} member with {member.points} points. Keep shopping to unlock more rewards!
              </p>
              <Link
                href="/cesworld/dashboard"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">VIEW YOUR DASHBOARD</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-3xl md:text-4xl font-medium mb-6">Ready to Join Cesworld?</h2>
              <p className="text-body-large text-muted-foreground mb-8">
                Sign up today and start earning points on every purchase.
              </p>
              <Link
                href="/cesworld/register"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <span className="text-button-primary">CREATE YOUR ACCOUNT</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </section>
    </main>
  );
}