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
    <div className="min-h-screen bg-white pt-[60px] md:pt-[64px]">
      {/* Header */}
      <div className="border-b border-gray-200">
        <div className="container mx-auto px-4 py-4">
          <Link
            href="/hairstylists"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-serif tracking-wide">Back to Hairstylists</span>
          </Link>
        </div>
      </div>

      {/* Login Section */}
      <div className="min-h-[calc(100vh-73px)] flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          {/* Logo/Icon */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Scissors className="w-10 h-10 text-gray-600" />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif font-light text-gray-900 mb-2">
              Hairstylist Login
            </h1>
            <p className="text-gray-600 font-serif italic">
              Access your portfolio and manage your profile
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-serif"
                required
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 font-serif">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent font-serif"
                required
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <p className="text-red-600 text-sm font-serif">{error}</p>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 text-white py-3 px-4 rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-serif tracking-wide flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  Sign In
                </>
              )}
            </button>
          </form>

          {/* Footer Links */}
          <div className="mt-8 text-center space-y-4">
            <p className="text-sm text-gray-600 font-serif">
              Don't have an account yet?
            </p>
            <div className="space-y-2">
              <Link
                href="/hairstylists/register"
                className="block text-gray-900 hover:text-gray-700 font-serif underline"
              >
                Create a stylist account
              </Link>
              <Link
                href="/hairstylists/forgot-password"
                className="block text-gray-900 hover:text-gray-700 font-serif underline"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="text-center space-y-4">
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <UserCircle className="w-5 h-5" />
                <span className="text-sm font-serif">Secure Login</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <Sparkles className="w-5 h-5" />
                <span className="text-sm font-serif">Portfolio Management</span>
              </div>
              <div className="flex items-center justify-center gap-4 text-gray-400">
                <Briefcase className="w-5 h-5" />
                <span className="text-sm font-serif">Professional Tools</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
