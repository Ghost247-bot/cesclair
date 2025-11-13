import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';
  const currentDate = new Date();

  // Static pages
  const staticPages = [
    '',
    '/about',
    '/accessibility',
    '/affiliates',
    '/careers',
    '/dei',
    '/factories',
    '/help',
    '/impact-report',
    '/international',
    '/privacy',
    '/returns',
    '/shipping',
    '/stores',
    '/supply-chain',
    '/sustainability',
    '/terms',
    '/vendor-code',
    '/designers',
    '/designers/apply',
    '/designers/login',
    '/cesworld',
    '/cesworld/login',
    '/cesworld/register',
    '/everworld',
    '/everworld/login',
    '/everworld/register',
  ];

  // Collection pages
  const collectionPages = [
    '/collections/black-friday-preview',
    '/collections/gift-guide',
    '/collections/holiday-edit',
    '/collections/holiday-outfitting',
    '/collections/sweater-shop',
    '/collections/womens-best-sellers',
    '/collections/womens-new-arrivals',
  ];

  // Category pages - Women
  const womenCategories = [
    '/women/accessories',
    '/women/activewear',
    '/women/bags',
    '/women/basics',
    '/women/best-sellers',
    '/women/cashmere',
    '/women/denim',
    '/women/dresses',
    '/women/matching-sets',
    '/women/new-arrivals',
    '/women/outerwear',
    '/women/pants',
    '/women/sale',
    '/women/shoes',
    '/women/socks-underwear',
    '/women/sweaters',
    '/women/tees-tops',
  ];

  // Category pages - Men
  const menCategories = [
    '/men/accessories',
    '/men/activewear',
    '/men/bags',
    '/men/basics',
    '/men/best-sellers',
    '/men/cashmere',
    '/men/denim',
    '/men/gifts',
    '/men/new-arrivals',
    '/men/outerwear',
    '/men/pants',
    '/men/sale',
    '/men/shoes',
    '/men/sweaters',
    '/men/tees-tops',
  ];

  // Combine all static routes
  const allRoutes = [
    ...staticPages,
    ...collectionPages,
    ...womenCategories,
    ...menCategories,
  ];

  // Generate sitemap entries
  const sitemapEntries: MetadataRoute.Sitemap = allRoutes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: currentDate,
    changeFrequency: route.includes('/products/') ? 'daily' : 'weekly',
    priority: route === '' ? 1.0 : route.includes('/collections/') || route.includes('/women/') || route.includes('/men/') ? 0.8 : 0.6,
  }));

  return sitemapEntries;
}

