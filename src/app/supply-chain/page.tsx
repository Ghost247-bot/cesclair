import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { FileText } from 'lucide-react';

export default function SupplyChainPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <FileText className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-medium mb-6">CA SUPPLY CHAIN TRANSPARENCY</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              California Transparency in Supply Chains Act Disclosure
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-medium mb-6">Our Commitment</h2>
              <p className="text-body text-muted-foreground mb-6">
                Everlane is committed to conducting business ethically and in compliance with all applicable laws. 
                The California Transparency in Supply Chains Act of 2010 (SB 657) requires certain retailers and 
                manufacturers to disclose their efforts to eradicate slavery and human trafficking from their direct supply chains.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Verification</h2>
              <p className="text-body text-muted-foreground mb-6">
                We evaluate and address risks of human trafficking and slavery in our supply chains through our 
                Radical Transparency program. We maintain direct relationships with our factories and visit them 
                regularly to ensure compliance with our standards.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Audits</h2>
              <p className="text-body text-muted-foreground mb-6">
                We conduct audits of our suppliers to evaluate their compliance with company standards for 
                trafficking and slavery in supply chains. These audits are performed by our internal team and 
                third-party organizations.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Certification</h2>
              <p className="text-body text-muted-foreground mb-6">
                We require direct suppliers to certify that materials incorporated into our products comply with 
                the laws regarding slavery and human trafficking of the countries in which they are doing business.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Internal Accountability</h2>
              <p className="text-body text-muted-foreground mb-6">
                We maintain internal accountability standards and procedures for employees and contractors failing 
                to meet company standards regarding slavery and trafficking. Violations of our standards may result 
                in termination of the relationship.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Training</h2>
              <p className="text-body text-muted-foreground mb-6">
                We provide training to our employees and management who have direct responsibility for supply chain 
                management about human trafficking and slavery, particularly with respect to mitigating risks within 
                the supply chains of products.
              </p>

              <h2 className="text-2xl font-medium mb-6 mt-12">Our Standards</h2>
              <p className="text-body text-muted-foreground mb-6">
                All Everlane suppliers must adhere to our Code of Conduct, which includes provisions requiring:
              </p>
              <ul className="list-disc pl-6 space-y-2 text-body text-muted-foreground mb-6">
                <li>Voluntary employment - no forced, bonded, or indentured labor</li>
                <li>Freedom of movement and the right to resign</li>
                <li>No retention of original identification documents</li>
                <li>Compliance with all applicable wage and hour laws</li>
                <li>Safe and healthy working conditions</li>
              </ul>

              <h2 className="text-2xl font-medium mb-6 mt-12">Reporting Concerns</h2>
              <p className="text-body text-muted-foreground mb-6">
                If you have concerns about potential human trafficking or slavery in our supply chain, please contact us at:
              </p>
              <p className="text-body mb-6">
                <strong>Email:</strong> compliance@everlane.com<br />
                <strong>Phone:</strong> 1-888-555-EVER (3837)
              </p>

              <div className="mt-12 p-6 bg-secondary">
                <p className="text-body-small text-muted-foreground">
                  <strong>Last Updated:</strong> January 2025<br />
                  This disclosure is provided in accordance with the California Transparency in Supply Chains Act of 2010.
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
