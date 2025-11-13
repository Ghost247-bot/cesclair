import { Metadata } from 'next';
import ProductDetailPageClient from './page-client';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

interface PageProps {
  params: Promise<{ id: string }>;
}

async function getProduct(id: string) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';
    const response = await fetch(`${baseUrl}/api/products/${id}`, {
      cache: 'no-store',
    });
    
    if (!response.ok) {
      return null;
    }
    
    return await response.json();
  } catch (error) {
    return null;
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    return {
      title: 'Product Not Found',
      description: 'The product you are looking for could not be found.',
    };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';
  const productUrl = `${siteUrl}/products/${id}`;
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
    url: `/products/${id}`,
    type: 'product',
  });
}

export default async function ProductDetailPage({ params }: PageProps) {
  return <ProductDetailPageClient />;
}
