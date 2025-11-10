import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductListWithSorting from '@/components/product-list-with-sorting';

export default function WomenPantsPage() {

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">Women's Pants</h1>
            <p className="text-body-large text-secondary-text">From office-ready to off-duty</p>
          </div>

          <ProductListWithSorting category="pants" limit={1000} />
        </div>
      </main>
      <Footer />
    </>
  );
}