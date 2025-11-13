import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'About Us',
  description: 'Learn about Cesclair - our mission, values, and commitment to sustainable fashion. Discover how we create modern, ethical fashion for everyone.',
  keywords: ['about Cesclair', 'sustainable fashion', 'ethical fashion', 'company mission', 'fashion brand'],
  url: '/about',
});

// This is a placeholder - replace with actual about page content
export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background pt-[60px] md:pt-[64px]">
      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-6">About Cesclair</h1>
        <p className="text-lg text-muted-foreground">
          Content coming soon...
              </p>
            </div>
          </div>
  );
}
