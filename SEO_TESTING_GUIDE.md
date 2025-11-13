# SEO Testing Guide

Complete guide for testing and verifying your SEO implementation.

## ✅ Step 1: Test the Sitemap

### Local Testing
1. Start your development server: `npm run dev`
2. Visit: `http://localhost:3000/sitemap.xml`
3. Verify all pages are listed correctly
4. Check that URLs are properly formatted

### Production Testing
1. Visit: `https://cesclair.store/sitemap.xml`
2. Verify the sitemap is accessible
3. Check that all important pages are included
4. Ensure URLs use HTTPS and correct domain

### Expected Output
The sitemap should show:
- All static pages (about, contact, etc.)
- All collection pages
- All category pages (women/men)
- Proper priority and change frequency
- Last modified dates

## ✅ Step 2: Submit to Google Search Console

### Setup Google Search Console
1. **Go to Google Search Console**: https://search.google.com/search-console
2. **Add Property**: Click "Add Property"
3. **Choose Property Type**: Select "URL prefix"
4. **Enter URL**: `https://cesclair.store`
5. **Verify Ownership**: 
   - Option 1: HTML file upload (download and upload to `public/` folder)
   - Option 2: HTML tag (add to `src/app/layout.tsx` in verification section)
   - Option 3: DNS record (add TXT record to your domain)

### Submit Sitemap
1. Once verified, go to **Sitemaps** in the left menu
2. Enter: `sitemap.xml`
3. Click **Submit**
4. Wait for Google to process (usually 24-48 hours)

### Monitor Indexing
1. Check **Coverage** report for indexing status
2. Review **Performance** for search queries
3. Monitor **Enhancements** for structured data

## ✅ Step 3: Test Structured Data

### Google Rich Results Test
1. **Visit**: https://search.google.com/test/rich-results
2. **Enter URL**: `https://cesclair.store`
3. **Click "Test URL"**
4. **Verify**:
   - Organization schema is detected
   - Website schema is detected
   - No errors are shown

### Schema.org Validator
1. **Visit**: https://validator.schema.org/
2. **Enter URL**: `https://cesclair.store`
3. **Check** for any validation errors

### Manual Verification
1. **View Page Source**: Right-click → View Page Source
2. **Search for**: `application/ld+json`
3. **Verify** JSON-LD scripts are present
4. **Check** that schemas are valid JSON

### Expected Structured Data
You should see:
- **Organization** schema with company info
- **WebSite** schema with search action
- **Product** schema on product pages (when implemented)
- **Breadcrumb** schema on category pages (when implemented)

## ✅ Step 4: Add More Page Metadata

### Pages Already Updated
- ✅ Home page (via layout.tsx)
- ✅ About page
- ✅ Product detail pages (dynamic)
- ✅ Designers page
- ✅ Sweater Shop collection
- ✅ Women's Basics
- ✅ Men's Basics

### Pages Still Needing Metadata
Add metadata to these pages using the pattern:

```typescript
// Create metadata.ts file in the page directory
import { Metadata } from 'next';
import { generateMetadata as generateSEOMetadata } from '@/lib/seo';

export const metadata: Metadata = generateSEOMetadata({
  title: 'Page Title',
  description: 'Page description for SEO',
  keywords: ['keyword1', 'keyword2', 'keyword3'],
  url: '/page-url',
});
```

**Pages to update:**
- [ ] All collection pages (`/collections/*`)
- [ ] All women's category pages (`/women/*`)
- [ ] All men's category pages (`/men/*`)
- [ ] Other static pages (privacy, terms, etc.)

## ✅ Step 5: Add Social Media Links

### Update SEO Helper
1. **Open**: `src/lib/seo.ts`
2. **Find**: `generateOrganizationSchema()` function
3. **Update** `sameAs` array with your actual social media URLs:

```typescript
sameAs: [
  'https://www.facebook.com/cesclair',
  'https://www.instagram.com/cesclair',
  'https://twitter.com/cesclair',
  'https://www.linkedin.com/company/cesclair',
  'https://www.pinterest.com/cesclair',
],
```

### Add Contact Information
Update the `contactPoint` in `generateOrganizationSchema()`:

```typescript
contactPoint: {
  '@type': 'ContactPoint',
  contactType: 'Customer Service',
  email: 'support@cesclair.store',
  telephone: '+1-XXX-XXX-XXXX',
  availableLanguage: ['English'],
},
```

## 🔍 Additional SEO Testing Tools

### Page Speed
- **Google PageSpeed Insights**: https://pagespeed.web.dev/
- **GTmetrix**: https://gtmetrix.com/
- **WebPageTest**: https://www.webpagetest.org/

### Mobile-Friendly
- **Google Mobile-Friendly Test**: https://search.google.com/test/mobile-friendly
- **Responsive Design Checker**: https://responsivedesignchecker.com/

### Social Media Previews
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### SEO Analysis
- **Screaming Frog SEO Spider**: https://www.screamingfrog.co.uk/seo-spider/
- **Ahrefs Site Audit**: https://ahrefs.com/site-audit
- **SEMrush Site Audit**: https://www.semrush.com/site-audit/

## 📊 SEO Checklist

### Technical SEO
- [x] Sitemap.xml generated
- [x] Robots.txt configured
- [x] Meta titles and descriptions
- [x] Open Graph tags
- [x] Twitter Cards
- [x] Structured data (JSON-LD)
- [x] Canonical URLs
- [ ] XML sitemap submitted to search engines
- [ ] HTTPS enabled
- [ ] Mobile-responsive design
- [ ] Fast page load times

### On-Page SEO
- [x] Unique titles for each page
- [x] Unique descriptions for each page
- [x] Proper heading structure (H1, H2, etc.)
- [ ] Alt text for all images
- [ ] Internal linking strategy
- [ ] Keyword optimization
- [ ] Content quality and relevance

### Off-Page SEO
- [ ] Social media profiles created
- [ ] Social media links added to structured data
- [ ] Backlink strategy
- [ ] Local SEO (if applicable)
- [ ] Brand mentions

## 🚀 Quick Verification Commands

### Check Sitemap
```bash
curl https://cesclair.store/sitemap.xml
```

### Check Robots.txt
```bash
curl https://cesclair.store/robots.txt
```

### Check Structured Data
```bash
curl https://cesclair.store | grep -o 'application/ld+json'
```

## 📝 Notes

- Sitemap updates automatically when you deploy
- Structured data is included on all pages via root layout
- Metadata uses environment variable `NEXT_PUBLIC_SITE_URL`
- All SEO features are production-ready

## 🆘 Troubleshooting

### Sitemap Not Found
- Check that `src/app/sitemap.ts` exists
- Verify Next.js is generating it correctly
- Check build logs for errors

### Structured Data Not Showing
- Verify `StructuredData` component is in layout
- Check browser console for JavaScript errors
- Ensure JSON is valid (use JSON validator)

### Metadata Not Updating
- Clear browser cache
- Hard refresh (Ctrl+Shift+R / Cmd+Shift+R)
- Check that metadata is exported correctly
- Verify page is using server component or has metadata export

