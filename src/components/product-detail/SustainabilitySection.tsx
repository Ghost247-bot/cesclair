"use client";

import { Leaf, Factory, Heart, Recycle, Award, Globe } from 'lucide-react';

interface SustainabilitySectionProps {
  materials?: {
    sustainable?: string[];
    recycled?: string[];
    organic?: string[];
  };
  production?: {
    fairTrade?: boolean;
    ethicalLabor?: boolean;
    carbonNeutral?: boolean;
    waterReduction?: number;
  };
  certifications?: Array<{
    name: string;
    description: string;
    icon?: string;
  }>;
  impact?: {
    waterSaved?: string;
    carbonReduced?: string;
    wasteReduced?: string;
  };
}

export default function SustainabilitySection({
  materials,
  production,
  certifications = [],
  impact
}: SustainabilitySectionProps) {
  const defaultCertifications = [
    {
      name: "Fair Trade Certified",
      description: "Ensures fair wages and safe working conditions for workers",
      icon: Award
    },
    {
      name: "GOTS Certified Organic",
      description: "Global Organic Textile Standard for organic fibers",
      icon: Leaf
    },
    {
      name: "B Corporation",
      description: "Certified B Corp meeting high standards of social and environmental performance",
      icon: Globe
    }
  ];

  const displayCertifications = certifications.length > 0 ? certifications : defaultCertifications;

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Sustainability & Ethics</h2>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            We're committed to creating beautiful products that are kind to both people and the planet. 
            Learn more about our sustainable practices and ethical standards.
          </p>
        </div>

        {/* Main Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Leaf className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">Sustainable Materials</h3>
            <p className="text-xs text-gray-600">
              We use eco-friendly materials that reduce environmental impact without compromising quality.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Factory className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">Ethical Production</h3>
            <p className="text-xs text-gray-600">
              Our partners ensure fair wages, safe conditions, and respect for workers' rights.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Recycle className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">Circular Design</h3>
            <p className="text-xs text-gray-600">
              Products designed for longevity, repairability, and eventual recycling.
            </p>
          </div>

          <div className="text-center">
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Heart className="w-6 h-6 text-orange-600" />
            </div>
            <h3 className="font-semibold mb-2 text-sm">Giving Back</h3>
            <p className="text-xs text-gray-600">
              We donate 1% of sales to environmental and social causes.
            </p>
          </div>
        </div>

        {/* Materials Section */}
        {materials && (materials.sustainable?.length || materials.recycled?.length || materials.organic?.length) && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold mb-4">Material Breakdown</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {materials.sustainable && materials.sustainable.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-green-700 text-sm">Sustainable Materials</h4>
                  <ul className="space-y-1">
                    {materials.sustainable.map((material, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                        <span className="text-gray-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materials.recycled && materials.recycled.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-blue-700 text-sm">Recycled Content</h4>
                  <ul className="space-y-1">
                    {materials.recycled.map((material, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        <span className="text-gray-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {materials.organic && materials.organic.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2 text-purple-700 text-sm">Organic Materials</h4>
                  <ul className="space-y-1">
                    {materials.organic.map((material, index) => (
                      <li key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 bg-purple-600 rounded-full"></div>
                        <span className="text-gray-700">{material}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Production Standards */}
        {production && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
            {production.fairTrade && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Fair Trade Certified</h4>
                  <p className="text-gray-600 text-xs">
                    Our manufacturing partners are Fair Trade certified, ensuring workers receive fair wages 
                    and work in safe conditions.
                  </p>
                </div>
              </div>
            )}

            {production.ethicalLabor && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Ethical Labor Practices</h4>
                  <p className="text-gray-600 text-xs">
                    We strictly enforce ethical labor standards and regularly audit our supply chain.
                  </p>
                </div>
              </div>
            )}

            {production.carbonNeutral && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Globe className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Carbon Neutral Shipping</h4>
                  <p className="text-gray-600 text-xs">
                    We offset all carbon emissions from our shipping and production processes.
                  </p>
                </div>
              </div>
            )}

            {production.waterReduction && (
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Recycle className="w-5 h-5 text-cyan-600" />
                </div>
                <div>
                  <h4 className="font-semibold mb-1 text-sm">Water Conservation</h4>
                  <p className="text-gray-600 text-xs">
                    Our production processes use {production.waterReduction}% less water than industry standards.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Call to Action */}
        <div className="text-center mt-8">
          <h3 className="text-lg font-semibold mb-3">Join Our Sustainability Journey</h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
            Learn more about our commitment to sustainability and how you can make a difference with every purchase.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
              Learn More
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              Sustainability Report
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
