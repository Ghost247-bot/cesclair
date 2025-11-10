import HeaderNavigation from '@/components/sections/header-navigation';
import Footer from '@/components/sections/footer';
import { Package, Users, ShoppingCart, Truck } from 'lucide-react';

export default function BulkOrdersPage() {
  return (
    <>
      <HeaderNavigation />
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
        {/* Hero Section */}
        <section className="bg-secondary py-16 md:py-24">
          <div className="container mx-auto text-center">
            <Package className="w-16 h-16 mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-medium mb-6">BULK ORDERS</h1>
            <p className="text-body-large text-muted-foreground max-w-2xl mx-auto">
              Premium quality at scale for corporate gifts, events, and team outfitting
            </p>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">WHY CHOOSE BULK ORDERS?</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Volume Discounts</h3>
                <p className="text-body text-muted-foreground">
                  Special pricing for orders of 25+ items
                </p>
              </div>
              <div className="text-center">
                <Users className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Dedicated Support</h3>
                <p className="text-body text-muted-foreground">
                  Personal account manager to assist with your order
                </p>
              </div>
              <div className="text-center">
                <Package className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Custom Packaging</h3>
                <p className="text-body text-muted-foreground">
                  Branded packaging options available
                </p>
              </div>
              <div className="text-center">
                <Truck className="w-12 h-12 mx-auto mb-4" />
                <h3 className="text-xl font-medium mb-3">Flexible Shipping</h3>
                <p className="text-body text-muted-foreground">
                  Single or multiple delivery addresses
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Use Cases */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">PERFECT FOR</h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div className="p-6 border border-border bg-white">
                <h3 className="text-xl font-medium mb-3">Corporate Gifts</h3>
                <p className="text-body text-muted-foreground">
                  Premium, sustainable gifts for employees, clients, and partners that reflect your company values
                </p>
              </div>
              <div className="p-6 border border-border bg-white">
                <h3 className="text-xl font-medium mb-3">Team Outfitting</h3>
                <p className="text-body text-muted-foreground">
                  Uniform or cohesive team apparel for retail stores, offices, or events
                </p>
              </div>
              <div className="p-6 border border-border bg-white">
                <h3 className="text-xl font-medium mb-3">Event Merchandise</h3>
                <p className="text-body text-muted-foreground">
                  High-quality branded merchandise for conferences, retreats, and special events
                </p>
              </div>
              <div className="p-6 border border-border bg-white">
                <h3 className="text-xl font-medium mb-3">Hospitality Programs</h3>
                <p className="text-body text-muted-foreground">
                  Premium amenities and uniforms for hotels, restaurants, and service businesses
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto max-w-4xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">HOW IT WORKS</h2>
            <div className="space-y-8">
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                  1
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Submit an Inquiry</h3>
                  <p className="text-body text-muted-foreground">
                    Fill out the form below with your requirements, including quantity, products, and timeline
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                  2
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Receive a Quote</h3>
                  <p className="text-body text-muted-foreground">
                    Our bulk orders team will review your request and provide a customized quote within 2 business days
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                  3
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Finalize Details</h3>
                  <p className="text-body text-muted-foreground">
                    Work with your account manager to confirm products, sizes, customization, and delivery details
                  </p>
                </div>
              </div>
              
              <div className="flex gap-6">
                <div className="flex-shrink-0 w-12 h-12 bg-primary text-white rounded-full flex items-center justify-center font-medium">
                  4
                </div>
                <div>
                  <h3 className="text-xl font-medium mb-2">Place Your Order</h3>
                  <p className="text-body text-muted-foreground">
                    Once everything is confirmed, place your order and we'll take care of the rest
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto max-w-2xl">
            <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">GET STARTED</h2>
            <div className="p-8 border border-border bg-white">
              <form className="space-y-6">
                <div>
                  <label htmlFor="companyName" className="block text-label mb-2">
                    COMPANY NAME
                  </label>
                  <input
                    id="companyName"
                    type="text"
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
                
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="contactName" className="block text-label mb-2">
                      CONTACT NAME
                    </label>
                    <input
                      id="contactName"
                      type="text"
                      required
                      className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-label mb-2">
                      EMAIL
                    </label>
                    <input
                      id="email"
                      type="email"
                      required
                      className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                    />
                  </div>
                </div>
                
                <div>
                  <label htmlFor="quantity" className="block text-label mb-2">
                    ESTIMATED QUANTITY
                  </label>
                  <select
                    id="quantity"
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Select quantity range</option>
                    <option value="25-50">25-50 items</option>
                    <option value="51-100">51-100 items</option>
                    <option value="101-250">101-250 items</option>
                    <option value="251-500">251-500 items</option>
                    <option value="500+">500+ items</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="message" className="block text-label mb-2">
                    PROJECT DETAILS
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    required
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                    placeholder="Tell us about your project, timeline, and any specific requirements..."
                  />
                </div>
                
                <button
                  type="submit"
                  className="w-full bg-primary text-white py-4 px-6 hover:bg-primary/90 transition-colors"
                >
                  <span className="text-button-primary">SUBMIT INQUIRY</span>
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
