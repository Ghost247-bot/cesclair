"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight, Briefcase, ExternalLink } from "lucide-react";
import Footer from "@/components/sections/footer";

interface Designer {
  id: string | number; // Can be string (user.id) or number (designers.id)
  name: string;
  email: string;
  bio: string | null;
  portfolioUrl: string | null;
  specialties: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  status: string;
  createdAt: string;
}

export default function DesignersPage() {
  const [designers, setDesigners] = useState<Designer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDesigners() {
      try {
        const response = await fetch("/api/designers?limit=50");
        if (!response.ok) {
          throw new Error("Failed to fetch designers");
        }
        const data = await response.json();
        setDesigners(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDesigners();
  }, []);

  return (
    <>
    <main className="pt-[60px] md:pt-[64px] min-h-screen bg-background">
      {/* Hero Section */}
      <section className="bg-secondary py-16 md:py-24">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-6">
            <Users className="w-12 h-12" />
          </div>
          <h1 className="text-4xl md:text-5xl font-medium mb-6">OUR DESIGNERS</h1>
          <p className="text-body-large text-muted-foreground max-w-2xl mx-auto mb-8">
            Meet the talented designers who bring our collections to life. Each designer brings unique expertise and passion to create exceptional pieces.
          </p>
          <Link
            href="/designers/apply"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">BECOME A DESIGNER</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Designers Grid */}
      <section className="py-16 md:py-24">
        <div className="container mx-auto">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading designers...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-destructive mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 border border-primary hover:bg-secondary transition-colors"
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && designers.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground text-body-large">No designers available yet.</p>
            </div>
          )}

          {!loading && !error && designers.length > 0 && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {designers.map((designer) => (
                <div
                  key={designer.id}
                  className="bg-white border border-border overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Banner Image */}
                  {designer.bannerUrl ? (
                    <div className="relative w-full h-48 bg-secondary">
                      <Image
                        src={designer.bannerUrl}
                        alt={`${designer.name} banner`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gradient-to-br from-secondary to-accent-background" />
                  )}

                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4 -mt-12">
                      <div className="relative w-20 h-20 flex-shrink-0 border-4 border-white rounded-full bg-white">
                        {designer.avatarUrl ? (
                          <Image
                            src={designer.avatarUrl}
                            alt={designer.name}
                            fill
                            className="object-cover rounded-full"
                          />
                        ) : (
                          <div className="w-full h-full rounded-full bg-secondary flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 pt-12">
                        <h3 className="text-xl font-medium mb-1">{designer.name}</h3>
                        {designer.specialties && (
                          <p className="text-caption text-muted-foreground">
                            {designer.specialties}
                          </p>
                        )}
                      </div>
                    </div>

                    {designer.bio && (
                      <p className="text-body text-muted-foreground mb-4 line-clamp-3">
                        {designer.bio}
                      </p>
                    )}

                    <div className="flex items-center justify-between pt-4 border-t border-border">
                      {designer.portfolioUrl ? (
                        <a
                          href={designer.portfolioUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white hover:bg-primary/90 transition-colors text-body-small rounded"
                        >
                          <Briefcase className="w-4 h-4" />
                          <span>View Portfolio</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-body-small text-muted-foreground">No portfolio</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 md:py-24 bg-gradient-to-br from-accent to-accent-background text-center">
        <div className="container mx-auto max-w-3xl">
          <h2 className="text-3xl md:text-4xl font-medium mb-6">Join Our Designer Network</h2>
          <p className="text-body-large text-muted-foreground mb-8">
            Are you a talented designer looking to showcase your work? Apply to join our designer community and collaborate on exciting projects.
          </p>
          <Link
            href="/designers/apply"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            <span className="text-button-primary">APPLY NOW</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </main>
    <Footer />
    </>
  );
}
