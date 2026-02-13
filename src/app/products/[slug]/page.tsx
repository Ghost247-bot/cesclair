import { Metadata } from 'next';
import ProductDetailPageClient from './page-client';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ slug: string }>;
}

async function getProduct(slug: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';
    // Try slug-based API first, then fallback to ID
    const response = await fetch(`${baseUrl}/api/products/slug/${slug}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      // If slug fails, try ID as fallback
      const idResponse = await fetch(`${baseUrl}/api/products/${slug}`, {
        cache: 'no-store',
      });
      
      if (!idResponse.ok) {
        return null;
      }
      
      return await idResponse.json();
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';
  const productUrl = product.slug ? `${siteUrl}/products/${product.slug}` : `${siteUrl}/products/${slug}`;
  const productImage = product.imageUrl || `${siteUrl}/icon.png`;

  return generateSEOMetadata({
    title: product.name,
    description: product.description || `Shop ${product.name} at Cesclair. ${product.category ? `Category: ${product.category}.` : ''} High-quality fashion for everyone.`,
    keywords: [
      product.name,
      product.category || 'fashion',
      'Cesclair',
      'clothing',
      'fashion',
    ],
    image: productImage,
    url: product.slug ? `/products/${product.slug}` : `/products/${slug}`,
    type: 'website',
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  return <ProductDetailPageClient />;
}
