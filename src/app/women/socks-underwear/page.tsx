import { ArrowRight } from 'lucide-react';

export default function WomenSocksUnderwearPage() {
  return (
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      {/* Hero Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-medium mb-6">SOCKS & UNDERWEAR</h1>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Premium basics designed for everyday comfort
          </p>
        </div>
      </section>

      {/* Coming Soon Content */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto text-center">
          <div className="max-w-xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-medium mb-4">COMING SOON</h2>
            <p className="text-body text-muted-foreground mb-8">
              We're developing our essentials collection with the same quality and transparency you expect from Cesclair.
            </p>
            <a
              href="/women/basics"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
            >
              <span className="text-button-primary">SHOP BASICS</span>
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}