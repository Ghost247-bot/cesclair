"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Scissors, ImageIcon, UserCircle, Sparkles, Briefcase, LogIn } from "lucide-react";
import { toast } from "sonner";

export default function HairstylistLoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/hairstylists/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      toast.success("Welcome back!");
      router.push("/hairstylists/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "An error occurred";
      setError(message);
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      <section className="bg-secondary py-12">
        <div className="container mx-auto px-4">
          <Link
            href="/hairstylists"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Hairstylists
          </Link>
          <h1 className="text-4xl md:text-5xl font-medium mb-4">HAIRSTYLIST LOGIN</h1>
          <p className="text-muted-foreground max-w-2xl">
            Access your hairstylist dashboard to manage your portfolio and profile.
          </p>
        </div>
      </section>

      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-md px-4">
          <div className="bg-white border border-border rounded-lg p-8">
            <div className="flex items-center justify-center mb-8">
              <Scissors className="w-12 h-12 text-primary" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                  EMAIL ADDRESS
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="your.email@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium mb-2">
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
                  className="w-full px-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Enter your password"
                />
              </div>

              {error && (
                <div className="p-4 bg-destructive/10 border border-destructive text-destructive text-sm rounded-lg">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full px-8 py-4 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    LOGGING IN...
                  </span>
                ) : (
                  "LOGIN"
                )}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-muted-foreground">
              Contact an administrator to get a hairstylist account.
            </p>
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="py-16 md:py-24 bg-secondary">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="text-2xl md:text-3xl font-medium mb-10 text-center">What you get as a hairstylist</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <ImageIcon className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Portfolio</h3>
              <p className="text-sm text-muted-foreground">Showcase your work and attract more clients.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <UserCircle className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Profile</h3>
              <p className="text-sm text-muted-foreground">Manage your bio, contact info, and visibility.</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary mb-4">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-medium mb-2">Visibility</h3>
              <p className="text-sm text-muted-foreground">Get discovered on our hairstylists directory.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Other ways to sign in */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto px-4 max-w-md text-center">
          <h2 className="text-xl font-medium mb-4">Other ways to sign in</h2>
          <p className="text-muted-foreground text-sm mb-6">Are you a designer or a member? Use the right login below.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/designers/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
            >
              <Briefcase className="w-4 h-4" />
              <span>Designer Login</span>
            </Link>
            <Link
              href="/cesworld/login"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border hover:bg-secondary transition-colors"
            >
              <LogIn className="w-4 h-4" />
              <span>Member Login</span>
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
