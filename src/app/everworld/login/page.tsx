"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";

export default function CesworldLogin() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "rogerbeaudry@yahoo.com",
    password: "Gold4me.471@1761",
    rememberMe: false,
  });

  // Redirect if already logged in based on role
  useEffect(() => {
    if (!isPending && session?.user) {
      redirectBasedOnRole(session.user.role || 'member');
    }
  }, [session, isPending, router]);

  const redirectBasedOnRole = (role: string) => {
    switch (role) {
      case 'admin':
        router.push("/admin");
        break;
      case 'designer':
        router.push("/designers/dashboard");
        break;
      case 'member':
      default:
        router.push("/cesworld/dashboard");
        break;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const { data, error } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });

      if (error) {
        console.error('Sign-in error:', error);
        
        // If error object is missing details, try to fetch the actual response
        let errorDetails: any = {
          code: error.code,
          message: error.message,
          status: error.status,
          cause: error.cause,
        };

        // If error is missing details but has status 500, try to get more info
        if (error.status === 500 && (!error.code || !error.message)) {
          try {
            // Try to manually fetch the error response
            const response = await fetch(`${window.location.origin}/api/auth/sign-in/email`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              credentials: 'include',
              body: JSON.stringify({
                email: formData.email,
                password: formData.password,
              }),
            });
            
            if (!response.ok) {
              const errorBody = await response.json().catch(() => null);
              if (errorBody) {
                errorDetails = {
                  ...errorDetails,
                  code: errorBody.code || errorBody.error,
                  message: errorBody.message || errorBody.error,
                  serverError: errorBody,
                };
              }
            }
          } catch (fetchError) {
            console.error('Failed to fetch error details:', fetchError);
          }
        }

        console.error('Error details:', errorDetails);
        
        // Handle specific error codes
        const errorCode = errorDetails.code || error.code;
        const errorMessage = errorDetails.message || error.message;
        
        if (errorCode === 'INVALID_EMAIL_OR_PASSWORD' || errorCode === 'INVALID_CREDENTIALS') {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (errorCode === 'USER_NOT_FOUND') {
          toast.error("No account found with this email. Please register first.");
        } else if (errorCode === 'EMAIL_NOT_VERIFIED') {
          toast.error("Please verify your email address before signing in.");
        } else if (error.status === 500 || errorCode === 'DATABASE_ERROR' || errorCode === 'AUTH_ERROR') {
          toast.error("Server error during login. Please try again or contact support.");
          console.error('Server error details:', {
            error,
            errorDetails,
            origin: window.location.origin,
            url: window.location.href,
          });
        } else {
          toast.error(errorMessage || "Login failed. Please try again.");
        }
        
        setIsLoading(false);
        return;
      }

      if (!data) {
        toast.error("Login failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Wait a bit for session to be set in cookies
      await new Promise(resolve => setTimeout(resolve, 100));

      // Refetch session to get updated user data with role
      refetch();

      // Fetch user role after successful login
      try {
        const roleResponse = await fetch('/api/auth/check-role', {
          credentials: 'include', // Important: include cookies
        });
        
        if (roleResponse.ok) {
          const { role } = await roleResponse.json();
          toast.success(`Welcome back to Cesworld!`);
          redirectBasedOnRole(role);
        } else {
          // If check-role fails, try to get role from session data
          if (data.user?.role) {
            toast.success("Welcome back to Cesworld!");
            redirectBasedOnRole(data.user.role);
          } else {
            // Fallback to default member dashboard
            toast.success("Welcome back to Cesworld!");
            router.push("/cesworld/dashboard");
          }
        }
      } catch (roleError) {
        console.error('Role check error:', roleError);
        // Use session data if available, otherwise default to member
        const userRole = data.user?.role || 'member';
        toast.success("Welcome back to Cesworld!");
        redirectBasedOnRole(userRole);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error("An error occurred. Please try again.");
      setIsLoading(false);
    }
  };

  if (isPending) {
    return (
      <div className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (session?.user) {
    return null;
  }

  return (
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      <div className="container mx-auto px-6 py-16">
        <div className="max-w-md mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-medium mb-4">CESCLAIR WORLD LOGIN</h1>
            <p className="text-body text-muted-foreground">
              Access your member benefits, points, and rewards
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-label mb-2">
                EMAIL ADDRESS
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="your@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-label mb-2">
                PASSWORD
              </label>
              <div className="relative">
              <input
                id="password"
                  type={showPassword ? "text" : "password"}
                required
                autoComplete="off"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                  className="w-full px-4 py-3 pr-12 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Enter your password"
              />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus:outline-none"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-center">
              <input
                id="rememberMe"
                type="checkbox"
                checked={formData.rememberMe}
                onChange={(e) =>
                  setFormData({ ...formData, rememberMe: e.target.checked })
                }
                className="w-4 h-4 border-input focus:ring-ring"
              />
              <label htmlFor="rememberMe" className="ml-2 text-body">
                Remember me
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary text-white py-4 px-6 hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-button-primary">SIGNING IN...</span>
                </>
              ) : (
                <>
                  <span className="text-button-primary">SIGN IN</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 text-center">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-border"></div>
              </div>
              <div className="relative flex justify-center text-body-small">
                <span className="bg-background px-4 text-muted-foreground">
                  New to Cesclair World?
                </span>
              </div>
            </div>
          </div>

          {/* Register Link */}
          <div className="text-center space-y-4">
            <p className="text-body text-muted-foreground">
              Don't have an account yet? Join Cesclair World today and start earning points on every purchase.
            </p>
            <Link
              href="/cesworld/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-secondary transition-colors"
            >
              <span className="text-button-primary">CREATE ACCOUNT</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Back to Cesworld */}
          <div className="mt-8 text-center">
            <Link
              href="/cesworld"
              className="text-body text-muted-foreground hover:text-foreground underline"
            >
              ← Back to Cesclair World
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}