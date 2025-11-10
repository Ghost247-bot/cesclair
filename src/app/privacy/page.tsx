import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';

export default function PrivacyPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        <div className="container mx-auto px-6 md:px-8 py-12 md:py-16">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-medium mb-6">Privacy Policy</h1>
            <div className="space-y-6 text-body text-secondary-text">
              <p className="text-sm">Last updated: January 2025</p>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Introduction</h2>
                <p>
                  At Cesclair, we take your privacy seriously. This Privacy Policy describes how we collect, 
                  use, and protect your personal information.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">Information We Collect</h2>
                <p>
                  We collect information you provide directly to us, such as when you create an account, 
                  make a purchase, or contact customer service.
                </p>
              </div>
              <div>
                <h2 className="text-2xl font-medium text-primary-text mb-3">How We Use Your Information</h2>
                <p>
                  We use the information we collect to process your orders, communicate with you, 
                  and improve our services.
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