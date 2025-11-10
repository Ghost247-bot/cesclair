"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Send } from "lucide-react";
import Footer from "@/components/sections/footer";

export default function DesignerApplicationPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    bio: "",
    portfolioUrl: "",
    specialties: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
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

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    // Validate password length
    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/designers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password,
          bio: formData.bio,
          portfolioUrl: formData.portfolioUrl,
          specialties: formData.specialties,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit application");
      }

      setSuccess(true);
      setTimeout(() => {
        router.push("/designers");
      }, 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto max-w-2xl text-center py-16">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
            <Send className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl md:text-4xl font-medium mb-4">Application Submitted!</h1>
          <p className="text-body-large text-muted-foreground mb-8">
            Thank you for applying to become a designer. Your application is under review and you'll hear from us soon.
          </p>
          <Link
            href="/designers"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">VIEW ALL DESIGNERS</span>
          </Link>
        </div>
      </main>
    );
  }

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
          <h1 className="text-4xl md:text-5xl font-medium mb-4">DESIGNER APPLICATION</h1>
          <p className="text-body-large text-muted-foreground max-w-2xl">
            Join our talented community of designers. Fill out the form below to submit your application.
          </p>
        </div>
      </section>

      {/* Application Form */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-label mb-2">
                FULL NAME *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your full name"
              />
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-label mb-2">
                EMAIL ADDRESS *
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
                PASSWORD *
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
                placeholder="At least 6 characters"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="confirmPassword" className="block text-label mb-2">
                CONFIRM PASSWORD *
              </label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                autoComplete="off"
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Re-enter your password"
              />
            </div>

            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-label mb-2">
                BIO
              </label>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Tell us about your design experience and background..."
              />
            </div>

            {/* Portfolio URL */}
            <div>
              <label htmlFor="portfolioUrl" className="block text-label mb-2">
                PORTFOLIO URL
              </label>
              <input
                type="url"
                id="portfolioUrl"
                name="portfolioUrl"
                value={formData.portfolioUrl}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://yourportfolio.com"
              />
            </div>

            {/* Specialties */}
            <div>
              <label htmlFor="specialties" className="block text-label mb-2">
                SPECIALTIES
              </label>
              <input
                type="text"
                id="specialties"
                name="specialties"
                value={formData.specialties}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-border focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g., knitwear, denim, accessories (comma-separated)"
              />
              <p className="text-caption text-muted-foreground mt-1">
                Enter your design specialties separated by commas
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-4 bg-destructive/10 border border-destructive text-destructive">
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
                {loading ? "SUBMITTING..." : "SUBMIT APPLICATION"}
              </span>
            </button>

            <p className="text-caption text-muted-foreground text-center">
              Already have an account?{" "}
              <Link href="/designers/login" className="underline hover:no-underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
