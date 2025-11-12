# Favicon Setup Guide

This guide explains how to add your CESCLAIR logo as the favicon for your Next.js application.

## 📁 Where to Place Favicon Files

You have two options for adding favicons in Next.js 15:

### Option 1: App Directory (Recommended for Next.js 13+)

Place favicon files directly in the `src/app` directory:

- `src/app/icon.png` - Main favicon (32x32 or 192x192 recommended)
- `src/app/favicon.ico` - Legacy favicon support
- `src/app/apple-icon.png` - Apple touch icon (180x180)

Next.js will automatically detect and use these files.

### Option 2: Public Directory

Place favicon files in the `public` directory:

- `public/favicon.ico` - Main favicon
- `public/icon.png` - PNG favicon
- `public/apple-icon.png` - Apple touch icon

The metadata in `src/app/layout.tsx` is already configured to use these files.

## 🎨 Image Requirements

### Recommended Sizes:

1. **favicon.ico**: 16x16, 32x32, or 48x48 pixels (multi-size ICO file)
2. **icon.png**: 
   - 32x32 pixels (standard)
   - 192x192 pixels (high-resolution)
3. **apple-icon.png**: 180x180 pixels (for iOS devices)

### Design Tips:

- Use a simplified version of your logo (the silhouette works well)
- Ensure good contrast for small sizes
- Test at 16x16 to ensure readability
- Use transparent background if possible
- Keep design simple and recognizable

## 🚀 Quick Setup Steps

1. **Prepare Your Logo Image:**
   - Take your CESCLAIR logo image
   - Resize to the recommended dimensions above
   - Save in PNG format (or ICO for favicon.ico)

2. **Add Files:**
   - Copy your favicon files to `public/` directory OR `src/app/` directory
   - Name them exactly as specified above

3. **Verify:**
   - Restart your dev server: `npm run dev`
   - Check browser tab - favicon should appear
   - Clear browser cache if needed (Ctrl+Shift+R or Cmd+Shift+R)

## 📝 Current Configuration

The `src/app/layout.tsx` file is configured with:

```typescript
icons: {
  icon: [
    { url: '/favicon.ico', sizes: 'any' },
    { url: '/icon.png', type: 'image/png', sizes: '32x32' },
    { url: '/icon.png', type: 'image/png', sizes: '192x192' },
  ],
  apple: [
    { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
  ],
}
```

This configuration will work once you add the files to the `public/` directory.

## 🛠️ Tools for Creating Favicons

### Online Tools:
- [Favicon.io](https://favicon.io/) - Generate favicons from images
- [RealFaviconGenerator](https://realfavicongenerator.net/) - Comprehensive favicon generator
- [Favicon Generator](https://www.favicon-generator.org/) - Simple generator

### Image Editing:
- Use any image editor (Photoshop, GIMP, Figma, etc.)
- Export as PNG with transparent background
- Resize to required dimensions

## ✅ Testing

After adding your favicon files:

1. **Local Testing:**
   ```bash
   npm run dev
   ```
   - Open http://localhost:3000
   - Check browser tab for favicon
   - Test in different browsers (Chrome, Firefox, Safari, Edge)

2. **Production Testing:**
   - Deploy to Netlify
   - Check favicon appears on live site
   - Test on mobile devices (iOS Safari, Android Chrome)

3. **Validation:**
   - Use [Favicon Checker](https://realfavicongenerator.net/favicon_checker)
   - Verify all sizes are working
   - Check mobile device support

## 📱 Additional Icons (Optional)

For better mobile support, you can also add:

- `public/manifest.json` - Web app manifest
- `public/android-chrome-192x192.png` - Android icon
- `public/android-chrome-512x512.png` - Android icon (large)

These are optional but recommended for PWA support.

## 🎯 Quick Checklist

- [ ] Logo image prepared and resized
- [ ] `favicon.ico` added to `public/` or `src/app/`
- [ ] `icon.png` added to `public/` or `src/app/`
- [ ] `apple-icon.png` added to `public/` or `src/app/`
- [ ] Dev server restarted
- [ ] Favicon visible in browser tab
- [ ] Tested on multiple browsers
- [ ] Verified on mobile devices (optional)

---

**Note:** If you're using the App Router file-based approach (`src/app/icon.png`), you can remove the `icons` configuration from `layout.tsx` as Next.js will automatically detect the files.

