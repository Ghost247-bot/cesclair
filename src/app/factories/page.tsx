import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function FactoriesPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Our Factories</h1>
            <div className="space-y-6 text-body-large text-secondary-text">
              <p>
                We believe in exceptional quality, ethical factories, and radical transparency. 
                That's why we share the true cost and origin of every product we make.
              </p>
              <p>
                Learn about the factories where we make our clothes and the people behind them.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
