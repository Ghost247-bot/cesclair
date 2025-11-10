import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import Footer from "@/components/sections/footer";

export default function NoFailOutfitsPage() {
  const outfits = [
    {
      id: 1,
      title: 'The Weekend Essential',
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/415060f1_ee5b-13.jpg',
      description: 'Track jacket and wide-leg pants for effortless style.',
      items: ['The Track Jacket', 'The Wide-Leg Pant', 'The Day Crossbody'],
    },
    {
      id: 2,
      title: 'The Work Edit',
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/53a91526_0f42-9.jpg',
      description: 'Polished separates that transition seamlessly from office to dinner.',
      items: ['The Cashmere Crew', 'The Tailored Trouser', 'The Day Boot'],
    },
    {
      id: 3,
      title: 'The Date Night Look',
      image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/5cde1622_bc63-14.jpg',
      description: 'Elevated basics for those special evenings.',
      items: ['The Cozy Fleece', 'The Modern Jean', 'The Italian Leather Bag'],
    },
  ];

  return (
    <>
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      {/* Hero */}
      <div className="border-b border-border">
        <div className="container mx-auto py-16 md:py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-medium mb-4 tracking-tight">No-Fail Outfits</h1>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
            Curated combinations that take the guesswork out of getting dressed. 
            These tried-and-true pairings work for any occasion.
          </p>
        </div>
      </div>

      {/* Outfits Grid */}
      <div className="container mx-auto py-12 md:py-16">
        <div className="space-y-16 md:space-y-24">
          {outfits.map((outfit, index) => (
            <div
              key={outfit.id}
              className={`grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center ${
                index % 2 === 1 ? 'md:grid-flow-dense' : ''
              }`}
            >
              {/* Image */}
              <div className={`relative aspect-[3/4] ${index % 2 === 1 ? 'md:col-start-2' : ''}`}>
                <Image
                  src={outfit.image}
                  alt={outfit.title}
                  fill
                  className="object-cover"
                />
              </div>

              {/* Content */}
              <div className={`space-y-6 ${index % 2 === 1 ? 'md:col-start-1 md:row-start-1' : ''}`}>
                <div>
                  <h2 className="text-3xl md:text-4xl font-medium mb-3">{outfit.title}</h2>
                  <p className="text-body-large text-muted-foreground">{outfit.description}</p>
                </div>

                <div>
                  <h3 className="text-navigation mb-3">FEATURED ITEMS</h3>
                  <ul className="space-y-2">
                    {outfit.items.map((item, i) => (
                      <li key={i} className="text-body flex items-center">
                        <span className="w-1.5 h-1.5 bg-foreground rounded-full mr-3" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  href="/women/new-arrivals"
                  className="inline-flex items-center gap-2 text-body underline hover:no-underline"
                >
                  Shop the Look
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-secondary py-16 md:py-20">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-medium mb-4">Ready to Build Your Wardrobe?</h2>
          <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto">
            Explore our full collection of versatile essentials designed to mix and match effortlessly.
          </p>
          <Link
            href="/women/new-arrivals"
            className="inline-block bg-primary text-primary-foreground px-8 py-4 text-navigation hover:bg-primary/90 transition-colors"
          >
            SHOP ALL
          </Link>
        </div>
      </div>
    </main>
    <Footer />
    </>
  );
}
