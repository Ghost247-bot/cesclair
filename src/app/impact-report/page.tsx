"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Download, FileText, TrendingUp, Users, Leaf, Factory, Globe } from "lucide-react";
import Footer from "@/components/sections/footer";

export default function ImpactReportPage() {
  return (
    <>
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative h-[60vh] min-h-[400px] flex items-center justify-center bg-gradient-to-b from-primary/10 to-background">
          <div className="absolute inset-0 opacity-5">
            <div className="w-full h-full bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMwMDAiIGZpbGwtb3BhY2l0eT0iMC4wNCI+PHBhdGggZD0iTTM2IDM0VjIyaDEyVjEwSDI0djEySDEydjEySDI0djEySDM2VjM0eiIvPjwvZz48L2c+PC9zdmc+')]"></div>
          </div>
          <div className="relative z-10 text-center px-6 max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full mb-6">
              <FileText className="w-5 h-5 text-primary" />
              <span className="text-body text-primary font-medium">2024 IMPACT REPORT</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium mb-6 tracking-tight">
              OUR COMMITMENT TO TRANSPARENCY
            </h1>
            <p className="text-body-large text-muted-foreground mb-8 max-w-2xl mx-auto">
              See how we're building a more sustainable, ethical, and transparent fashion industry—one product at a time.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="#download"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
              >
                <Download className="w-4 h-4" />
                <span className="text-button-primary">DOWNLOAD FULL REPORT</span>
              </a>
              <Link
                href="/sustainability"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
              >
                <span className="text-button-secondary">LEARN MORE</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Executive Summary */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium mb-8 text-center">EXECUTIVE SUMMARY</h2>
              <div className="prose prose-lg max-w-none text-body-large text-secondary-text space-y-6">
                <p>
                  This report outlines our progress, challenges, and commitments across environmental sustainability, 
                  ethical labor practices, and supply chain transparency. We believe that radical transparency is 
                  the foundation of building trust and driving meaningful change in the fashion industry.
                </p>
                <p>
                  In 2024, we made significant strides in reducing our environmental footprint, improving working 
                  conditions across our supply chain, and providing unprecedented transparency about our operations. 
                  This report details our achievements, acknowledges areas where we can do better, and sets ambitious 
                  goals for the future.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Key Metrics */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-6 md:px-8">
            <h2 className="text-3xl md:text-4xl font-medium text-center mb-16">KEY METRICS AT A GLANCE</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
              <div className="bg-white p-8 rounded-lg text-center border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                  <Leaf className="w-8 h-8 text-green-600" />
                </div>
                <div className="text-4xl md:text-5xl font-medium mb-2">90%</div>
                <p className="text-body text-muted-foreground">Renewable Energy in Supply Chain</p>
                <p className="text-caption text-muted-foreground mt-2">Up from 75% in 2023</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-blue-600" />
                </div>
                <div className="text-4xl md:text-5xl font-medium mb-2">50+</div>
                <p className="text-body text-muted-foreground">Ethical Factories Worldwide</p>
                <p className="text-caption text-muted-foreground mt-2">All audited annually</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-purple-100 rounded-full flex items-center justify-center">
                  <Factory className="w-8 h-8 text-purple-600" />
                </div>
                <div className="text-4xl md:text-5xl font-medium mb-2">95%</div>
                <p className="text-body text-muted-foreground">Recycled Packaging Materials</p>
                <p className="text-caption text-muted-foreground mt-2">Target: 100% by 2025</p>
              </div>
              <div className="bg-white p-8 rounded-lg text-center border border-border">
                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 rounded-full flex items-center justify-center">
                  <Globe className="w-8 h-8 text-orange-600" />
                </div>
                <div className="text-4xl md:text-5xl font-medium mb-2">100%</div>
                <p className="text-body text-muted-foreground">Organic Cotton Usage</p>
                <p className="text-caption text-muted-foreground mt-2">Since 2022</p>
              </div>
            </div>
          </div>
        </section>

        {/* Environmental Impact */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">ENVIRONMENTAL IMPACT</h2>
              
              <div className="space-y-12">
                <div className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <TrendingUp className="w-6 h-6 text-primary flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-medium mb-3">Carbon Footprint Reduction</h3>
                      <p className="text-body text-muted-foreground mb-4">
                        We've reduced our carbon footprint by 35% compared to 2022 through renewable energy adoption, 
                        optimized logistics, and sustainable material sourcing.
                      </p>
                      <div className="grid md:grid-cols-3 gap-4 mt-6">
                        <div className="text-center p-4 bg-secondary rounded">
                          <div className="text-2xl font-medium mb-1">35%</div>
                          <div className="text-caption text-muted-foreground">Reduction since 2022</div>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded">
                          <div className="text-2xl font-medium mb-1">50%</div>
                          <div className="text-caption text-muted-foreground">Target by 2026</div>
                        </div>
                        <div className="text-center p-4 bg-secondary rounded">
                          <div className="text-2xl font-medium mb-1">Net Zero</div>
                          <div className="text-caption text-muted-foreground">Goal by 2030</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <Leaf className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-medium mb-3">Water Conservation</h3>
                      <p className="text-body text-muted-foreground mb-4">
                        Our organic cotton program uses 91% less water than conventional cotton farming. 
                        We've also implemented water recycling systems in 80% of our manufacturing facilities.
                      </p>
                      <ul className="list-disc list-inside space-y-2 text-body text-muted-foreground">
                        <li>91% water reduction in cotton production</li>
                        <li>80% of facilities with water recycling systems</li>
                        <li>Zero wastewater discharge from our primary factories</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-border">
                  <div className="flex items-start gap-4 mb-4">
                    <Factory className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
                    <div>
                      <h3 className="text-xl font-medium mb-3">Waste Reduction</h3>
                      <p className="text-body text-muted-foreground mb-4">
                        We've achieved a 60% reduction in manufacturing waste through improved production processes, 
                        material optimization, and circular design principles.
                      </p>
                      <div className="mt-4">
                        <div className="flex justify-between text-body mb-2">
                          <span>Waste Reduction Progress</span>
                          <span className="font-medium">60%</span>
                        </div>
                        <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                          <div className="bg-primary h-full" style={{ width: '60%' }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Social Impact */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">SOCIAL IMPACT</h2>
              
              <div className="space-y-8">
                <div className="bg-white p-8 rounded-lg border border-border">
                  <h3 className="text-xl font-medium mb-4">Fair Labor Practices</h3>
                  <p className="text-body text-muted-foreground mb-6">
                    All of our factory partners undergo annual third-party audits to ensure compliance with 
                    international labor standards. We're committed to fair wages, safe working conditions, 
                    and workers' rights.
                  </p>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="p-4 bg-secondary rounded">
                      <div className="text-2xl font-medium mb-2">100%</div>
                      <div className="text-body text-muted-foreground">Factories audited annually</div>
                    </div>
                    <div className="p-4 bg-secondary rounded">
                      <div className="text-2xl font-medium mb-2">$15+</div>
                      <div className="text-body text-muted-foreground">Average hourly wage (above local minimum)</div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-8 rounded-lg border border-border">
                  <h3 className="text-xl font-medium mb-4">Community Investment</h3>
                  <p className="text-body text-muted-foreground mb-4">
                    We invest in the communities where we operate through education programs, healthcare initiatives, 
                    and infrastructure development.
                  </p>
                  <ul className="list-disc list-inside space-y-2 text-body text-muted-foreground">
                    <li>$2.5M invested in community programs in 2024</li>
                    <li>15 schools supported in manufacturing regions</li>
                    <li>Healthcare access for 5,000+ workers and families</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Supply Chain Transparency */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">SUPPLY CHAIN TRANSPARENCY</h2>
              
              <div className="bg-white p-8 rounded-lg border border-border">
                <p className="text-body-large text-muted-foreground mb-6">
                  We believe transparency builds trust. That's why we share detailed information about our supply chain, 
                  from raw materials to finished products.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 bg-secondary rounded">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium mb-1">Factory Locations</div>
                      <div className="text-body text-muted-foreground">
                        All factory locations are publicly listed with addresses and audit reports available on our website.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-secondary rounded">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium mb-1">Material Sourcing</div>
                      <div className="text-body text-muted-foreground">
                        We trace materials back to their source and share information about environmental and social impacts.
                      </div>
                    </div>
                  </div>
                  <div className="flex items-start gap-4 p-4 bg-secondary rounded">
                    <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0"></div>
                    <div>
                      <div className="font-medium mb-1">True Cost Breakdown</div>
                      <div className="text-body text-muted-foreground">
                        Every product page shows the true cost breakdown: materials, labor, transportation, and our markup.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Goals for 2025 */}
        <section className="py-16 md:py-24 bg-secondary">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-4xl mx-auto">
              <h2 className="text-3xl md:text-4xl font-medium mb-12 text-center">OUR GOALS FOR 2025</h2>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-3">Environmental</h3>
                  <ul className="space-y-2 text-body text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>100% recycled packaging materials</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>50% carbon footprint reduction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Zero waste to landfill from operations</span>
                    </li>
                  </ul>
                </div>
                <div className="bg-white p-6 rounded-lg border border-border">
                  <h3 className="text-lg font-medium mb-3">Social</h3>
                  <ul className="space-y-2 text-body text-muted-foreground">
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Living wage certification for all factories</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Expand community investment to $3M</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-primary mt-1">•</span>
                      <span>Launch worker education program</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Download Section */}
        <section id="download" className="py-16 md:py-24">
          <div className="container mx-auto px-6 md:px-8">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl md:text-4xl font-medium mb-6">DOWNLOAD THE FULL REPORT</h2>
              <p className="text-body-large text-muted-foreground mb-8">
                Get the complete 2024 Impact Report with detailed data, methodology, and case studies.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="#"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
                  onClick={(e) => {
                    e.preventDefault();
                    // In a real implementation, this would download the PDF
                    alert('Download functionality would be implemented here. This would typically link to a PDF file.');
                  }}
                >
                  <Download className="w-4 h-4" />
                  <span className="text-button-primary">DOWNLOAD PDF (2.5 MB)</span>
                </a>
                <Link
                  href="/sustainability"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-primary hover:text-white transition-colors"
                >
                  <span className="text-button-secondary">BACK TO SUSTAINABILITY</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

