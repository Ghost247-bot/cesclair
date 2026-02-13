"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, ArrowRight, Plus, Minus, Trash2, ShoppingBag, Info } from "lucide-react";
import { normalizeImagePath } from "@/lib/utils";
import { toast } from "sonner";

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size: string | null;
  color: string | null;
  product: {
    id: number;
    name: string;
    price: string;
    imageUrl: string | null;
    sku: string | null;
  };
}

interface EnhancedCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function EnhancedCartDrawer({ isOpen, onClose }: EnhancedCartDrawerProps) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingQuantity, setUpdatingQuantity] = useState<number | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function fetchCart() {
      try {
        setLoading(true);
        const response = await fetch("/api/cart");
        if (!response.ok) throw new Error("Failed to fetch cart");
        const data = await response.json();
        setCartItems(data.items || []);
      } catch (error) {
        console.error("Error fetching cart:", error);
        toast.error("Failed to load cart");
      } finally {
        setLoading(false);
      }
    }

    fetchCart();
  }, [isOpen]);

  const updateQuantity = async (itemId: number, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingQuantity(itemId);
    try {
      const response = await fetch(`/api/cart`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: newQuantity }),
      });

      if (!response.ok) throw new Error("Failed to update quantity");

      const data = await response.json();
      if (data.success) {
        setCartItems(prev => 
          prev.map(item => 
            item.id === itemId 
              ? { ...item, quantity: newQuantity }
              : item
          )
        );
        toast.success("Quantity updated");
      }
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast.error("Failed to update quantity");
    } finally {
      setUpdatingQuantity(null);
    }
  };

  const removeItem = async (itemId: number) => {
    try {
      const response = await fetch(`/api/cart?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Failed to remove item");

      const data = await response.json();
      if (data.success) {
        setCartItems(prev => prev.filter(item => item.id !== itemId));
        toast.success("Item removed from cart");
      }
    } catch (error) {
      console.error("Error removing item:", error);
      toast.error("Failed to remove item");
    }
  };

  const calculateSubtotal = () => {
    return cartItems.reduce((total, item) => {
      const price = parseFloat(item.product?.price || "0");
      return total + (price * item.quantity);
    }, 0);
  };

  const calculateTotal = () => {
    const subtotal = calculateSubtotal();
    // Add shipping calculation if needed
    const shipping = subtotal > 0 ? (subtotal >= 125 ? 0 : 12.50) : 0;
    return subtotal + shipping;
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" aria-hidden="true" onClick={onClose} />
      <aside className="absolute top-0 right-0 h-full w-full max-w-[480px] bg-white text-primary-text shadow-xl flex flex-col">
        {/* Header */}
        <div className="border-b border-gray-200">
          <div className="px-6 pt-4 pb-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[13px] font-medium uppercase tracking-[0.08em]">Your Bag ({cartItems.length})</h2>
              <button 
                onClick={onClose}
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {/* Free Shipping Progress Bar */}
            <div className="w-full bg-[#f8f6f4] h-1 rounded-full overflow-hidden">
              <div 
                className="h-full bg-green-800 transition-all duration-300"
                style={{ 
                  width: `${Math.min(100, (calculateSubtotal() / 125) * 100)}%` 
                }}
              />
            </div>
            <p className="text-center text-[11px] text-secondary-text mt-1.5">
              {calculateSubtotal() >= 125 
                ? "You've qualified for free standard shipping!" 
                : `$${(125 - calculateSubtotal()).toFixed(2)} away from free shipping`
              }
            </p>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-grow flex flex-col">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-6">
              <div className="relative w-[352px] h-[440px]">
                <Image
                  src={normalizeImagePath("https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/object/public/test-clones/a7697d88-840c-467f-b726-f555a6a2eb36-ceslane-com/assets/images/Empty_Bag_State_Image-1.jpg")}
                  alt="Your cart is empty"
                  fill
                  className="object-contain"
                  unoptimized
                />
              </div>
              <h3 className="text-xl font-medium mt-6 relative z-10 bg-white px-2">
                Your bag is empty.
              </h3>
              <p className="text-gray-500 mt-2 text-center">
                Not sure where to start?
              </p>
              <div className="mt-6 flex flex-col space-y-3">
                <Link 
                  href="/collections/womens-new-arrivals" 
                  className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                  Shop New Arrivals
                </Link>
                <Link 
                  href="/collections/womens-best-sellers" 
                  className="flex items-center justify-center gap-2 text-[11px] font-medium uppercase tracking-[0.05em] text-primary-text hover:text-link-hover bg-gray-50 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors"
                >
                  <ArrowRight className="h-4 w-4" />
                  Shop Best Sellers
                </Link>
              </div>
            </div>
          ) : (
            <div className="flex-grow overflow-y-auto py-4 px-6">
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    {/* Product Image */}
                    <div className="relative w-20 h-20 flex-shrink-0">
                      {item.product.imageUrl ? (
                        <Image
                          src={normalizeImagePath(item.product.imageUrl)}
                          alt={item.product.name}
                          fill
                          className="object-cover rounded-md"
                          unoptimized
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                          <ShoppingBag className="h-6 w-6 text-gray-400" />
                        </div>
                      )}
                    </div>

                    {/* Product Details */}
                    <div className="flex-grow min-w-0">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="text-sm font-medium text-gray-900 line-clamp-2">
                            {item.product.name}
                          </h4>
                          {item.product.sku && (
                            <p className="text-xs text-gray-500">SKU: {item.product.sku}</p>
                          )}
                          {(item.size || item.color) && (
                            <p className="text-xs text-gray-500">
                              {item.size && `Size: ${item.size}`}
                              {item.size && item.color && " | "}
                              {item.color && `Color: ${item.color}`}
                            </p>
                          )}
                        </div>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors"
                          aria-label="Remove item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      {/* Price and Quantity Controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-900">
                            {formatPrice(parseFloat(item.product.price) * item.quantity)}
                          </span>
                          <div className="flex items-center border border-gray-300 rounded-md">
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              disabled={updatingQuantity === item.id || item.quantity <= 1}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-3 py-1 text-sm font-medium min-w-[3rem] text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={updatingQuantity === item.id}
                              className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Loading State */}
                      {updatingQuantity === item.id && (
                        <div className="flex items-center gap-2 mt-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b border-primary-600"></div>
                          <span className="text-xs text-gray-500">Updating...</span>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-auto px-6 pt-4 pb-6 border-t border-gray-200 bg-white">
          {/* Order Summary */}
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Subtotal</span>
              <span className="text-sm font-medium">{formatPrice(calculateSubtotal())}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Shipping</span>
              <span className="text-sm font-medium">
                {calculateSubtotal() >= 125 ? "FREE" : formatPrice(12.50)}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-base font-bold">Total</span>
              <span className="text-base font-bold">{formatPrice(calculateTotal())}</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              className="w-full bg-black text-white py-4 px-6 rounded-lg hover:bg-gray-800 transition-colors font-medium flex items-center justify-center gap-2"
              onClick={() => {
                if (cartItems.length > 0) {
                  // Add to cart functionality - items are already in cart
                  toast.success("Items are already in your cart!");
                }
              }}
            >
              <ShoppingBag className="w-5 h-5" />
              Add Selected Items to Cart
              <ArrowRight className="w-4 h-4" />
            </button>

            <Link
              href="/checkout?step=cart"
              className="w-full bg-primary text-primary-foreground uppercase text-[13px] font-medium tracking-[0.05em] py-4 px-6 rounded-[2px] hover:bg-primary-hover transition-colors text-center block"
            >
              Continue to Checkout
            </Link>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center justify-center gap-4 mt-4 text-xs text-gray-500">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-green-600 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 1.414l8-8a1 1 0 000-1.414-1.414z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Secure Checkout</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-2 h-2 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 5a2 2 0 012-2v10a2 2 0 01-2 2h14a2 2 0 012-2V7a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span>Easy Returns</span>
            </div>
          </div>
        </div>
    </aside>
  </div>
);
}
