import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { ArrowRight, Users, TrendingUp, Heart, Briefcase } from 'lucide-react';

export default function CareersPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">CAREERS AT CESCLAIR</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-8">
              Join our mission to prove that transparency and quality can coexist in fashion
            </p>
            <button className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors">
              <span className="text-button-primary">VIEW OPEN POSITIONS</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>

        {/* Why Everlane */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">WHY CESCLAIR?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Great Team</h3>
                <p className="text-body text-muted-foreground">
                  Work with passionate, talented people who care about making a difference
                </p>
              </div>
              <div className="text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Growth</h3>
                <p className="text-body text-muted-foreground">
                  Continuous learning opportunities and career development programs
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Purpose</h3>
                <p className="text-body text-muted-foreground">
                  Be part of building a more sustainable and transparent fashion industry
                </p>
              </div>
              <div className="text-center">
                <Briefcase className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Benefits</h3>
                <p className="text-body text-muted-foreground">
                  Competitive compensation, health coverage, and generous employee discounts
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Open Positions */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-12">OPEN POSITIONS</h2>
            <div className="max-w-3xl mx-auto">
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-2xl font-medium mb-4">No Open Positions</h3>
                <p className="text-body text-muted-foreground mb-8">
                  We don't have any open positions at the moment, but we're always looking for great talent. 
                  Check back soon or follow us on LinkedIn for updates.
                </p>
                <button className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-white transition-colors">
                  <span className="text-button-primary">FOLLOW ON LINKEDIN</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Life at Everlane */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">LIFE AT CESCLAIR</h2>
            <div className="space-y-6">
              <p className="text-body-large text-muted-foreground">
                Our team is made up of designers, engineers, marketers, and operations experts who share a passion for 
                creating quality products responsibly. We value creativity, collaboration, and continuous improvement.
              </p>
              <p className="text-body-large text-muted-foreground">
                Whether you're in our San Francisco headquarters or working remotely, you'll be part of a culture that 
                celebrates transparency, innovation, and making fashion better for everyone.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}