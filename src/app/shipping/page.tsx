import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function ShippingPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Shipping Information</h1>
            <div className="space-y-6 text-body-large text-secondary-text">
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Standard Shipping</h2>
                <p>Free on orders over $125. Delivery in 5-8 business days.</p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Express Shipping</h2>
                <p>$15 flat rate. Delivery in 2-3 business days.</p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Next Day</h2>
                <p>$25 flat rate. Order by 12pm PT for next day delivery (Monday-Thursday only).</p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
