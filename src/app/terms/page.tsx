import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function TermsPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Terms of Service</h1>
            <div className="space-y-6 text-body text-secondary-text">
              <p className="text-sm">Last updated: January 2025</p>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Agreement to Terms</h2>
                <p>
                  By accessing or using our website, you agree to be bound by these Terms of Service 
                  and all applicable laws and regulations.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Use License</h2>
                <p>
                  Permission is granted to temporarily download one copy of the materials on Cesclair's 
                  website for personal, non-commercial transitory viewing only.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Disclaimer</h2>
                <p>
                  The materials on Cesclair's website are provided on an 'as is' basis. Cesclair makes 
                  no warranties, expressed or implied.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}