# Robust Routing Strategy for Cesclair E-commerce

## Problem Analysis

The current routing setup has several issues:

1. **Automatic Dashboard Redirection:** After login, users are automatically redirected to `/account` page, even when they intend to navigate elsewhere
2. **Continuous Refresh Loops:** The orders status page refreshes every 5 seconds, causing unnecessary API calls and poor UX
3. **Inflexible Route Guards:** Middleware is too restrictive, preventing free navigation between pages
4. **No Session Persistence:** User sessions aren't properly maintained across page reloads
5. **Missing Route Protection:** Some sensitive pages lack proper authentication checks

## Recommended Solution

### 1. Flexible Middleware Configuration

**File: `src/middleware.ts`**

```typescript
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Public routes that don't need authentication
const PUBLIC_ROUTES = [
  "/", "/products", "/cart", "/checkout", "/about", 
  "/contact", "/help", "/privacy", "/terms", "/stores",
  "/women", "/men", "/accessories", "/collections", "/compare",
  "/orders/status", "/shipping", "/returns", "/size-guide"
];

// Semi-protected routes (accessible but may show different content for auth/non-auth)
const SEMI_PROTECTED_ROUTES = [
  "/account", "/account/profile", "/account/orders", "/account/favorites"
];

// Fully protected routes (require authentication)
const PROTECTED_ROUTES = [
  "/admin", "/designers/dashboard", "/cesworld/dashboard", "/everworld/dashboard"
];

function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some(route => pathname.startsWith(route));
}

function isSemiProtectedRoute(pathname: string): boolean {
  return SEMI_PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some(route => pathname.startsWith(route));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Skip middleware for API routes, static files, and Next.js internals
  if (
    pathname.startsWith("/api/") ||
    pathname.startsWith("/_next/") ||
    pathname.startsWith("/static/") ||
    pathname.includes(".") // Static files
  ) {
    return NextResponse.next();
  }

  // Handle authentication for protected routes
  if (isProtectedRoute(pathname)) {
    try {
      const session = await auth.api.getSession({ 
        headers: request.headers 
      });
      
      if (!session?.user) {
        // Store intended destination for post-login redirect
        const intendedDestination = request.headers.get("x-intended-destination");
        
        if (intendedDestination) {
          return NextResponse.redirect(intendedDestination);
        }
        
        // Redirect to login with return URL
        const loginUrl = new URL("/cesworld/login", request.url);
        loginUrl.searchParams.set("returnUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }
      
      // User is authenticated, allow access
      const response = NextResponse.next();
      
      // Add security headers
      response.headers.set('X-Content-Type-Options', 'nosniff');
      response.headers.set('X-Frame-Options', 'DENY');
      response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
      
      return response;
    } catch (error) {
      console.error('Middleware error:', error);
      return NextResponse.next();
    }
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$).*)",
  ],
};
```

### 2. Smart Session Management

**File: `src/lib/auth-client.ts`**

```typescript
import { createAuthClient } from "better-auth/react";
import { useEffect, useState } from "react";

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      // Store session data with proper error handling
      if (ctx.response?.status === 200) {
        localStorage.setItem('user_session', JSON.stringify(ctx.data));
      }
    },
    onError: (ctx) => {
      // Clear invalid sessions
      if (ctx.response?.status === 401 || ctx.response?.status === 403) {
        localStorage.removeItem('user_session');
      }
    }
  }
});

// Enhanced session hook with persistence
export function useSession() {
  const [session, setSession] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first
    const storedSession = localStorage.getItem('user_session');
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        setSession(sessionData);
      } catch (error) {
        console.error('Failed to parse stored session:', error);
      }
    }
    setIsLoading(false);
  }, []);

  // Sync with server session
  const syncWithServer = async () => {
    try {
      const response = await fetch('/api/auth/session-sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });
      
      if (response.ok) {
        const serverSession = await response.json();
        localStorage.setItem('user_session', JSON.stringify(serverSession));
        setSession(serverSession);
      }
    } catch (error) {
      console.error('Session sync error:', error);
    }
  };

  return { session, isLoading, syncWithServer };
}
```

