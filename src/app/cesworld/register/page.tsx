"use client";

import { useState, useEffect } from "react";
import { authClient, useSession } from "@/lib/auth-client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Footer from "@/components/sections/footer";

export default function CesworldRegister() {
  const router = useRouter();
  const { data: session, isPending, refetch } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    birthdayMonth: "",
    birthdayDay: "",
    agreeToTerms: false,
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      setIsLoading(false);
      return;
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      toast.error("Please agree to the terms and conditions");
      setIsLoading(false);
      return;
    }

    try {
      // Register user with better-auth
      const { error } = await authClient.signUp.email({
        email: formData.email,
        name: formData.name,
        password: formData.password,
      });

      if (error?.code) {
        const errorMap: Record<string, string> = {
          USER_ALREADY_EXISTS: "An account with this email already exists",
        };
        toast.error(errorMap[error.code] || "Registration failed. Please try again.");
        setIsLoading(false);
        return;
      }

      // Auto-login after registration
      const { error: loginError } = await authClient.signIn.email({
        email: formData.email,
        password: formData.password,
      });

      if (loginError?.code) {
        toast.error("Account created but login failed. Please try logging in manually.");
        router.push("/cesworld/login?registered=true");
        return;
      }

      // Wait for session to be set
      await new Promise(resolve => setTimeout(resolve, 200));

      // Refetch session to get user data
      refetch();

      toast.success("Account created successfully!");

      // Create Cesworld member profile for all new registrations
      try {
        // Wait a bit more for session to be fully set
        await new Promise(resolve => setTimeout(resolve, 300));
        
        // Try to get session from authClient first
        const currentSession = await authClient.getSession();
        const userId = currentSession?.data?.user?.id;

        if (userId) {
          // Create Cesworld member profile
          const memberData: any = {
            userId: userId,
          };

          // Add birthday if provided
          if (formData.birthdayMonth && formData.birthdayDay) {
            memberData.birthdayMonth = parseInt(formData.birthdayMonth);
            memberData.birthdayDay = parseInt(formData.birthdayDay);
          }

          await fetch("/api/cesworld/members", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: 'include',
            body: JSON.stringify(memberData),
          });
        } else {
          // Fallback: try to fetch from check-role endpoint
          const sessionRes = await fetch("/api/auth/check-role", {
            credentials: 'include',
          });

          if (sessionRes.ok) {
            const sessionData = await sessionRes.json();
            const fallbackUserId = sessionData?.user?.id;

            if (fallbackUserId) {
              const memberData: any = {
                userId: fallbackUserId,
              };

              if (formData.birthdayMonth && formData.birthdayDay) {
                memberData.birthdayMonth = parseInt(formData.birthdayMonth);
                memberData.birthdayDay = parseInt(formData.birthdayDay);
              }

              await fetch("/api/cesworld/members", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                credentials: 'include',
                body: JSON.stringify(memberData),
              });
            }
          }
        }
      } catch (error) {
        console.error('Error creating member profile:', error);
        // Continue with redirect even if member profile creation fails
      }

      // All new registrations are members - redirect to member dashboard
      router.push("/cesworld/dashboard");
    } catch (error) {
      console.error("Registration error:", error);
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
            <h1 className="text-3xl md:text-4xl font-medium mb-4">JOIN CESCLAIR WORLD</h1>
            <p className="text-body text-muted-foreground">
              Sign up for free and start earning points on every purchase
            </p>
          </div>

          {/* Registration Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-label mb-2">
                FULL NAME
              </label>
              <input
                id="name"
                type="text"
                required
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="John Doe"
              />
            </div>

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
              <input
                id="password"
                type="password"
                required
                autoComplete="off"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="At least 8 characters"
              />
              <p className="mt-1 text-caption text-muted-foreground">
                Must be at least 8 characters long
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-label mb-2">
                CONFIRM PASSWORD
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                autoComplete="off"
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData({ ...formData, confirmPassword: e.target.value })
                }
                className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Birthday (Optional) */}
            <div>
              <label className="block text-label mb-2">
                BIRTHDAY (OPTIONAL)
              </label>
              <p className="text-caption text-muted-foreground mb-3">
                Receive a special gift on your birthday
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    id="birthdayMonth"
                    value={formData.birthdayMonth}
                    onChange={(e) =>
                      setFormData({ ...formData, birthdayMonth: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Month</option>
                    <option value="1">January</option>
                    <option value="2">February</option>
                    <option value="3">March</option>
                    <option value="4">April</option>
                    <option value="5">May</option>
                    <option value="6">June</option>
                    <option value="7">July</option>
                    <option value="8">August</option>
                    <option value="9">September</option>
                    <option value="10">October</option>
                    <option value="11">November</option>
                    <option value="12">December</option>
                  </select>
                </div>
                <div>
                  <select
                    id="birthdayDay"
                    value={formData.birthdayDay}
                    onChange={(e) =>
                      setFormData({ ...formData, birthdayDay: e.target.value })
                    }
                    className="w-full px-4 py-3 border border-input focus:outline-none focus:ring-1 focus:ring-ring"
                  >
                    <option value="">Day</option>
                    {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                      <option key={day} value={day}>
                        {day}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-start">
              <input
                id="agreeToTerms"
                type="checkbox"
                checked={formData.agreeToTerms}
                onChange={(e) =>
                  setFormData({ ...formData, agreeToTerms: e.target.checked })
                }
                className="w-4 h-4 mt-1 border-input focus:ring-ring"
                required
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-body-small">
                I agree to the{" "}
                <Link href="/terms" className="underline hover:text-primary">
                  Terms of Service
                </Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-primary">
                  Privacy Policy
                </Link>
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
                  <span className="text-button-primary">CREATING ACCOUNT...</span>
                </>
              ) : (
                <>
                  <span className="text-button-primary">CREATE ACCOUNT</span>
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
                  Already a member?
                </span>
              </div>
            </div>
          </div>

          {/* Login Link */}
          <div className="text-center">
            <Link
              href="/cesworld/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 border border-primary text-primary hover:bg-secondary transition-colors"
            >
              <span className="text-button-primary">SIGN IN</span>
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