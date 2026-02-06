import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Men's Basics",
  description: "Shop men's basics including socks, underwear, and everyday essentials. High-quality, sustainable basics at Cesclair.",
  keywords: ['men basics', 'socks', 'underwear', 'men essentials', 'everyday basics', 'Cesclair'],
  url: '/men/basics',
});

export default function MenBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

