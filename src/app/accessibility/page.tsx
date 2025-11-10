import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { Eye, Ear, MessageSquare, CheckCircle } from 'lucide-react';

export default function AccessibilityPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">ACCESSIBILITY</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              We're committed to making cesclair.com accessible to everyone
            </p>
          </div>
        </section>

        {/* Our Commitment */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8">OUR COMMITMENT</h2>
            <p className="text-body-large text-muted-foreground mb-6">
              At Cesclair, we believe that everyone should have equal access to quality fashion and information. 
              We're committed to ensuring our website is accessible to all users, including those with disabilities.
            </p>
            <p className="text-body-large text-muted-foreground">
              We strive to meet or exceed the Web Content Accessibility Guidelines (WCAG) 2.1 Level AA standards 
              and continuously work to improve the accessibility of our digital experiences.
            </p>
          </div>
        </section>

        {/* Accessibility Features */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">ACCESSIBILITY FEATURES</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <Eye className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Visual</h3>
                <p className="text-body text-muted-foreground">
                  High contrast ratios, resizable text, and screen reader compatibility
                </p>
              </div>
              <div className="text-center">
                <Ear className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Auditory</h3>
                <p className="text-body text-muted-foreground">
                  Captions and transcripts for video content
                </p>
              </div>
              <div className="text-center">
                <MessageSquare className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Keyboard Navigation</h3>
                <p className="text-body text-muted-foreground">
                  Full site navigation without a mouse
                </p>
              </div>
              <div className="text-center">
                <CheckCircle className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Clear Language</h3>
                <p className="text-body text-muted-foreground">
                  Simple, consistent language and clear instructions
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Ongoing Efforts */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8">ONGOING EFFORTS</h2>
            <div className="space-y-6">
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Regular Testing</h3>
                <p className="text-body text-muted-foreground">
                  We conduct regular accessibility audits using both automated tools and manual testing with 
                  assistive technologies to identify and address any barriers.
                </p>
              </div>
              
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">Team Training</h3>
                <p className="text-body text-muted-foreground">
                  Our design, development, and content teams receive ongoing training on accessibility best 
                  practices and inclusive design principles.
                </p>
              </div>
              
              <div className="p-6 border border-border">
                <h3 className="text-xl font-medium mb-3">User Feedback</h3>
                <p className="text-body text-muted-foreground">
                  We actively seek and respond to feedback from users with disabilities to understand their 
                  experiences and make necessary improvements.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specifications */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8">TECHNICAL SPECIFICATIONS</h2>
            <div className="p-6 border border-border bg-white">
              <ul className="space-y-3 text-body text-muted-foreground">
                <li>• WCAG 2.1 Level AA compliance</li>
                <li>• Semantic HTML5 markup</li>
                <li>• ARIA labels and landmarks for screen readers</li>
                <li>• Keyboard-accessible interactive elements</li>
                <li>• Focus indicators for keyboard navigation</li>
                <li>• Alternative text for images</li>
                <li>• Responsive design for various devices and screen sizes</li>
                <li>• Compatible with major assistive technologies</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Feedback */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-3xl md:text-4xl font-medium mb-6">SHARE YOUR FEEDBACK</h2>
            <p className="text-body-large text-muted-foreground mb-8">
              If you experience any accessibility barriers on our website or have suggestions for improvement, 
              please let us know. Your feedback helps us create a better experience for everyone.
            </p>
            <div className="space-y-4">
              <p className="text-body">
                <strong>Email:</strong> accessibility@cesclair.com
              </p>
              <p className="text-body">
                <strong>Phone:</strong> 1-888-555-CESC (2372)
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}