import ProductListWithSorting from '@/components/product-list-with-sorting';

export default function WomenNewArrivalsPage() {
  return (
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-medium mb-4">Women's New Arrivals</h1>
          <p className="text-body-large text-secondary-text">Discover the latest styles</p>
        </div>

        <ProductListWithSorting limit={1000} sortBy="newest" />
      </div>
    </main>
  );
}