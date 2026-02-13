import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Us',
  description: 'Learn about Cesclair - our mission, values, and commitment to sustainable fashion. Discover how we create modern, ethical fashion for everyone.',
  keywords: ['about Cesclair', 'sustainable fashion', 'ethical fashion', 'company mission', 'fashion brand'],
  url: '/about',
});

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-black pt-[60px] md:pt-[64px]">
      {/* Hero Section */}
      <div className="relative bg-black py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-serif font-light text-white mb-6 tracking-wide">
            About Cesclair
          </h1>
          <div className="max-w-3xl mx-auto">
            <p className="text-xl md:text-2xl text-gray-300 leading-relaxed font-light italic">
              "Where timeless elegance meets modern sustainability. 
              We believe fashion should be beautiful, ethical, and accessible to all."
            </p>
          </div>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-black mb-8">
              Our Story
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed mb-6 font-serif">
                Founded in 2020, Cesclair emerged from a simple yet profound vision: 
                to create fashion that honors both the planet and the people who make it. 
                Our journey began with a question that continues to guide us today: 
                <span className="italic text-black"> "Can fashion be both beautiful and responsible?"</span>
              </p>
              <p className="text-gray-800 leading-relaxed mb-6 font-serif">
                From our atelier in the heart of the city, we've grown into a global community 
                of designers, artisans, and dreamers who share our commitment to craftsmanship 
                and conscience. Every piece we create tells a story—not just of style, but 
                of purpose, of tradition, and of hope for a more sustainable future.
              </p>
              <p className="text-gray-800 leading-relaxed font-serif">
                Cesclair isn't just a brand; it's a movement. A movement towards slower fashion, 
                towards conscious consumption, towards a world where beauty and responsibility 
                walk hand in hand.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-white text-center mb-16">
              Our Values
            </h2>
            <div className="grid md:grid-cols-3 gap-12">
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-black rounded-full"></div>
                </div>
                <h3 className="text-2xl font-serif font-light text-white mb-4">Sustainability</h3>
                <p className="text-gray-300 leading-relaxed font-serif">
                  Every choice we make is guided by our commitment to the planet. 
                  From materials to manufacturing, we prioritize environmental stewardship.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-black rounded-full"></div>
                </div>
                <h3 className="text-2xl font-serif font-light text-white mb-4">Craftsmanship</h3>
                <p className="text-gray-300 leading-relaxed font-serif">
                  We honor the art of traditional craftsmanship while embracing innovation. 
                  Each piece is created with meticulous attention to detail.
                </p>
              </div>
              <div className="text-center">
                <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-6">
                  <div className="w-12 h-12 bg-black rounded-full"></div>
                </div>
                <h3 className="text-2xl font-serif font-light text-white mb-4">Inclusivity</h3>
                <p className="text-gray-300 leading-relaxed font-serif">
                  Fashion should be for everyone. We celebrate diversity in all its forms 
                  and create pieces that empower individuals to express their authentic selves.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Mission Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-black mb-8">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-800 leading-relaxed mb-6 font-serif text-lg">
                To redefine fashion by creating timeless pieces that honor both 
                the planet and the people who make them. We believe that true luxury 
                lies not in excess, but in intention, quality, and purpose.
              </p>
              <p className="text-gray-800 leading-relaxed font-serif text-lg">
                Every Cesclair piece is a testament to our belief that fashion can be 
                both beautiful and responsible, both contemporary and timeless, 
                both personal and universal.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-black">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-serif font-light text-white mb-8">
            Join Our Movement
          </h2>
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto font-serif">
            Discover pieces that align with your values and express your unique style. 
            Together, we're creating a more sustainable and inclusive fashion future.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/products"
              className="inline-block px-8 py-4 bg-white text-black font-serif tracking-wide hover:bg-gray-100 transition-colors"
            >
              Explore Collection
            </a>
            <a
              href="/cesworld"
              className="inline-block px-8 py-4 border border-white text-white font-serif tracking-wide hover:bg-white hover:text-black transition-colors"
            >
              Join Cesworld
            </a>
          </div>
        </div>
      </section>

      {/* Our Craftsmanship */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-4xl md:text-5xl font-serif font-light text-black text-center mb-16">
              The Art of Craftsmanship
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <p className="text-gray-700 leading-relaxed mb-6 font-serif text-lg">
                  In an age of mass production, we celebrate the human touch. Our artisans 
                  bring decades of experience to every piece they create, combining traditional 
                  techniques with innovative design.
                </p>
                <p className="text-gray-700 leading-relaxed mb-6 font-serif text-lg">
                  From the careful selection of fabrics to the final stitch, every step 
                  in our process is infused with intention and care. We work with materials 
                  that feel as good as they look—soft organic cotton, flowing silks, warm 
                  wools that tell their own story of origin and craft.
                </p>
                <p className="text-gray-700 leading-relaxed font-serif text-lg">
                  This dedication to craftsmanship means your Cesclair pieces won't just 
                  look beautiful—they'll feel beautiful, wear beautifully, and age beautifully, 
                  becoming more cherished with each passing year.
                </p>
              </div>
              <div className="bg-gray-100 rounded-lg p-8 text-center">
                <div className="space-y-4">
                  <div className="w-16 h-16 bg-gray-300 rounded-full mx-auto"></div>
                  <p className="text-gray-600 italic font-serif">
                    "Fashion is not something that exists in dresses only. 
                    Fashion is in the sky, in the street, fashion has to do with ideas, 
                    the way we live, what is happening."
                  </p>
                  <p className="text-gray-500 text-sm font-serif">— Coco Chanel</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Our Impact */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 text-center mb-16">
            Our Impact
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 max-w-6xl mx-auto text-center">
            <div>
              <div className="text-4xl font-serif font-light text-gray-900 mb-2">50K+</div>
              <p className="text-gray-600 font-serif">Artisans Empowered</p>
            </div>
            <div>
              <div className="text-4xl font-serif font-light text-gray-900 mb-2">2M+</div>
              <p className="text-gray-600 font-serif">Pieces Created</p>
            </div>
            <div>
              <div className="text-4xl font-serif font-light text-gray-900 mb-2">80%</div>
              <p className="text-gray-600 font-serif">Sustainable Materials</p>
            </div>
            <div>
              <div className="text-4xl font-serif font-light text-gray-900 mb-2">0</div>
              <p className="text-gray-600 font-serif">Carbon Footprint</p>
            </div>
          </div>
        </div>
      </section>

      {/* Join Our Movement */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-serif font-light text-gray-900 mb-8">
            Join Our Movement
          </h2>
          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl text-gray-600 leading-relaxed font-serif italic">
              Fashion is more than what we wear—it's how we choose to live. 
              Together, we can create a future where style and sustainability walk hand in hand.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="px-8 py-4 bg-gray-900 text-white font-serif tracking-wide hover:bg-gray-800 transition-colors">
              Explore Our Collection
            </button>
            <button className="px-8 py-4 border-2 border-gray-900 text-gray-900 font-serif tracking-wide hover:bg-gray-900 hover:text-white transition-colors">
              Learn Our Practices
            </button>
          </div>
        </div>
      </section>

      {/* Footer Quote */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <blockquote className="max-w-3xl mx-auto">
            <p className="text-2xl md:text-3xl font-serif font-light text-gray-900 italic leading-relaxed mb-6">
              "In a world of fast fashion, we choose to be slow. 
              In a world of disposable culture, we choose to create things that last. 
              In a world of trends, we choose to be timeless."
            </p>
            <p className="text-gray-600 font-serif">— The Cesclair Manifesto</p>
          </blockquote>
        </div>
      </section>
    </div>
  );
}
