# Hairstylist Banner Images - Troubleshooting Guide

## 🔍 Issue Analysis

**Problem:** Banner images not displaying on the hairstylists page

**Root Cause:** Multiple potential issues identified in the image loading pipeline

---

## 📋 Identified Issues

### 1. **Missing Uploads Directory**
- **Issue:** No `/public/uploads/` directory exists
- **Impact:** Images stored in database can't be served
- **Solution:** Create the directory structure

### 2. **Image Path Normalization Issues**
- **Issue:** `normalizeImagePath` function may not handle database-stored paths correctly
- **Impact:** Images stored as `/api/files/{id}` but not processed properly
- **Solution:** Update path normalization logic

### 3. **Database vs File System Mismatch**
- **Issue:** Images stored in database as base64, served via API route
- **Impact:** Next.js Image component expects direct file access
- **Solution:** Adjust Image component configuration

### 4. **Missing Error Handling**
- **Issue:** No fallback when images fail to load
- **Impact:** Broken image placeholders
- **Solution:** Add error boundaries and fallbacks

---

## 🛠️ Comprehensive Solutions

### Solution 1: Create Uploads Directory Structure

```bash
# Create the missing directories
mkdir -p public/uploads/hairstylists/banners
mkdir -p public/uploads/hairstylists/avatars
```

### Solution 2: Fix Image Path Normalization

**File:** `src/lib/utils.ts`

```typescript
export function normalizeImagePath(imagePath: string | null | undefined, placeholder: string = '/placeholder-image.jpg'): string {
  // If no image path, return placeholder
  if (!imagePath) {
    return placeholder;
  }

  // If it's already an external URL, return as-is
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }

  // If it's an API route (/api/files/{id}), return as-is for Next.js Image
  if (imagePath.startsWith('/api/files/')) {
    return imagePath;
  }

  // If it starts with /uploads/, serve directly from public folder
  if (imagePath.startsWith('/uploads/')) {
    return imagePath;
  }

  // If it's an absolute path starting with /, return as-is
  if (imagePath.startsWith('/')) {
    return imagePath;
  }

  // If it's a relative path, make it absolute
  return `/${imagePath}`;
}
```

### Solution 3: Enhanced Image Component with Error Handling

**File:** `src/components/HairstylistBanner.tsx`

```typescript
import Image from 'next/image';
import { useState } from 'react';
import { normalizeImagePath } from '@/lib/utils';

interface HairstylistBannerProps {
  src: string | null | undefined;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function HairstylistBanner({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}: HairstylistBannerProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const normalizedSrc = normalizeImagePath(src);

  const handleImageError = () => {
    console.error('Failed to load image:', src);
    setImageError(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Show placeholder if image fails to load
  if (imageError || !src) {
    return (
      <div className={`w-full h-full bg-gray-200 flex items-center justify-center ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 text-gray-400 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-sm text-gray-600">Banner Image</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {!imageLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      <Image
        src={normalizedSrc}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
        priority={priority}
        unoptimized={normalizedSrc.startsWith('/api/files/')}
        onError={handleImageError}
        onLoad={handleImageLoad}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  );
}
```

### Solution 4: Update Hairstylists Page

**File:** `src/app/hairstylists/page.tsx`

```typescript
import HairstylistBanner from '@/components/HairstylistBanner';

// Replace the banner Image component (lines 101-108)
<div className="relative h-64 bg-gray-100 overflow-hidden">
  <HairstylistBanner
    src={stylist.bannerUrl}
    alt={`${stylist.name} portfolio banner`}
    className="group-hover:scale-105 transition-transform duration-500"
    priority={false}
  />
  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
</div>
```

---

## 🔧 Advanced Debugging Steps

### Step 1: Check Database Records
```sql
-- Check what banner URLs are stored
SELECT id, name, banner_url, status FROM hairstylists WHERE status = 'approved' AND banner_url IS NOT NULL;
```

### Step 2: Test Image API Directly
```bash
# Test if the file serving API works
curl "http://localhost:3000/api/files/1" -I
```

### Step 3: Check Network Tab
1. Open browser DevTools
2. Go to Network tab
3. Refresh hairstylists page
4. Look for failed image requests (red status codes)
5. Check response headers for image requests

### Step 4: Console Debugging
Add this to the page component:
```typescript
useEffect(() => {
  approved.forEach(stylist => {
    if (stylist.bannerUrl) {
      console.log('Stylist:', stylist.name);
      console.log('Banner URL:', stylist.bannerUrl);
      console.log('Normalized:', normalizeImagePath(stylist.bannerUrl));
    }
  });
}, [approved]);
```

---

## 🎯 Common Next.js Image Issues & Solutions

### Issue 1: External Images with `unoptimized`
**Problem:** Next.js can't optimize external images
**Solution:** Add `unoptimized` prop or use `loader`

### Issue 2: Missing `domains` in next.config.js
**Problem:** External images blocked by Next.js
**Solution:** Add domains to configuration
```javascript
module.exports = {
  images: {
    domains: ['images.unsplash.com', 'your-cdn.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
}
```

### Issue 3: Base64 Stored Images
**Problem:** Images stored as base64 in database
**Solution:** Use custom loader or convert to files

### Issue 4: CORS Issues
**Problem:** Images served from different domain
**Solution:** Configure CORS headers

---

## 📊 Implementation Priority

1. **HIGH PRIORITY:** Create missing directories
2. **HIGH PRIORITY:** Add error handling to Image components
3. **MEDIUM PRIORITY:** Update path normalization
4. **LOW PRIORITY:** Optimize image serving performance

---

## 🚀 Testing Checklist

- [ ] Create `/public/uploads/` directory structure
- [ ] Test image loading with various banner URLs
- [ ] Verify error handling works correctly
- [ ] Check console for image loading errors
- [ ] Test on different screen sizes
- [ ] Verify hover effects work with loaded images
- [ ] Test with slow network conditions

---

## 📞 Additional Support

If issues persist after implementing these solutions:

1. **Check Browser Console:** Look for specific error messages
2. **Verify Database:** Ensure banner URLs are correctly stored
3. **Test API Endpoints:** Confirm file serving works
4. **Network Analysis:** Use browser DevTools to trace requests

**Last Updated:** February 13, 2026
**Priority:** HIGH - Visual content critical for user experience
