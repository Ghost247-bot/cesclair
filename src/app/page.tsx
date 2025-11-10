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