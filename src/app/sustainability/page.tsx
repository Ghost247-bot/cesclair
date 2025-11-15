import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import Footer from "@/components/sections/footer";
import { normalizeImagePath } from "@/lib/utils";

export default function Sustainability() {
  return (
    <>
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center">
        <Image
          src={normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-everlane-com/assets/images/68ee3c4b_56f2-15.jpg")}
          alt="Sustainability"
          fill
          className="object-cover"
          unoptimized
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/40" />
        <div className="relative z-10 text-center text-white px-6">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight max-w-4xl mx-auto">
            SUSTAINABILITY LOOKS BETTER WITH RECEIPTS. HERE'S OURS.
          </h1>
          <Link
            href="/impact-report"
            className="inline-flex items-center gap-2 text-body-large hover:opacity-80 transition-opacity underline"
          >
            READ OUR LATEST IMPACT REPORT
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Our Commitments */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">OUR COMMITMENTS</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
                1
              </div>
              <h3 className="text-xl font-medium mb-4">Transparent Pricing</h3>
              <p className="text-body text-muted-foreground">
                We break down the true cost of our products, from materials to labor to transportation.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
                2
              </div>
              <h3 className="text-xl font-medium mb-4">Ethical Factories</h3>
              <p className="text-body text-muted-foreground">
                We partner with the world's best factories and share their stories.
              </p>
            </div>
            <div className="text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-primary flex items-center justify-center text-white text-2xl font-medium">
                3
              </div>
              <h3 className="text-xl font-medium mb-4">Quality Materials</h3>
              <p className="text-body text-muted-foreground">
                We use premium, sustainable materials and make products built to last.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Impact Numbers */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">OUR IMPACT BY THE NUMBERS</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl md:text-6xl font-medium mb-2">90%</div>
              <p className="text-body text-muted-foreground">Renewable electricity in our supply chain</p>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-medium mb-2">95%</div>
              <p className="text-body text-muted-foreground">Packaging made from recycled materials</p>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-medium mb-2">100%</div>
              <p className="text-body text-muted-foreground">Cotton is organically grown</p>
            </div>
            <div>
              <div className="text-5xl md:text-6xl font-medium mb-2">50+</div>
              <p className="text-body text-muted-foreground">Ethical factories worldwide</p>
            </div>
          </div>
        </div>
      </section>

      {/* Materials Section */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto">
          <h2 className="text-3xl md:text-4xl font-medium text-center mb-12">SUSTAINABLE MATERIALS</h2>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Organic Cotton</h3>
              <p className="text-body text-muted-foreground mb-4">
                100% of our cotton is organically grown without harmful pesticides, using 91% less water than conventional cotton.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Recycled Materials</h3>
              <p className="text-body text-muted-foreground mb-4">
                We use recycled polyester, nylon, and cashmere to give materials a second life and reduce waste.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Responsible Wool</h3>
              <p className="text-body text-muted-foreground mb-4">
                Our wool comes from farms that prioritize animal welfare and land management.
              </p>
            </div>
            <div className="bg-white p-8 rounded-lg">
              <h3 className="text-xl font-medium mb-4">Premium Leather</h3>
              <p className="text-body text-muted-foreground mb-4">
                We source leather from Gold or Silver-rated tanneries that meet strict environmental standards.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-medium mb-6">Learn More About Our Journey</h2>
          <p className="text-body-large text-muted-foreground mb-8">
            Read our full impact report to see how we're working towards a more sustainable future.
          </p>
          <Link
            href="/impact-report"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">VIEW IMPACT REPORT</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
