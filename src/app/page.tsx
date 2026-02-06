import { Suspense } from "react";
import AnnouncementBar from "@/components/sections/announcement-bar";
import HeroSection from "@/components/sections/hero-section";
import { SkeletonImage } from "@/components/skeleton-loaders";
import HomeRedirect from "@/components/home-redirect";

// Lazy-loaded below-the-fold sections
import dynamic from "next/dynamic";
const CategoryGrid = dynamic(() => import("@/components/sections/category-grid"));
const VideoFeatureHome = dynamic(() => import("@/components/sections/video-feature-home"));
const SplitFeatureSweaters = dynamic(() => import("@/components/sections/split-feature-sweaters"));
const VideoFeatureBottomLine = dynamic(() => import("@/components/sections/video-feature-bottom-line"));
const ContentGrid = dynamic(() => import("@/components/sections/content-grid"));
const SustainabilityBanner = dynamic(() => import("@/components/sections/sustainability-banner"));

export default function Home() {
  return (
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      {/* Client component handles role-based redirect without blocking render */}
      <HomeRedirect />

      <AnnouncementBar />
      <HeroSection />

      <Suspense fallback={<SkeletonImage />}>
        <CategoryGrid />
      </Suspense>

      <Suspense fallback={<SkeletonImage />}>
        <VideoFeatureHome />
      </Suspense>

      <div className="grid grid-cols-1 md:grid-cols-2">
        <Suspense fallback={<SkeletonImage />}>
          <SplitFeatureSweaters />
        </Suspense>
        <Suspense fallback={<SkeletonImage />}>
          <VideoFeatureBottomLine />
        </Suspense>
      </div>

      <Suspense fallback={<SkeletonImage />}>
        <ContentGrid />
      </Suspense>

      <Suspense fallback={<SkeletonImage />}>
        <SustainabilityBanner />
      </Suspense>
    </main>
  );
}