### 3. Enhanced Login Flow

**File: `src/app/cesworld/login/page.tsx`**

```typescript
// After successful login, don't automatically redirect
const handleLoginSuccess = async (user: any) => {
  // Store login intent
  localStorage.setItem('login_intent', 'true');
  
  // Show success message
  toast.success("Welcome back!");
  
  // Redirect only if specific destination is set
  const intendedDestination = localStorage.getItem('intended_destination');
  if (intendedDestination) {
    router.push(intendedDestination);
    localStorage.removeItem('intended_destination');
  } else {
    // Stay on login page or go to account based on user preference
    const userPreference = localStorage.getItem('post_login_preference') || 'account';
    
    if (userPreference === 'dashboard') {
      router.push('/cesworld/dashboard');
    } else if (userPreference === 'home') {
      router.push('/');
    } else {
      router.push('/account');
    }
  }
  
  // Clear login intent
  localStorage.removeItem('login_intent');
};
```

### 4. Fixed Orders Status Page

**File: `src/app/orders/status/page.tsx`**

```typescript
"use client";

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export default function OrderStatusPage() {
  const searchParams = useSearchParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [lastFetch, setLastFetch] = useState(0);

  // Only fetch order status when explicitly requested
  const fetchOrderStatus = async (orderNum: string) => {
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetch;
    
    // Prevent excessive API calls (minimum 30 seconds between fetches)
    if (timeSinceLastFetch < 30000) {
      console.log('Skipping order status fetch - too soon since last fetch');
      return;
    }
    
    setLoading(true);
    setLastFetch(now);
    
    try {
      const response = await fetch(`/api/orders/status/${orderNum}`);
      const data = await response.json();
      
      if (response.ok) {
        setOrder(data);
        // Store last successful fetch time
        localStorage.setItem(`order_status_${orderNum}`, JSON.stringify({
          data,
          timestamp: now
        }));
      } else {
        throw new Error(data.error || 'Failed to fetch order status');
      }
    } catch (error) {
      console.error('Error fetching order status:', error);
      // Don't throw error to prevent page crashes
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const orderNum = searchParams.get('orderNumber');
    if (orderNum && order !== orderNum) {
      setOrder(null);
      setOrderNumber(orderNum);
      fetchOrderStatus(orderNum);
    }
  }, [searchParams]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      setOrder(null);
      setOrderNumber('');
    };
  }, []);

  return (
    // Component JSX with proper error handling and no infinite loops
  );
};
```

### 5. Route Guard Components

**File: `src/components/guards/ProtectedRoute.tsx`**

```typescript
"use client";

import { useSession } from '@/lib/auth-client';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ 
  children, 
  fallback = <div>Please sign in to access this page.</div>,
  requireAdmin = false 
}: ProtectedRouteProps) {
  const { data: session, isLoading } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && session?.user) {
      // Check admin requirements
      if (requireAdmin && session.user.role !== 'admin') {
        router.push('/admin');
        return;
      }
      
      // User is authenticated, show protected content
      return;
    }
  }, [session, isLoading, requireAdmin]);

  // Show loading state or fallback
  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return fallback || <div>Please sign in to access this page.</div>;
}
```

## Implementation Benefits

1. **Flexible Navigation:** Users can choose where to go after login
2. **Reduced API Calls:** Smart caching prevents unnecessary requests
3. **Better UX:** No more forced redirects, clear user intentions
4. **Scalable Protection:** Easy to add new protected routes
5. **Session Persistence:** Sessions survive page reloads
6. **Error Prevention:** Robust error handling prevents crashes

## Usage Instructions

1. Replace existing middleware with the flexible version
2. Update login components to use the new session management
3. Add ProtectedRoute wrapper around sensitive components
4. Implement user preference system for post-login navigation

This strategy provides a much better user experience while maintaining security and flexibility.
