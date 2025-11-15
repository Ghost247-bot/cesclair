# Fix for 404 Errors: main-app.js and layout.css

## Problem
Browser is requesting `main-app.js` and `layout.css` but getting 404 errors. These files don't exist because Next.js generates hashed filenames like `main-app-4204aeeb01e2624c.js`.

## Root Cause
1. **Cached HTML**: Browser has cached old HTML that references non-hashed filenames
2. **Service Worker**: May be serving old cached assets
3. **Build Manifest**: Next.js should automatically use hashed filenames, but cached HTML bypasses this

## Solutions Applied

### 1. Updated netlify.toml
- Removed incorrect `publish = ".next"` (plugin handles this automatically)
- Added cache headers to prevent HTML caching
- Ensures fresh HTML is served with correct asset references

### 2. Updated next.config.ts
- Added `trailingSlash: false` for proper routing
- Ensured no basePath or assetPrefix interfering

## How to Fix on Deployed Site

### Step 1: Clear Browser Cache
1. Open browser DevTools (F12)
2. Right-click the refresh button
3. Select "Empty Cache and Hard Reload"
4. Or use Ctrl+Shift+Delete to clear cache

### Step 2: Clear Service Workers
1. Open DevTools → Application tab
2. Click "Service Workers" in left sidebar
3. Click "Unregister" for any service workers
4. Refresh the page

### Step 3: Redeploy on Netlify
1. Go to Netlify Dashboard
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for build to complete
4. Test the site

### Step 4: Verify Asset Paths
After deployment, check the HTML source:
- Assets should reference `/_next/static/chunks/main-app-[hash].js`
- CSS should reference `/_next/static/css/app/[hash].css`
- NOT `main-app.js` or `layout.css`

## Prevention

The updated configuration ensures:
- HTML is not cached (fresh asset references on each load)
- Next.js generates correct hashed filenames
- Netlify plugin handles routing correctly

## Testing

1. **Local Test**:
   ```bash
   npm run build
   npm run start
   ```
   Check that assets load correctly

2. **Production Test**:
   - Deploy to Netlify
   - Clear browser cache
   - Verify no 404 errors in console
   - Check Network tab for correct asset paths

## If Issue Persists

1. Check Netlify build logs for errors
2. Verify `@netlify/plugin-nextjs` is installed and enabled
3. Check browser console for other errors
4. Verify environment variables are set correctly
5. Check if custom domain has DNS issues

