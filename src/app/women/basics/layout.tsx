import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: "Women's Basics",
  description: "Shop women's basics including socks, underwear, and everyday essentials. High-quality, sustainable basics at Cesclair.",
  keywords: ['women basics', 'socks', 'underwear', 'women essentials', 'everyday basics', 'Cesclair'],
  url: '/women/basics',
});

export default function WomenBasicsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

