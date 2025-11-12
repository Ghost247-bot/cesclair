"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn, Loader2 } from "lucide-react";
import Footer from "@/components/sections/footer";
import { authClient, useSession } from "@/lib/auth-client";
import { toast } from "sonner";

export default function DesignerLoginPage() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Redirect if already logged in as designer
  useEffect(() => {
    if (!isPending && session?.user) {
      const role = session.user.role || 'member';
      if (role === 'designer') {
        router.push("/designers/dashboard");
      } else if (role === 'admin') {
        router.push("/admin");
      } else {
        router.push("/cesworld/dashboard");
      }
    }
  }, [session, isPending, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Use better-auth for login
      const { data, error: authError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        throw new Error(authError.message || "Login failed");
      }

      if (!data) {
        throw new Error("Login failed");
      }

      // Check if user has designer role
      const userRole = data.user?.role || 'member';
      const userEmail = data.user?.email || formData.email;
      
      // If user doesn't have designer role, check designers table
      if (userRole !== 'designer') {
        try {
          // Check if user exists in designers table with approved status
          const designerCheck = await fetch("/api/designers/by-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ email: userEmail }),
          });

          if (designerCheck.ok) {
            const designerData = await designerCheck.json();
            
            // If designer exists and is approved, update user role and allow login
            if (designerData.status === 'approved') {
              try {
                // Update user role to designer if not already set
                const roleUpdateResponse = await fetch("/api/designers/update-role", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  credentials: 'include',
                });

                if (roleUpdateResponse.ok) {
                  console.log("User role updated to designer");
                  // Refetch session to get updated role
                  await refetch();
                } else {
                  console.warn("Failed to update user role, but allowing login");
                }
              } catch (roleUpdateError) {
                console.warn("Error updating user role:", roleUpdateError);
                // Continue with login even if role update fails
              }
              // User is an approved designer, allow login
            } else if (designerData.status === 'pending') {
              throw new Error("Your designer account is pending approval. Please wait for admin approval.");
            } else if (designerData.status === 'rejected') {
              throw new Error("Your designer application has been rejected. Please contact support.");
            } else {
              throw new Error("You don't have designer access. Please apply to become a designer first.");
            }
          } else {
            // Designer not found in designers table
            throw new Error("You don't have designer access. Please apply to become a designer first.");
          }
        } catch (checkError) {
          // If the error is already a user-friendly message, throw it
          if (checkError instanceof Error && checkError.message.includes("pending approval")) {
            throw checkError;
          }
          if (checkError instanceof Error && checkError.message.includes("rejected")) {
            throw checkError;
          }
          if (checkError instanceof Error && checkError.message.includes("designer access")) {
            throw checkError;
          }
          // Otherwise, log the error and show generic message
          console.error("Failed to check designer status:", checkError);
          throw new Error("You don't have designer access. Please apply to become a designer first.");
        }
      } else {
        // User has designer role, verify they're approved in designers table
        try {
          const designerCheck = await fetch("/api/designers/by-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify({ email: userEmail }),
          });

          if (designerCheck.ok) {
            const designerData = await designerCheck.json();
            if (designerData.status !== 'approved') {
              throw new Error("Your designer account is pending approval. Please wait for admin approval.");
            }
          }
        } catch (checkError) {
          // If check fails, still allow login if role is designer (graceful degradation)
          console.warn("Failed to check designer status:", checkError);
        }
      }

      // Wait for session to be set
      await new Promise(resolve => setTimeout(resolve, 200));
      refetch();

      toast.success("Welcome back, designer!");
      router.push("/designers/dashboard");
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      {/* Header */}
      <section className="bg-secondary py-12">
        <div className="container mx-auto">
          <Link
            href="/designers"
            className="inline-flex items-center gap-2 text-body-small hover:underline mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Designers</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">DESIGNER LOGIN</h1>
          <p className="text-body-large text-muted-foreground max-w-2xl">
            Access your designer dashboard to manage your designs and contracts.
          </p>
        </div>
      </section>

      {/* Login Form */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-md">
          <div className="bg-white border border-border p-8">
            <div className="flex items-center justify-center mb-8">
              <LogIn className="w-12 h-12" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-label mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              {/* Password */}
              <div>
                <label htmlFor="password" className="block text-label mb-2">
                  PASSWORD
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  autoComplete="off"
                  className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive text-destructive text-body-small rounded-lg">
                  {error}
                </div>
              )}

              {/* Loading state */}
              {isPending && (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary" />
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="text-button-primary">
                  {loading ? "LOGGING IN..." : "LOGIN"}
                </span>
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-caption text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/designers/apply" className="underline hover:no-underline">
                  Apply to become a designer
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
