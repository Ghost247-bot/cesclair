"use client";

import { useEffect, useRef } from "react";
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
  const redirectChecked = useRef(false);

  // Anti-clone protection: Disable right-click, text selection, and dev tools
  useEffect(() => {
    // Disable right-click
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      return false;
    };

    // Disable text selection
    const handleSelectStart = (e: Event) => {
      e.preventDefault();
      return false;
    };

    // Disable common keyboard shortcuts for dev tools
    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && (e.key === 'U' || e.key === 'S' || e.key === 'P'))
      ) {
        e.preventDefault();
        return false;
      }
    };

    // Disable drag
    const handleDragStart = (e: DragEvent) => {
      e.preventDefault();
      return false;
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('selectstart', handleSelectStart);
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('dragstart', handleDragStart);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('selectstart', handleSelectStart);
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('dragstart', handleDragStart);
    };
  }, []);

  // Optimized redirect logic - only check role from session, skip API call
  useEffect(() => {
    if (redirectChecked.current || isPending) return;
    
    if (session?.user) {
      redirectChecked.current = true;
      const role = (session.user as any)?.role || 'member';
      
      // Only redirect based on role in session - no API call needed
      // The middleware and page components will handle designer status checks
      if (role === 'designer') {
        router.push("/designers/dashboard");
      } else if (role === 'admin') {
        router.push("/admin");
      }
      // Members and unauthenticated users can stay on home page
    }
  }, [session, isPending, router]);

  // Show loading state only briefly while checking session
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
    <main className="min-h-screen bg-background pt-[60px] md:pt-[64px] select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none' }}>
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