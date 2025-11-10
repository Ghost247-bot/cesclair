import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function ReturnsPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Return Policy</h1>
            <div className="space-y-6 text-body-large text-secondary-text">
              <p>
                We want you to be completely satisfied with your purchase. If you're not, we're here to help.
              </p>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Returns</h2>
                <p>
                  You have 30 days from the date of delivery to return your items for a full refund or exchange.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">How to Return</h2>
                <ol className="list-decimal list-inside space-y-2">
                  <li>Log into your account and start a return</li>
                  <li>Print your prepaid return label</li>
                  <li>Pack your items securely</li>
                  <li>Drop off at any authorized location</li>
                </ol>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
