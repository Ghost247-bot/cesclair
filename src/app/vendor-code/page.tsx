import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { Shield } from 'lucide-react';

export default function VendorCodePage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <Shield className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-medium mb-6">VENDOR CODE OF CONDUCT</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Standards and expectations for all Everlane suppliers and partners
            </p>
          </div>
        </section>

        {/* Introduction */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-medium mb-6">Introduction</h2>
            <p className="text-body text-muted-foreground mb-6">
              At Everlane, we believe in Radical Transparency and ethical business practices throughout our entire 
              supply chain. This Vendor Code of Conduct outlines the minimum standards we expect from all suppliers, 
              manufacturers, and business partners who work with us.
            </p>
            <p className="text-body text-muted-foreground mb-6">
              All vendors must comply with this Code as well as all applicable laws and regulations. We reserve the 
              right to terminate relationships with any vendor that fails to meet these standards.
            </p>
          </div>
        </section>

        {/* Code Sections */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-4xl space-y-12">
            {/* Labor Standards */}
            <div>
              <h2 className="text-2xl font-medium mb-6">1. Labor Standards</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Voluntary Employment:</strong> All work must be voluntary. No forced, bonded, indentured, or involuntary prison labor.</p>
                <p><strong>Child Labor:</strong> No workers under the age of 15, or under the age for completing compulsory education, whichever is higher.</p>
                <p><strong>Working Hours:</strong> Comply with all applicable laws regarding working hours. Regular workweek should not exceed 48 hours, with at least one day off per seven-day period.</p>
                <p><strong>Wages & Benefits:</strong> Provide compensation that meets or exceeds legal minimums and industry standards. Provide all legally mandated benefits.</p>
              </div>
            </div>

            {/* Health & Safety */}
            <div>
              <h2 className="text-2xl font-medium mb-6">2. Health & Safety</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Safe Working Environment:</strong> Provide a safe and healthy working environment. Take adequate steps to prevent accidents and injury.</p>
                <p><strong>Emergency Preparedness:</strong> Establish emergency procedures, provide appropriate training, and maintain clear evacuation routes.</p>
                <p><strong>Sanitation:</strong> Provide clean toilet facilities, potable water, and appropriate facilities for food storage.</p>
                <p><strong>Protective Equipment:</strong> Provide appropriate personal protective equipment and training for its use.</p>
              </div>
            </div>

            {/* Non-Discrimination */}
            <div>
              <h2 className="text-2xl font-medium mb-6">3. Non-Discrimination</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Equal Opportunity:</strong> No discrimination based on race, color, religion, gender, age, disability, sexual orientation, nationality, political opinion, social group, or ethnic origin.</p>
                <p><strong>Harassment-Free:</strong> Maintain a workplace free from harassment, abuse, or corporal punishment.</p>
                <p><strong>Fair Treatment:</strong> Treat all workers with dignity and respect.</p>
              </div>
            </div>

            {/* Environmental Responsibility */}
            <div>
              <h2 className="text-2xl font-medium mb-6">4. Environmental Responsibility</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Environmental Compliance:</strong> Comply with all applicable environmental laws and regulations.</p>
                <p><strong>Resource Conservation:</strong> Implement practices to reduce waste, conserve energy, and minimize environmental impact.</p>
                <p><strong>Hazardous Materials:</strong> Properly handle, store, and dispose of hazardous materials according to applicable regulations.</p>
              </div>
            </div>

            {/* Ethical Business Practices */}
            <div>
              <h2 className="text-2xl font-medium mb-6">5. Ethical Business Practices</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Anti-Corruption:</strong> Conduct business with integrity. No bribery, corruption, or unethical business practices.</p>
                <p><strong>Fair Competition:</strong> Comply with all applicable competition and antitrust laws.</p>
                <p><strong>Intellectual Property:</strong> Respect intellectual property rights and maintain confidentiality.</p>
                <p><strong>Transparency:</strong> Maintain accurate records and provide Everlane with access for verification and auditing purposes.</p>
              </div>
            </div>

            {/* Subcontracting */}
            <div>
              <h2 className="text-2xl font-medium mb-6">6. Subcontracting</h2>
              <div className="space-y-4 text-body text-muted-foreground">
                <p><strong>Prior Approval:</strong> No subcontracting without prior written approval from Everlane.</p>
                <p><strong>Code Compliance:</strong> Ensure all subcontractors comply with this Code of Conduct.</p>
                <p><strong>Monitoring:</strong> Monitor subcontractor compliance and provide documentation upon request.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Monitoring & Compliance */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-2xl font-medium mb-6">Monitoring & Compliance</h2>
            <div className="space-y-6">
              <p className="text-body text-muted-foreground">
                Everlane reserves the right to monitor compliance with this Code through announced and unannounced 
                audits, site visits, and worker interviews. Vendors must provide full access to facilities, 
                documentation, and personnel.
              </p>
              <p className="text-body text-muted-foreground">
                Non-compliance with this Code may result in the requirement for corrective action, probationary 
                status, or termination of the business relationship.
              </p>
            </div>

            <div className="mt-12 p-6 border border-border">
              <h3 className="text-xl font-medium mb-4">Reporting Violations</h3>
              <p className="text-body text-muted-foreground mb-4">
                If you become aware of any violations of this Code of Conduct, please report them immediately:
              </p>
              <p className="text-body">
                <strong>Email:</strong> compliance@everlane.com<br />
                <strong>Phone:</strong> 1-888-555-EVER (3837)
              </p>
              <p className="text-body-small text-muted-foreground mt-4">
                All reports will be treated confidentially and no retaliation will be tolerated.
              </p>
            </div>

            <div className="mt-8 p-6 bg-secondary">
              <p className="text-body-small text-muted-foreground">
                <strong>Last Updated:</strong> January 2025<br />
                This Code of Conduct is subject to periodic review and may be updated to reflect evolving standards and best practices.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
