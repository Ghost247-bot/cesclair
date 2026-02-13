"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import { PRODUCT_API_ENDPOINTS } from "@/lib/routing/products-routes";

interface Product {
  id: number;
  name: string;
  slug: string;
  price: string;
  imageUrl?: string;
  stock: number;
  category?: string;
  brand?: string;
  colors?: string[];
  sizes?: string[];
}

interface CartItem {
  id: number;
  productId: number;
  quantity: number;
  size?: string;
  color?: string;
}

interface ProductActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export function useProductActions() {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<number>>(new Set());
  const [compareList, setCompareList] = useState<Set<number>>(new Set());

  // Add product to cart
  const addToCart = useCallback(async (
    productId: number,
    options?: {
      quantity?: number;
      size?: string;
      color?: string;
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    const loadingKey = `add-to-cart-${productId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(PRODUCT_API_ENDPOINTS.CART, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId,
          quantity: options?.quantity || 1,
          size: options?.size,
          color: options?.color,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to add to cart");
      }

      const data = await response.json();
      
      toast.success("Added to cart!");
      options?.onSuccess?.();
      
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add to cart";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Add multiple products to cart
  const addMultipleToCart = useCallback(async (
    products: Array<{
      productId: number;
      quantity?: number;
      size?: string;
      color?: string;
    }>,
    options?: {
      onSuccess?: (successful: number, failed: number) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    setLoading(prev => ({ ...prev, "add-multiple-to-cart": true }));

    try {
      const promises = products.map(async (product) => {
        try {
          const response = await fetch(PRODUCT_API_ENDPOINTS.CART, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              productId: product.productId,
              quantity: product.quantity || 1,
              size: product.size,
              color: product.color,
            }),
          });

          if (!response.ok) {
            throw new Error(`Failed to add product ${product.productId} to cart`);
          }

          return { success: true, productId: product.productId };
        } catch (error) {
          return { success: false, productId: product.productId, error };
        }
      });

      const results = await Promise.allSettled(promises);
      const successful = results.filter(r => 
        r.status === "fulfilled" && r.value.success
      ).length;
      const failed = results.length - successful;

      if (successful > 0) {
        toast.success(`${successful} item${successful > 1 ? 's' : ''} added to cart`);
      }

      if (failed > 0) {
        toast.error(`${failed} item${failed > 1 ? 's' : ''} failed to add to cart`);
      }

      options?.onSuccess?.(successful, failed);
      
      return { success: successful > 0, data: { successful, failed } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to add items to cart";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, "add-multiple-to-cart": false }));
    }
  }, []);

  // Update cart item quantity
  const updateCartItemQuantity = useCallback(async (
    itemId: number,
    quantity: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    const loadingKey = `update-quantity-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(PRODUCT_API_ENDPOINTS.CART, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update quantity");
      }

      const data = await response.json();
      
      toast.success("Quantity updated");
      options?.onSuccess?.();
      
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update quantity";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Remove item from cart
  const removeFromCart = useCallback(async (
    itemId: number,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    const loadingKey = `remove-from-cart-${itemId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(`${PRODUCT_API_ENDPOINTS.CART}?itemId=${itemId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to remove from cart");
      }

      const data = await response.json();
      
      toast.success("Removed from cart");
      options?.onSuccess?.();
      
      return { success: true, data };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to remove from cart";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Toggle wishlist
  const toggleWishlist = useCallback(async (
    productId: number,
    options?: {
      onSuccess?: (isWishlisted: boolean) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    const loadingKey = `wishlist-${productId}`;
    setLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const response = await fetch(PRODUCT_API_ENDPOINTS.WISHLIST, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update wishlist");
      }

      const data = await response.json();
      const isWishlisted = data.isWishlisted;
      
      setWishlist(prev => {
        const newSet = new Set(prev);
        if (isWishlisted) {
          newSet.add(productId);
          toast.success("Added to wishlist!");
        } else {
          newSet.delete(productId);
          toast.success("Removed from wishlist!");
        }
        return newSet;
      });

      // Trigger wishlist update event for header
      window.dispatchEvent(new Event('wishlistUpdated'));

      options?.onSuccess?.(isWishlisted);
      
      return { success: true, data: { isWishlisted } };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update wishlist";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    } finally {
      setLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  }, []);

  // Toggle compare
  const toggleCompare = useCallback((productId: number) => {
    setCompareList(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
        toast.success("Removed from compare");
      } else {
        if (newSet.size >= 4) {
          toast.error("You can compare up to 4 products at a time");
          return prev;
        }
        newSet.add(productId);
        toast.success("Added to compare");
      }
      return newSet;
    });
  }, []);

  // Share product
  const shareProduct = useCallback(async (
    product: Product,
    options?: {
      onSuccess?: () => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    try {
      const shareUrl = `${window.location.origin}/products/${product.slug}`;
      
      if (navigator.share) {
        await navigator.share({
          title: product.name,
          text: `Check out this ${product.category || 'product'}: ${product.name}`,
          url: shareUrl,
        });
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(shareUrl);
        toast.success("Link copied to clipboard!");
      }

      options?.onSuccess?.();
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to share product";
      toast.error(errorMessage);
      options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
      return { success: false, message: errorMessage };
    }
  }, []);

  // Quick view
  const openQuickView = useCallback((
    productId: number,
    options?: {
      onSuccess?: (product: Product) => void;
      onError?: (error: Error) => void;
    }
  ): Promise<ProductActionResult> => {
    setLoading(prev => ({ ...prev, [`quick-view-${productId}`]: true }));

    return fetch(`${PRODUCT_API_ENDPOINTS.PRODUCT_DETAIL.replace("[id]", String(productId))}`)
      .then(response => {
        if (!response.ok) {
          throw new Error("Failed to load product details");
        }
        return response.json();
      })
      .then(product => {
        options?.onSuccess?.(product);
        return { success: true, data: product };
      })
      .catch(error => {
        const errorMessage = error instanceof Error ? error.message : "Failed to load product";
        toast.error(errorMessage);
        options?.onError?.(error instanceof Error ? error : new Error(errorMessage));
        return { success: false, message: errorMessage };
      })
      .finally(() => {
        setLoading(prev => ({ ...prev, [`quick-view-${productId}`]: false }));
      });
  }, []);

  return {
    // State
    loading,
    cartItems,
    wishlist,
    compareList,
    
    // Actions
    addToCart,
    addMultipleToCart,
    updateCartItemQuantity,
    removeFromCart,
    toggleWishlist,
    toggleCompare,
    shareProduct,
    openQuickView,
    
    // Utility methods
    isLoading: (key: string) => loading[key] || false,
    isInWishlist: (productId: number) => wishlist.has(productId),
    isInCompareList: (productId: number) => compareList.has(productId),
  };
}
