"use client";

import { useState } from 'react';
import { ChevronDown, ChevronUp, Truck, Shield, RefreshCw } from 'lucide-react';

interface ProductDetailsTabsProps {
  description?: string | null;
  category?: string | null;
  materials?: string[];
  careInstructions?: string[];
  fit?: {
    type?: string;
    rise?: string;
    legOpening?: string;
    inseam?: string;
    recommendations?: string[];
  };
}

export default function ProductDetailsTabs({
  description,
  category,
  materials = [],
  careInstructions = [],
  fit
}: ProductDetailsTabsProps) {
  const [activeTab, setActiveTab] = useState('description');
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const tabs = [
    { id: 'description', label: 'Description', icon: null },
    { id: 'fit', label: 'Fit & Sizing', icon: null },
    { id: 'materials', label: 'Materials & Care', icon: null },
    { id: 'shipping', label: 'Shipping & Returns', icon: null }
  ];

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const renderFitSection = () => {
    if (!fit) return null;

    return (
      <div className="space-y-6">
        {fit.type && (
          <div>
            <h4 className="font-medium mb-2">Fit Type</h4>
            <p className="text-gray-600">{fit.type}</p>
          </div>
        )}

        {(fit.rise || fit.legOpening) && (
          <div>
            <h4 className="font-medium mb-3">Measurements</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {fit.rise && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Rise</p>
                  <p className="font-medium">{fit.rise}</p>
                </div>
              )}
              {fit.legOpening && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Leg Opening</p>
                  <p className="font-medium">{fit.legOpening}</p>
                </div>
              )}
              {fit.inseam && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-500 mb-1">Inseam</p>
                  <p className="font-medium">{fit.inseam}</p>
                </div>
              )}
            </div>
          </div>
        )}

        {fit.recommendations && fit.recommendations.length > 0 && (
          <div>
            <h4 className="font-medium mb-3">Size Recommendations</h4>
            <ul className="space-y-2">
              {fit.recommendations.map((rec, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-600">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderMaterialsSection = () => (
    <div className="space-y-6">
      {materials.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Materials</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {materials.map((material, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-600 rounded-full"></div>
                <span className="text-gray-700">{material}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {careInstructions.length > 0 && (
        <div>
          <h4 className="font-medium mb-3">Care Instructions</h4>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <ul className="space-y-2">
              {careInstructions.map((instruction, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-blue-600 mt-1">•</span>
                  <span className="text-gray-700">{instruction}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );

  const renderShippingSection = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <Truck className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <h4 className="font-medium mb-2">Free Shipping</h4>
          <p className="text-sm text-gray-600">On orders over $100</p>
        </div>
        
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <Shield className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <h4 className="font-medium mb-2">Secure Payment</h4>
          <p className="text-sm text-gray-600">SSL encrypted checkout</p>
        </div>
        
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <RefreshCw className="w-8 h-8 text-gray-600 mx-auto mb-3" />
          <h4 className="font-medium mb-2">Easy Returns</h4>
          <p className="text-sm text-gray-600">30-day return policy</p>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="font-medium mb-2">Shipping Information</h4>
          <ul className="space-y-2 text-gray-600">
            <li>• Standard Shipping: 5-7 business days</li>
            <li>• Express Shipping: 2-3 business days</li>
            <li>• Overnight Shipping: Next business day</li>
            <li>• International shipping available</li>
          </ul>
        </div>

        <div>
          <h4 className="font-medium mb-2">Return Policy</h4>
          <ul className="space-y-2 text-gray-600">
            <li>• 30-day return window from delivery date</li>
            <li>• Items must be unworn, unwashed, and in original packaging</li>
            <li>• Free return shipping on defective items</li>
            <li>• Refunds processed within 5-7 business days</li>
          </ul>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'description':
        return (
          <div className="prose prose-gray max-w-none">
            {description ? (
              <p className="text-gray-700 leading-relaxed">{description}</p>
            ) : (
              <p className="text-gray-500">No description available for this product.</p>
            )}
          </div>
        );
      
      case 'fit':
        return renderFitSection();
      
      case 'materials':
        return renderMaterialsSection();
      
      case 'shipping':
        return renderShippingSection();
      
      default:
        return null;
    }
  };

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="min-h-[150px]">
          {renderContent()}
        </div>

        {/* Mobile Accordion (for screens below md) */}
        <div className="md:hidden space-y-3 mt-6">
          {tabs.map((tab) => (
            <div key={tab.id} className="border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleSection(tab.id)}
                className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-gray-50"
              >
                <span className="font-medium">{tab.label}</span>
                {expandedSections[tab.id] ? (
                  <ChevronUp className="w-5 h-5 text-gray-500" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-gray-500" />
                )}
              </button>
              
              {expandedSections[tab.id] && (
                <div className="px-4 pb-4">
                  {renderContent()}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
