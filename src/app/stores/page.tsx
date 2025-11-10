import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function StoresPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Our Stores</h1>
            <div className="space-y-8 text-body-large">
              <p className="text-secondary-text">
                Visit us in person at one of our retail locations across the United States.
              </p>
              <div className="grid gap-6">
                <div className="p-6 border border-border">
                  <h2 className="text-xl font-medium mb-2">San Francisco</h2>
                  <p className="text-secondary-text">123 Market Street<br />San Francisco, CA 94103</p>
                </div>
                <div className="p-6 border border-border">
                  <h2 className="text-xl font-medium mb-2">New York</h2>
                  <p className="text-secondary-text">456 Broadway<br />New York, NY 10013</p>
                </div>
                <div className="p-6 border border-border">
                  <h2 className="text-xl font-medium mb-2">Los Angeles</h2>
                  <p className="text-secondary-text">789 Melrose Avenue<br />Los Angeles, CA 90046</p>
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
