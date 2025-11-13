"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { Users, ArrowRight, Briefcase } from "lucide-react";
import Footer from "@/components/sections/footer";

interface Designer {
  id: number; // Designer ID from designers table
  name: string;
  email: string;
  bio: string | null;
  portfolioUrl: string | null;
  specialties: string | null;
  avatarUrl: string | null;
  bannerUrl: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
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
        setDesigners(data.designers || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred");
      } finally {
        setLoading(false);
      }
    }

    fetchDesigners();
  }, []);

  // API already returns only approved designers, but keep filter as safety
  const approvedDesigners = designers.filter((d) => d.status === "approved");

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Background Image */}
      <section className="relative py-16 md:py-24 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url('/uploads/ChatGPT Image Nov 12, 2025, 11_03_48 AM.png')`
          }}
        />
        {/* Overlay for better text readability */}
        <div className="absolute inset-0 bg-white/60" />
        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Our Designers</h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover talented fashion designers and creators shaping the future of sustainable fashion
          </p>
        </div>
      </section>

      {/* Designers Grid */}
      <section className="container mx-auto py-12 px-4">
        {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
              <p className="mt-4 text-muted-foreground">Loading designers...</p>
            </div>
        ) : error ? (
          <div className="text-center py-12">
            <p className="text-destructive">Error: {error}</p>
          </div>
        ) : approvedDesigners.length === 0 ? (
            <div className="text-center py-12">
            <Users className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h2 className="text-2xl font-semibold mb-2">No Designers Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon to discover our talented designers
            </p>
            <Link
              href="/designers/apply"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
              Become a Designer
              <ArrowRight className="w-4 h-4" />
            </Link>
            </div>
        ) : (
          <>
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-2">
                Featured Designers ({approvedDesigners.length})
              </h2>
              <p className="text-muted-foreground">
                Explore portfolios and connect with our talented designers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {approvedDesigners.map((designer) => (
                <Link
                  key={designer.id}
                  href={`/designers/${designer.id}`}
                  className="group bg-card border border-border rounded-lg overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {/* Banner Image */}
                  <div className="relative h-48 bg-secondary overflow-hidden">
                  {designer.bannerUrl ? (
                      <Image
                        src={designer.bannerUrl}
                        alt={`${designer.name} banner`}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Briefcase className="w-16 h-16 text-muted-foreground" />
                    </div>
                  )}
                  </div>

                  {/* Designer Info */}
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      {/* Avatar */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-border flex-shrink-0">
                        {designer.avatarUrl ? (
                          <Image
                            src={designer.avatarUrl}
                            alt={designer.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-secondary flex items-center justify-center">
                            <Users className="w-8 h-8 text-muted-foreground" />
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                          {designer.name}
                        </h3>
                        {designer.specialties && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {designer.specialties}
                          </p>
                        )}
                      </div>
                    </div>

                    {designer.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                        {designer.bio}
                      </p>
                    )}

                    <div className="flex items-center text-sm text-primary group-hover:underline">
                      View Portfolio
                      <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Call to Action */}
            <div className="mt-12 text-center bg-secondary rounded-lg p-8">
              <h2 className="text-2xl font-semibold mb-2">Are You a Designer?</h2>
              <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                Join our community of talented designers and showcase your work to a global audience
          </p>
          <Link
            href="/designers/apply"
                className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
                Apply to Become a Designer
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
          </>
        )}
      </section>

    <Footer />
    </div>
  );
}
