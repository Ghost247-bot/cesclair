// Comprehensive routing configuration for products pages
export const PRODUCTS_ROUTES = {
  // Main product pages
  PRODUCTS: "/products",
  PRODUCT_DETAIL: "/products/[slug]",
  PRODUCT_COMPARE: "/products/compare",
  PRODUCT_WISHLIST: "/products/wishlist",
  
  // Category pages
  CATEGORIES: {
    ALL: "/products?category=all",
    WOMEN: "/products?category=women",
    MEN: "/products?category=men",
    ACCESSORIES: "/products?category=accessories",
    NEW_ARRIVALS: "/products?category=new",
    BEST_SELLERS: "/products?category=best-sellers",
    SALE: "/products?category=sale",
  },
  
  // Filter and sort pages
  FILTERS: {
    BY_PRICE: "/products?sort=price",
    BY_RATING: "/products?sort=rating",
    BY_NAME: "/products?sort=name",
    BY_NEWEST: "/products?sort=newest",
    BY_BRAND: "/products?brand=[brand]",
    BY_COLOR: "/products?color=[color]",
    BY_SIZE: "/products?size=[size]",
  },
  
  // Search pages
  SEARCH: "/products/search",
  SEARCH_RESULTS: "/products/search?q=[query]",
  
  // Cart and checkout
  CART: "/cart",
  CHECKOUT: "/checkout",
  
  // Account pages
  ACCOUNT: "/account",
  ACCOUNT_ORDERS: "/account/orders",
  ACCOUNT_WISHLIST: "/account/wishlist",
  ACCOUNT_SETTINGS: "/account/settings",
  
  // Support pages
  SHIPPING: "/shipping",
  RETURNS: "/returns",
  SIZE_GUIDE: "/size-guide",
  CONTACT: "/contact",
} as const;

// Navigation actions for interactive elements
export const PRODUCT_ACTIONS = {
  // Product interactions
  ADD_TO_CART: "add-to-cart",
  ADD_TO_WISHLIST: "add-to-wishlist",
  QUICK_VIEW: "quick-view",
  SHARE_PRODUCT: "share-product",
  COMPARE_PRODUCTS: "compare-products",
  
  // Filter interactions
  TOGGLE_FILTER: "toggle-filter",
  CLEAR_FILTERS: "clear-filters",
  APPLY_FILTERS: "apply-filters",
  
  // Cart interactions
  UPDATE_QUANTITY: "update-quantity",
  REMOVE_ITEM: "remove-item",
  MOVE_TO_WISHLIST: "move-to-wishlist",
  APPLY_COUPON: "apply-coupon",
  
  // Page interactions
  LOAD_MORE: "load-more",
  SORT_PRODUCTS: "sort-products",
  CHANGE_VIEW: "change-view",
  TOGGLE_COMPARE: "toggle-compare",
} as const;

// Section identifiers for scroll navigation
export const PRODUCT_SECTIONS = {
  HERO: "hero",
  FILTERS: "filters",
  PRODUCTS_GRID: "products-grid",
  FEATURED_PRODUCTS: "featured-products",
  CATEGORIES: "categories",
  REVIEWS: "reviews",
  RELATED_PRODUCTS: "related-products",
  SHIPPING_INFO: "shipping-info",
  FAQ: "faq",
} as const;

// API endpoints for product actions
export const PRODUCT_API_ENDPOINTS = {
  PRODUCTS: "/api/products",
  PRODUCT_DETAIL: "/api/products/[id]",
  CART: "/api/cart",
  WISHLIST: "/api/wishlist",
  COMPARE: "/api/compare",
  SEARCH: "/api/search",
  REVIEWS: "/api/reviews",
  INVENTORY: "/api/inventory",
} as const;
