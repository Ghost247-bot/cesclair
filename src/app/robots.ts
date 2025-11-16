import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://cesclair.store';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/account/',
          '/designers/dashboard',
          '/cesworld/dashboard',
          '/Cesworld/dashboard',
          '/checkout/',
          '/cart',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin',
          '/account/',
          '/designers/dashboard',
          '/cesworld/dashboard',
          '/Cesworld/dashboard',
          '/checkout/',
          '/cart',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}

