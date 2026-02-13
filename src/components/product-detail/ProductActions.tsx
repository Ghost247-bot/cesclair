"use client";

import { useState } from 'react';
import { Heart, Share2, ShoppingBag, Eye, BarChart3, Download, Printer, Mail, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/auth-client';
import { toast } from 'sonner';

interface ProductActionsProps {
  product: {
    id: number;
    name: string;
    slug: string;
    price: string;
    stock: number;
    imageUrl?: string | null;
    rating?: number;
    reviewCount?: number;
  };
  onAddToCart?: () => void;
  onToggleWishlist?: () => void;
  isWishlisted?: boolean;
  isAddingToCart?: boolean;
  isAddingToWishlist?: boolean;
}

export default function ProductActions({ 
  product, 
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
  isAddingToCart = false,
  isAddingToWishlist = false
}: ProductActionsProps) {
  const { data: session } = useSession();
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showCompareMenu, setShowCompareMenu] = useState(false);

  const shareProduct = (platform: string) => {
    const url = window.location.href;
    const text = `Check out ${product.name} on Cesclair`;

    switch (platform) {
      case 'facebook':
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'twitter':
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        break;
      case 'pinterest':
        window.open(`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`, '_blank');
        break;
      case 'email':
        window.location.href = `mailto:?subject=${encodeURIComponent(product.name)}&body=${encodeURIComponent(text)} ${url}`;
        break;
      case 'copy':
        navigator.clipboard.writeText(url);
        toast.success('Product link copied to clipboard!');
        break;
      default:
        if (navigator.share) {
          navigator.share({ title: product.name, text, url });
        }
        break;
    }
    setShowShareMenu(false);
  };

  const addToCompare = () => {
    // Get existing compare items from localStorage
    const compareItems = JSON.parse(localStorage.getItem('compareItems') || '[]');
    
    // Check if product is already in compare
    if (compareItems.some((item: any) => item.id === product.id)) {
      toast.error('Product already in compare list');
      return;
    }

    // Add to compare (max 4 items)
    if (compareItems.length >= 4) {
      toast.error('Maximum 4 products can be compared at once');
      return;
    }

    compareItems.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.imageUrl || '/placeholder-image.jpg',
      slug: product.slug
    });

    localStorage.setItem('compareItems', JSON.stringify(compareItems));
    toast.success('Added to compare list!');
    setShowCompareMenu(false);
  };

  const viewInRoom = () => {
    // This would open an AR/3D view or room planner
    toast.info('Room view feature coming soon!');
  };

  const trackPrice = () => {
    // This would add to price tracking
    toast.info('Price tracking feature coming soon!');
  };

  const printProduct = () => {
    window.print();
  };

  const reportIssue = () => {
    // This would open a report form
    toast.info('Report issue feature coming soon!');
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Primary Actions */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onAddToCart}
          disabled={isAddingToCart || product.stock === 0}
          className="flex items-center justify-center gap-2 bg-black text-white py-3 px-4 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <ShoppingBag className="w-4 h-4" />
          {isAddingToCart ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          ) : (
            <>
              Add to Cart
              {product.stock === 0 && <span className="text-xs">(Out of Stock)</span>}
            </>
          )}
        </button>

        <button
          onClick={onToggleWishlist}
          disabled={isAddingToWishlist}
          className="flex items-center justify-center gap-2 border border-gray-300 py-3 px-4 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Heart 
            className={`w-4 h-4 ${isWishlisted ? 'fill-red-500 text-red-500' : ''}`} 
          />
          {isAddingToWishlist ? (
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
          ) : (
            <>
              {isWishlisted ? 'Wishlisted' : 'Add to Wishlist'}
            </>
          )}
        </button>
      </div>

      {/* Secondary Actions */}
      <div className="flex flex-wrap gap-2">
        {/* Share */}
        <div className="relative">
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            <span className="text-sm">Share</span>
          </button>

          {showShareMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[200px]">
              <div className="py-2">
                <button
                  onClick={() => shareProduct('facebook')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  Facebook
                </button>
                <button
                  onClick={() => shareProduct('twitter')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-sky-500 rounded"></div>
                  Twitter
                </button>
                <button
                  onClick={() => shareProduct('pinterest')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-4 h-4 bg-red-600 rounded"></div>
                  Pinterest
                </button>
                <button
                  onClick={() => shareProduct('email')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => shareProduct('copy')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <div className="w-4 h-4 border-2 border-gray-600 rounded"></div>
                  Copy Link
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Compare */}
        <div className="relative">
          <button
            onClick={() => setShowCompareMenu(!showCompareMenu)}
            className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            <span className="text-sm">Compare</span>
          </button>

          {showCompareMenu && (
            <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 min-w-[180px]">
              <div className="py-2">
                <button
                  onClick={addToCompare}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Add to Compare
                </button>
                <button
                  onClick={() => window.open('/compare', '_blank')}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                >
                  <BarChart3 className="w-4 h-4" />
                  View Compare
                </button>
              </div>
            </div>
          )}
        </div>

        {/* View in Room */}
        <button
          onClick={viewInRoom}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="View in AR room"
        >
          <Eye className="w-4 h-4" />
          <span className="text-sm">View in Room</span>
        </button>

        {/* Track Price */}
        <button
          onClick={trackPrice}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Track price changes"
        >
          <div className="w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
            <span className="text-white text-xs font-bold">$</span>
          </div>
          <span className="text-sm">Track Price</span>
        </button>

        {/* Print */}
        <button
          onClick={printProduct}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Print product details"
        >
          <Printer className="w-4 h-4" />
          <span className="text-sm">Print</span>
        </button>

        {/* Report Issue */}
        <button
          onClick={reportIssue}
          className="flex items-center gap-2 px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          title="Report issue with this product"
        >
          <MessageCircle className="w-4 h-4" />
          <span className="text-sm">Report Issue</span>
        </button>
      </div>
    </div>
  );
}
