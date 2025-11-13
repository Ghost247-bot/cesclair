# SEO Setup Guide

This document outlines the comprehensive SEO implementation for Cesclair.

## ✅ Implemented Features

### 1. Enhanced Root Layout Metadata
- **Location**: `src/app/layout.tsx`
- **Features**:
  - Dynamic title template (`%s | Cesclair`)
  - Comprehensive meta description
  - Keywords array
  - Open Graph tags for social sharing
  - Twitter Card support
  - Robots directives
  - Canonical URLs
  - Author and publisher information

### 2. Dynamic Sitemap
- **Location**: `src/app/sitemap.ts`
- **Features**:
  - Automatically generates sitemap from all routes
  - Includes static pages, collections, and categories
  - Proper priority and change frequency settings
  - Accessible at `/sitemap.xml`

### 3. Robots.txt
- **Location**: `src/app/robots.ts`
- **Features**:
  - Allows all public pages
  - Blocks admin, account, and dashboard pages
  - Points to sitemap
  - Accessible at `/robots.txt`

### 4. Structured Data (JSON-LD)
- **Location**: `src/components/seo/structured-data.tsx`
- **Features**:
  - Organization schema
  - Website schema with search action
  - Product schema helper
  - Breadcrumb schema helper
  - Automatically included in root layout

### 5. SEO Helper Utilities
- **Location**: `src/lib/seo.ts`
- **Features**:
  - `generateMetadata()` - Creates comprehensive metadata objects
  - `generateOrganizationSchema()` - Organization structured data
  - `generateWebsiteSchema()` - Website structured data
  - `generateProductSchema()` - Product structured data
  - `generateBreadcrumbSchema()` - Breadcrumb structured data

### 6. Page-Specific Metadata
- **Product Pages**: Dynamic metadata based on product data
- **About Page**: SEO-optimized metadata
- **Designers Page**: Metadata for designer listings

## 📋 Next Steps

### 1. Add Metadata to More Pages
Update these pages with proper metadata:
- Collection pages (`/collections/*`)
- Category pages (`/women/*`, `/men/*`)
- Other static pages

Example:
```typescript
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Page Title',
  description: 'Page description',
  keywords: ['keyword1', 'keyword2'],
  url: '/page-url',
});
```

### 2. Add Product Structured Data
Update product pages to include product structured data:

```typescript
import { ProductStructuredData } from '@/components/seo/structured-data';

// In your product page component:
<ProductStructuredData
  product={{
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    price: product.price,
    currency: 'USD',
    sku: product.sku,
    availability: product.stock > 0 ? 'InStock' : 'OutOfStock',
    brand: 'Cesclair',
  }}
/>
```

### 3. Add Breadcrumbs
Add breadcrumb structured data to category and product pages:

```typescript
import { BreadcrumbStructuredData } from '@/components/seo/structured-data';

<BreadcrumbStructuredData
  items={[
    { name: 'Home', url: '/' },
    { name: 'Women', url: '/women' },
    { name: 'Sweaters', url: '/women/sweaters' },
  ]}
/>
```

### 4. Add Social Media Links
Update `src/lib/seo.ts` with actual social media URLs:
- Facebook
- Instagram
- Twitter/X
- LinkedIn

### 5. Add Verification Codes
Add search engine verification codes in `src/app/layout.tsx`:
- Google Search Console
- Bing Webmaster Tools
- Yandex Webmaster

### 6. Optimize Images
- Ensure all images have proper alt text
- Use Next.js Image component for optimization
- Add image dimensions for better SEO

### 7. Add Analytics
Consider adding:
- Google Analytics 4
- Google Tag Manager
- Facebook Pixel (if using Facebook ads)

## 🔍 SEO Checklist

- [x] Meta titles and descriptions
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Sitemap.xml
- [x] Robots.txt
- [x] Structured data (Organization, Website)
- [x] Canonical URLs
- [x] Mobile-friendly (responsive design)
- [ ] Product structured data (needs implementation on product pages)
- [ ] Breadcrumb structured data (needs implementation)
- [ ] Page speed optimization
- [ ] Image optimization and alt text
- [ ] Internal linking strategy
- [ ] Content optimization

## 📊 Testing

### Test Your SEO
1. **Google Search Console**: Submit sitemap at `/sitemap.xml`
2. **Rich Results Test**: https://search.google.com/test/rich-results
3. **PageSpeed Insights**: https://pagespeed.web.dev/
4. **Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly

### Validate Structured Data
- Use Google's Rich Results Test
- Use Schema.org validator
- Check in browser DevTools (Network tab for JSON-LD scripts)

## 🚀 Deployment

After deployment:
1. Submit sitemap to Google Search Console
2. Submit sitemap to Bing Webmaster Tools
3. Verify robots.txt is accessible
4. Test all metadata with social media debuggers:
   - Facebook Sharing Debugger
   - Twitter Card Validator
   - LinkedIn Post Inspector

## 📝 Notes

- All metadata uses environment variable `NEXT_PUBLIC_SITE_URL` for URLs
- Default fallback is `https://cesclair.store`
- Structured data is automatically included on all pages via root layout
- Sitemap and robots.txt are automatically generated by Next.js

