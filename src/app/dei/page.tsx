import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { Users, Heart, Target, Award } from 'lucide-react';

export default function DEIPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">DIVERSITY, EQUITY & INCLUSION</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Building a culture where everyone belongs, feels valued, and can thrive
            </p>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">OUR COMMITMENT</h2>
            <p className="text-body-large text-muted-foreground mb-6">
              At Everlane, we believe that diversity, equity, and inclusion are essential to our mission of Radical Transparency. 
              We're committed to creating a workplace where every person can bring their authentic self to work and contribute to our collective success.
            </p>
            <p className="text-body-large text-muted-foreground">
              We recognize that building an inclusive culture is an ongoing journey that requires continuous learning, listening, and action. 
              We're dedicated to making meaningful progress every day.
            </p>
          </div>
        </section>

        {/* Focus Areas */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium mb-16 text-center">OUR FOCUS AREAS</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Representation</h3>
                <p className="text-body text-muted-foreground">
                  Building diverse teams at all levels of our organization
                </p>
              </div>
              <div className="text-center">
                <Heart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Inclusion</h3>
                <p className="text-body text-muted-foreground">
                  Creating spaces where everyone feels heard and valued
                </p>
              </div>
              <div className="text-center">
                <Target className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Equity</h3>
                <p className="text-body text-muted-foreground">
                  Ensuring fair treatment and access to opportunities
                </p>
              </div>
              <div className="text-center">
                <Award className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Accountability</h3>
                <p className="text-body text-muted-foreground">
                  Measuring progress and holding ourselves accountable
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Our Progress */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">OUR PROGRESS</h2>
            <div className="space-y-8">
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">2024 Initiatives</h3>
                <ul className="space-y-2 text-body text-muted-foreground">
                  <li>• Expanded employee resource groups (ERGs) to support underrepresented communities</li>
                  <li>• Implemented inclusive hiring practices and unconscious bias training</li>
                  <li>• Increased supplier diversity and partnered with minority-owned businesses</li>
                  <li>• Enhanced parental leave and family support benefits</li>
                </ul>
              </div>
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Looking Ahead</h3>
                <p className="text-body text-muted-foreground">
                  We're committed to publishing annual DEI reports, setting measurable goals, and continuously improving our practices. 
                  This work is never done, and we're dedicated to the journey.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
