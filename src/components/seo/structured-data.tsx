import Script from 'next/script';
import { generateOrganizationSchema, generateWebsiteSchema } from '@/lib/seo';

export function StructuredData() {
  const organizationSchema = generateOrganizationSchema();
  const websiteSchema = generateWebsiteSchema();

  return (
    <>
      <Script
        id="organization-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <Script
        id="website-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}

export function ProductStructuredData({
  product,
}: {
  product: {
    name: string;
    description: string;
    image?: string;
    price?: string;
    currency?: string;
    sku?: string;
    availability?: string;
    brand?: string;
  };
}) {
  const { generateProductSchema } = require('@/lib/seo');
  const productSchema = generateProductSchema(product);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
    />
  );
}

export function BreadcrumbStructuredData({
  items,
}: {
  items: { name: string; url: string }[];
}) {
  const { generateBreadcrumbSchema } = require('@/lib/seo');
  const breadcrumbSchema = generateBreadcrumbSchema(items);

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
    />
  );
}

