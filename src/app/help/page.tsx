import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import Link from 'next/link';

export default function HelpPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-8">Help Center</h1>
            <div className="space-y-8">
              <div>
                <h2 className="text-2xl font-medium mb-4">Frequently Asked Questions</h2>
                <div className="space-y-4">
                  <Link href="/shipping" className="block p-4 border border-border hover:bg-secondary transition-colors">
                    <h3 className="font-medium mb-1">Shipping Information</h3>
                    <p className="text-sm text-secondary-text">Learn about our shipping options and delivery times</p>
                  </Link>
                  <Link href="/returns" className="block p-4 border border-border hover:bg-secondary transition-colors">
                    <h3 className="font-medium mb-1">Returns & Exchanges</h3>
                    <p className="text-sm text-secondary-text">Our hassle-free return policy</p>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
