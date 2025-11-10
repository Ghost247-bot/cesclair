import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { ArrowRight, Share2, DollarSign, TrendingUp } from 'lucide-react';

export default function AffiliatesPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">AFFILIATE PROGRAM</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our affiliate program and earn commission by sharing Everlane with your audience
            </p>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors">
              <span className="text-button-primary">APPLY NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">WHY JOIN?</h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <Share2 className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Easy Sharing</h3>
                <p className="text-body text-muted-foreground">
                  Access custom links, banners, and content to share with your audience
                </p>
              </div>
              <div className="text-center">
                <DollarSign className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Competitive Commission</h3>
                <p className="text-body text-muted-foreground">
                  Earn up to 10% commission on every qualifying purchase
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Track Performance</h3>
                <p className="text-body text-muted-foreground">
                  Real-time dashboard to monitor clicks, conversions, and earnings
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">Ready to Get Started?</h2>
            <p className="text-body-large text-muted-foreground mb-8">
              Apply to our affiliate program today and start earning with Everlane
            </p>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors">
              <span className="text-button-primary">APPLY TO PROGRAM</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
