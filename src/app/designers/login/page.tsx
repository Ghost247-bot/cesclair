"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LogIn } from "lucide-react";
import Footer from "@/components/sections/footer";

export default function DesignerLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const response = await fetch("/api/designers/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Store designer info in localStorage
      localStorage.setItem("designer", JSON.stringify(data.designer));
      
      // Redirect to dashboard
      router.push("/designers/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
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
                <div className="p-4 bg-destructive/10 border border-destructive text-destructive text-body-small">
                  {error}
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
