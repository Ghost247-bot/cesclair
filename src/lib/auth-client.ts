"use client"
import { createAuthClient } from "better-auth/react"
import { useEffect, useState } from "react"

// Extend Better Auth types to include role and phone
export interface ExtendedUser {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  phone?: string | null;
  role?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ExtendedSession {
  session: {
    id: string;
    userId: string;
    expiresAt: Date;
    token: string;
    ipAddress?: string;
    userAgent?: string;
  };
  user: ExtendedUser;
}

export const authClient = createAuthClient({
  baseURL: typeof window !== 'undefined' ? window.location.origin : process.env.NEXT_PUBLIC_SITE_URL,
  fetchOptions: {
    onSuccess: (ctx) => {
      // Better Auth handles tokens via cookies by default
      // Only store bearer token if explicitly provided in response headers
      const authToken = ctx.response.headers.get("set-auth-token");
      if (authToken) {
        localStorage.setItem("bearer_token", authToken);
      }
    },
    onError: (ctx) => {
      // Clear invalid token on error
      if (ctx.response?.status === 401 || ctx.response?.status === 403) {
        localStorage.removeItem("bearer_token");
      }
      if (process.env.NODE_ENV === 'development' && ctx.response?.status === 500) {
        console.error('Auth client error (500):', {
          url: ctx.request?.url,
          method: ctx.request?.method,
        });
      }
    }
  }
});

/**
 * Robust sign-out that always clears local state even if the server call fails.
 * Returns true if server sign-out succeeded, false otherwise (local state still cleared).
 */
export async function robustSignOut(): Promise<boolean> {
  let serverSuccess = false;
  try {
    await authClient.signOut();
    serverSuccess = true;
  } catch {
    // Server call failed (e.g., already logged out, network error, non-JSON response).
    // We still clear local state below.
  }
  // Always clear local tokens
  try { localStorage.removeItem("bearer_token"); } catch {}
  return serverSuccess;
}

interface SessionData {
  data: ExtendedSession | null;
  isPending: boolean;
  error: any;
  refetch: () => void;
}

export function useSession(): SessionData {
   const [session, setSession] = useState<ExtendedSession | null>(null);
   const [isPending, setIsPending] = useState(true);
   const [error, setError] = useState<any>(null);

   const refetch = () => {
      setIsPending(true);
      setError(null);
      fetchSession();
   };

   const fetchSession = async () => {
      try {
         // Better Auth uses cookies by default, no need for Bearer token in getSession
         const res = await authClient.getSession();
         setSession(res.data as ExtendedSession | null);
         setError(null);
      } catch (err) {
         setSession(null);
         setError(err);
         // Don't log session errors as they're expected when not authenticated
         if (process.env.NODE_ENV === 'development') {
           console.debug('Session fetch error:', err);
         }
      } finally {
         setIsPending(false);
      }
   };

   useEffect(() => {
      fetchSession();
   }, []);

   return { data: session, isPending, error, refetch };
}