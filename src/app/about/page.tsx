import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function AboutPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">About Cesclair</h1>
            <div className="space-y-6 text-body-large text-secondary-text">
              <p>
                At Cesclair, we want the right choice to be as easy as putting on a great T-shirt. 
                That's why we partner with ethical factories around the world. Source only the finest materials. 
                And share those stories with you—down to the true cost of every product we make.
              </p>
              <p>
                It's a new way of doing things. We call it Radical Transparency.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}