import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import ProductCard from '@/components/product-card';
import { products } from '@/lib/products';

export default function WomenDressesPage() {
  const dresses = products.filter(p => p.gender === 'women' && p.category === 'sweaters').slice(0, 8);

  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="mb-12">
            <h1 className="text-4xl md:text-5xl font-medium mb-4">Women's Dresses & Skirts</h1>
            <p className="text-body-large text-secondary-text">Effortless elegance for every occasion</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {dresses.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                image={product.image}
                colors={product.colors}
                href={`/products/${product.id}`}
              />
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
