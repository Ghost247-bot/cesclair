"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import { PRODUCTS_ROUTES, PRODUCT_ACTIONS, PRODUCT_SECTIONS } from "@/lib/routing/products-routes";

interface NavigationOptions {
  preserveQuery?: boolean;
  scroll?: boolean;
  shallow?: boolean;
}

interface FilterOptions {
  category?: string;
  sort?: string;
  brand?: string;
  color?: string;
  size?: string;
  priceRange?: [number, number];
  inStock?: boolean;
  rating?: number;
}

export function useProductNavigation() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Get current query parameters
  const currentQuery = useMemo(() => {
    const params: Record<string, string> = {};
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return params;
  }, [searchParams]);

  // Navigate to product detail
  const navigateToProduct = useCallback((slug: string, options?: NavigationOptions) => {
    const url = `${PRODUCTS_ROUTES.PRODUCT_DETAIL.replace("[slug]", slug)}`;
    router.push(url, { scroll: options?.scroll });
  }, [router]);

  // Navigate to category
  const navigateToCategory = useCallback((category: string, options?: NavigationOptions) => {
    const query = options?.preserveQuery ? { ...currentQuery, category } : { category };
    const queryString = new URLSearchParams(query).toString();
    const url = `${PRODUCTS_ROUTES.PRODUCTS}${queryString ? `?${queryString}` : ""}`;
    router.push(url, { scroll: options?.scroll });
  }, [router, currentQuery]);

  // Navigate with filters
  const navigateWithFilters = useCallback((filters: FilterOptions, options?: NavigationOptions) => {
    const query = { ...currentQuery };
    
    // Update query parameters based on filters
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        if (Array.isArray(value)) {
          query[key] = value.join(",");
        } else if (typeof value === "object") {
          query[key] = JSON.stringify(value);
        } else {
          query[key] = String(value);
        }
      } else {
        delete query[key];
      }
    });

    const queryString = new URLSearchParams(query).toString();
    const url = `${PRODUCTS_ROUTES.PRODUCTS}${queryString ? `?${queryString}` : ""}`;
    router.push(url, { scroll: options?.scroll });
  }, [router, currentQuery]);

  // Navigate to search
  const navigateToSearch = useCallback((query: string, options?: NavigationOptions) => {
    const searchQuery = new URLSearchParams({ q: query }).toString();
    const url = `${PRODUCTS_ROUTES.SEARCH}?${searchQuery}`;
    router.push(url, { scroll: options?.scroll });
  }, [router]);

  // Navigate to compare page
  const navigateToCompare = useCallback((productIds: number[], options?: NavigationOptions) => {
    const query = new URLSearchParams({ ids: productIds.join(",") }).toString();
    const url = `${PRODUCTS_ROUTES.PRODUCT_COMPARE}?${query}`;
    router.push(url, { scroll: options?.scroll });
  }, [router]);

  // Navigate to cart
  const navigateToCart = useCallback((options?: NavigationOptions) => {
    router.push(PRODUCTS_ROUTES.CART, { scroll: options?.scroll });
  }, [router]);

  // Navigate to checkout
  const navigateToCheckout = useCallback((step?: string, options?: NavigationOptions) => {
    const url = step ? `${PRODUCTS_ROUTES.CHECKOUT}?step=${step}` : PRODUCTS_ROUTES.CHECKOUT;
    router.push(url, { scroll: options?.scroll });
  }, [router]);

  // Navigate to wishlist
  const navigateToWishlist = useCallback((options?: NavigationOptions) => {
    router.push(PRODUCTS_ROUTES.PRODUCT_WISHLIST, { scroll: options?.scroll });
  }, [router]);

  // Navigate to account section
  const navigateToAccount = useCallback((section?: string, options?: NavigationOptions) => {
    const url = section ? `${PRODUCTS_ROUTES.ACCOUNT}/${section}` : PRODUCTS_ROUTES.ACCOUNT;
    router.push(url, { scroll: options?.scroll });
  }, [router]);

  // Scroll to section
  const scrollToSection = useCallback((sectionId: string, options?: { offset?: number }) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = options?.offset || 0;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  }, []);

  // Update URL parameters without navigation
  const updateQueryParams = useCallback((updates: Record<string, string | null>) => {
    const newQuery = { ...currentQuery };
    
    Object.entries(updates).forEach(([key, value]) => {
      if (value === null) {
        delete newQuery[key];
      } else {
        newQuery[key] = value;
      }
    });

    const queryString = new URLSearchParams(newQuery).toString();
    const url = `${pathname}${queryString ? `?${queryString}` : ""}`;
    router.push(url, { shallow: true });
  }, [router, currentQuery, pathname]);

  // Clear all filters
  const clearFilters = useCallback(() => {
    const clearedQuery: Record<string, string> = {};
    
    // Preserve non-filter parameters
    Object.entries(currentQuery).forEach(([key, value]) => {
      if (!["category", "sort", "brand", "color", "size", "priceRange", "inStock", "rating"].includes(key)) {
        clearedQuery[key] = value;
      }
    });

    const queryString = new URLSearchParams(clearedQuery).toString();
    const url = `${PRODUCTS_ROUTES.PRODUCTS}${queryString ? `?${queryString}` : ""}`;
    router.push(url, { scroll: false });
  }, [router, currentQuery]);

  // Get current filters
  const getCurrentFilters = useCallback((): FilterOptions => {
    return {
      category: currentQuery.category,
      sort: currentQuery.sort,
      brand: currentQuery.brand,
      color: currentQuery.color,
      size: currentQuery.size,
      priceRange: currentQuery.priceRange ? JSON.parse(currentQuery.priceRange) : undefined,
      inStock: currentQuery.inStock === "true",
      rating: currentQuery.rating ? parseInt(currentQuery.rating) : undefined,
    };
  }, [currentQuery]);

  return {
    // Navigation methods
    navigateToProduct,
    navigateToCategory,
    navigateWithFilters,
    navigateToSearch,
    navigateToCompare,
    navigateToCart,
    navigateToCheckout,
    navigateToWishlist,
    navigateToAccount,
    scrollToSection,
    updateQueryParams,
    clearFilters,
    
    // Utility methods
    getCurrentFilters,
    currentQuery,
    currentPath: pathname,
    
    // Constants
    ROUTES: PRODUCTS_ROUTES,
    ACTIONS: PRODUCT_ACTIONS,
    SECTIONS: PRODUCT_SECTIONS,
  };
}
