import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { Globe, ShoppingBag, Truck, CreditCard } from 'lucide-react';

export default function InternationalPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <Globe className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-medium mb-6">INTERNATIONAL SHIPPING</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              We ship Everlane quality and transparency worldwide
            </p>
          </div>
        </section>

        {/* Countries We Ship To */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">WHERE WE SHIP</h2>
            <p className="text-body-large text-muted-foreground text-center mb-12">
              We currently ship to over 50 countries worldwide. Select your region below to learn more about 
              shipping times, costs, and customs information.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-border hover:bg-secondary transition-colors">
                <h3 className="text-xl font-medium mb-3">North America</h3>
                <p className="text-body text-muted-foreground mb-4">
                  United States, Canada, Mexico
                </p>
                <p className="text-body-small text-muted-foreground">
                  Delivery: 3-7 business days
                </p>
              </div>
              
              <div className="p-6 border border-border hover:bg-secondary transition-colors">
                <h3 className="text-xl font-medium mb-3">Europe</h3>
                <p className="text-body text-muted-foreground mb-4">
                  UK, France, Germany, Italy, Spain, and more
                </p>
                <p className="text-body-small text-muted-foreground">
                  Delivery: 5-10 business days
                </p>
              </div>
              
              <div className="p-6 border border-border hover:bg-secondary transition-colors">
                <h3 className="text-xl font-medium mb-3">Asia Pacific</h3>
                <p className="text-body text-muted-foreground mb-4">
                  Australia, Japan, South Korea, Singapore, Hong Kong
                </p>
                <p className="text-body-small text-muted-foreground">
                  Delivery: 7-14 business days
                </p>
              </div>
              
              <div className="p-6 border border-border hover:bg-secondary transition-colors">
                <h3 className="text-xl font-medium mb-3">Middle East</h3>
                <p className="text-body text-muted-foreground mb-4">
                  UAE, Saudi Arabia, Kuwait, Qatar
                </p>
                <p className="text-body-small text-muted-foreground">
                  Delivery: 7-14 business days
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">HOW IT WORKS</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <ShoppingBag className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">1. Shop</h3>
                <p className="text-body text-muted-foreground">
                  Browse and add items to your cart as usual
                </p>
              </div>
              <div className="text-center">
                <Globe className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">2. Select Country</h3>
                <p className="text-body text-muted-foreground">
                  Choose your shipping destination at checkout
                </p>
              </div>
              <div className="text-center">
                <CreditCard className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">3. Pay</h3>
                <p className="text-body text-muted-foreground">
                  See all costs including duties and taxes upfront
                </p>
              </div>
              <div className="text-center">
                <Truck className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">4. Receive</h3>
                <p className="text-body text-muted-foreground">
                  Track your package and receive it at your door
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Important Information */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">IMPORTANT INFORMATION</h2>
            <div className="space-y-6">
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Duties & Taxes</h3>
                <p className="text-body text-muted-foreground">
                  All duties, taxes, and customs fees are calculated and charged at checkout. You won't face any 
                  surprise charges upon delivery. We believe in transparent pricing, globally.
                </p>
              </div>
              
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Currency</h3>
                <p className="text-body text-muted-foreground">
                  Prices are displayed in USD. Your bank or credit card company will convert the amount to your 
                  local currency at their current exchange rate.
                </p>
              </div>
              
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Returns</h3>
                <p className="text-body text-muted-foreground">
                  International returns are accepted within 30 days. Return shipping costs are the responsibility 
                  of the customer. Duties and taxes are non-refundable.
                </p>
              </div>
              
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Customer Support</h3>
                <p className="text-body text-muted-foreground">
                  Our customer service team is available to help with international orders. Contact us via email 
                  or live chat for assistance in English.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
