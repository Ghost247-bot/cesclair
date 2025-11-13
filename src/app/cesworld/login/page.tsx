"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/sections/footer";

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
    const userEmail = session.user.email;
    
    // Check if user is in designers table first
    if (userEmail) {
      fetch(`/api/designers/by-email?email=${encodeURIComponent(userEmail)}`)
        .then(res => res.json())
        .then(data => {
          if (data.exists && data.status === 'approved') {
            router.push("/designers/dashboard");
            return;
          }
          
          // Not a designer, use role check
          if (role === 'admin') {
            router.push("/admin");
          } else {
            router.push("/cesworld/dashboard");
          }
        })
        .catch(() => {
          // On error, use role check
          if (role === 'admin') {
            router.push("/admin");
          } else if (role === 'designer') {
            router.push("/designers/dashboard");
          } else {
            router.push("/cesworld/dashboard");
          }
        });
    } else {
      // No email, use role check
      if (role === 'admin') {
        router.push("/admin");
      } else if (role === 'designer') {
        router.push("/designers/dashboard");
      } else {
        router.push("/cesworld/dashboard");
      }
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
        console.error('Error details:', {
          code: error.code,
          message: error.message,
          status: error.status,
          cause: error.cause,
        });
        
        // Handle specific error codes
        if (error.code === 'INVALID_EMAIL_OR_PASSWORD' || error.code === 'INVALID_CREDENTIALS') {
          toast.error("Invalid email or password. Please check your credentials and try again.");
        } else if (error.code === 'USER_NOT_FOUND') {
          toast.error("No account found with this email. Please register first.");
        } else if (error.code === 'EMAIL_NOT_VERIFIED') {
          toast.error("Please verify your email address before signing in.");
        } else if (error.status === 500) {
          // Check if it's a password hash error
          const errorMessage = error.message || '';
          if (errorMessage.includes('password hash') || errorMessage.includes('Invalid password')) {
            toast.error("Your account needs to be updated. Please use the password reset utility or re-register.");
            // Optionally, you can automatically fix it here
            // For now, just show the error
          } else {
            toast.error("Server error during login. Please try again or contact support.");
          }
          console.error('Server error details:', error);
        } else {
          toast.error(error.message || "Login failed. Please try again.");
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
      await new Promise(resolve => setTimeout(resolve, 300));

      // Refetch session to get updated user data with role
      refetch();

      // Try to get role from session data first
      if (data?.user?.role) {
        toast.success("Welcome back to Cesworld!");
        redirectBasedOnRole(data.user.role);
      } else {
        // Fallback: try to fetch role from API
        try {
          const roleResponse = await fetch('/api/auth/check-role', {
            credentials: 'include',
          });
          if (roleResponse.ok) {
            const { role } = await roleResponse.json();
            toast.success("Welcome back to Cesworld!");
            redirectBasedOnRole(role);
          } else {
            // Fallback: check designers table
            const userEmail = data.user?.email;
            if (userEmail) {
              try {
                const designerRes = await fetch(`/api/designers/by-email?email=${encodeURIComponent(userEmail)}`);
                const designerData = await designerRes.json();
                if (designerData.exists && designerData.status === 'approved') {
                  toast.success("Welcome back!");
                  router.push("/designers/dashboard");
                } else {
                  toast.success("Welcome back to Cesworld!");
                  router.push("/cesworld/dashboard");
                }
              } catch {
                toast.success("Welcome back to Cesworld!");
                router.push("/cesworld/dashboard");
              }
            } else {
            toast.success("Welcome back to Cesworld!");
            router.push("/cesworld/dashboard");
            }
          }
        } catch (error) {
          console.error('Role check error:', error);
          // Fallback to default member dashboard
          toast.success("Welcome back to Cesworld!");
          router.push("/cesworld/dashboard");
        }
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
    <>
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
    <Footer />
    </>
  );
}