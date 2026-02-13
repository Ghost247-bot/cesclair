"use client";

import { useState, useEffect } from 'react';
import ProductCard from '@/components/product-card';
import { Sparkles, ShoppingBag, ArrowRight } from 'lucide-react';

interface CompleteTheLookItem {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  slug: string;
  originalPrice?: number;
  isOnSale?: boolean;
  stock?: number;
  rating?: number;
  reviewCount?: number;
}

interface CompleteTheLookProps {
  currentProductId: string;
  category?: string;
  style?: string;
}

export default function CompleteTheLook({ 
  currentProductId, 
  category, 
  style = "casual" 
}: CompleteTheLookProps) {
  const [recommendations, setRecommendations] = useState<CompleteTheLookItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  useEffect(() => {
    fetchRecommendations();
  }, [currentProductId, category, style]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        excludeId: currentProductId,
        category: category || '',
        style,
        limit: '8',
      });
      
      const response = await fetch(`/api/products/complete-look?${params}`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data);
      }
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleItemSelection = (itemId: string) => {
    setSelectedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const calculateTotalPrice = () => {
    return recommendations
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.price, 0);
  };

  const calculateOriginalTotal = () => {
    return recommendations
      .filter(item => selectedItems.includes(item.id))
      .reduce((total, item) => total + (item.originalPrice || item.price), 0);
  };

  const getTotalSavings = () => {
    const originalTotal = calculateOriginalTotal();
    const currentTotal = calculateTotalPrice();
    return originalTotal - currentTotal;
  };

  if (loading) {
    return (
      <div className="py-12 border-t border-gray-200">
        <div className="container mx-auto px-4">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="space-y-3">
                  <div className="aspect-[3/4] bg-gray-200 rounded-lg"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <div className="py-8 border-t border-gray-200">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-5 h-5 text-yellow-500" />
            <h2 className="text-xl font-bold">Complete the Look</h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto text-sm">
            Discover perfectly paired pieces that complement your style. 
            Mix and match to create your perfect outfit.
          </p>
        </div>

        {/* Style Categories */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {['casual', 'formal', 'business', 'weekend', 'evening'].map((styleOption) => (
            <button
              key={styleOption}
              onClick={() => {
                // In a real app, this would refetch with the new style
                console.log(`Switch to ${styleOption} style`);
              }}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                style === styleOption
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {styleOption.charAt(0).toUpperCase() + styleOption.slice(1)}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {recommendations.map((item) => (
            <div key={item.id} className="relative group">
              {/* Selection Checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <button
                  onClick={() => toggleItemSelection(item.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${
                    selectedItems.includes(item.id)
                      ? 'bg-black border-black'
                      : 'bg-white border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {selectedItems.includes(item.id) && (
                    <svg className="w-3 h-3 text-white mx-auto" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  )}
                </button>
              </div>

              {/* Product Card */}
              <div className={`${selectedItems.includes(item.id) ? 'ring-2 ring-black ring-offset-2 rounded-lg' : ''}`}>
                <ProductCard
                  id={item.id}
                  name={item.name}
                  price={item.price}
                  image={item.image}
                  href={`/products/${item.slug}`}
                  originalPrice={item.originalPrice}
                  isOnSale={item.isOnSale}
                  stock={item.stock}
                  rating={item.rating}
                  reviewCount={item.reviewCount}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Selected Items Summary */}
        {selectedItems.length > 0 && (
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold">
                Selected Items ({selectedItems.length})
              </h3>
              <button
                onClick={() => setSelectedItems([])}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Clear All
              </button>
            </div>

            <div className="space-y-1 mb-3">
              {recommendations
                .filter(item => selectedItems.includes(item.id))
                .map((item) => (
                  <div key={item.id} className="flex items-center justify-between text-sm">
                    <span className="text-gray-700">{item.name}</span>
                    <div className="flex items-center gap-2">
                      {item.originalPrice && item.originalPrice > item.price && (
                        <span className="text-gray-500 line-through">
                          ${item.originalPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="font-medium">${item.price.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
            </div>

            <div className="border-t pt-3">
              <div className="flex items-center justify-between mb-3">
                <span className="font-semibold">Total:</span>
                <div className="text-right">
                  {getTotalSavings() > 0 && (
                    <div className="text-sm text-gray-500 line-through">
                      ${calculateOriginalTotal().toFixed(2)}
                    </div>
                  )}
                  <div className="text-lg font-bold text-green-600">
                    ${calculateTotalPrice().toFixed(2)}
                  </div>
                  {getTotalSavings() > 0 && (
                    <div className="text-sm text-green-600">
                      You save ${getTotalSavings().toFixed(2)}
                    </div>
                  )}
                </div>
              </div>

              <button className="w-full bg-black text-white py-2 rounded-lg hover:bg-gray-800 transition-colors flex items-center justify-center gap-2 text-sm">
                <ShoppingBag className="w-4 h-4" />
                Add Selected Items to Cart
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        )}

        {/* Outfit Suggestions */}
        <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 text-center">
          <h3 className="font-semibold mb-3">Need Style Inspiration?</h3>
          <p className="text-gray-600 mb-4 max-w-2xl mx-auto text-sm">
            Our stylists have curated perfect outfit combinations for different occasions. 
            Get personalized recommendations based on your preferences.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors text-sm">
              Get Styling Tips
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm">
              View Outfit Ideas
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
