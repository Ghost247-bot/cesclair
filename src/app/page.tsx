"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/lib/auth-client";
import AnnouncementBar from "@/components/sections/announcement-bar";
import HeroSection from "@/components/sections/hero-section";
import CategoryGrid from "@/components/sections/category-grid";
import VideoFeatureHome from "@/components/sections/video-feature-home";
import SplitFeatureSweaters from "@/components/sections/split-feature-sweaters";
import VideoFeatureBottomLine from "@/components/sections/video-feature-bottom-line";
import ContentGrid from "@/components/sections/content-grid";
import SustainabilityBanner from "@/components/sections/sustainability-banner";
import Footer from "@/components/sections/footer";

export default function Home() {
  const router = useRouter();
  const { data: session, isPending } = useSession();

  // Redirect authenticated users based on role
  useEffect(() => {
    if (!isPending && session?.user) {
      const role = (session.user as any)?.role || 'member';
      const userEmail = session.user.email;
      
      // Check if user is in designers table
      if (userEmail) {
        fetch(`/api/designers/by-email?email=${encodeURIComponent(userEmail)}`)
          .then(res => res.json())
          .then(data => {
            if (data.exists && data.status === 'approved') {
              router.push("/designers/dashboard");
              return;
            }
            
            // If not a designer, check role
            if (role === 'admin') {
        router.push("/admin");
      } else if (role === 'member') {
        // Members can stay on home page, no redirect needed
            }
          })
          .catch(() => {
            // On error, fall back to role check
            if (role === 'designer') {
              router.push("/designers/dashboard");
            } else if (role === 'admin') {
              router.push("/admin");
            }
          });
      } else {
        // No email, use role check
        if (role === 'designer') {
          router.push("/designers/dashboard");
        } else if (role === 'admin') {
          router.push("/admin");
        }
      }
    }
  }, [session, isPending, router]);

  // Show loading state while checking session
  if (isPending) {
    return (
      <main className="min-h-screen bg-background pt-[60px] md:pt-[64px] flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </main>
    );
  }

  // If user is authenticated and not a member, the redirect will happen
  // For members or unauthenticated users, show the home page
  return (
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      <AnnouncementBar />
      
      <HeroSection />
      
      <CategoryGrid />
      
      <VideoFeatureHome />
      
      <div className="grid grid-cols-1 md:grid-cols-2">
        <SplitFeatureSweaters />
        <VideoFeatureBottomLine />
      </div>
      
      <ContentGrid />
      
      <SustainabilityBanner />
      
      <Footer />
    </main>
  );
}