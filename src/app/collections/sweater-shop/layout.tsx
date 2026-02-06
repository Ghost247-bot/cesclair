import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Sweater Shop',
  description: 'Shop our collection of premium sweaters for men and women. Find cozy cashmere, wool, and sustainable sweater options at Cesclair.',
  keywords: ['sweaters', 'cashmere sweaters', 'wool sweaters', 'men sweaters', 'women sweaters', 'sustainable sweaters', 'Cesclair'],
  url: '/collections/sweater-shop',
});

export default function SweaterShopLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

