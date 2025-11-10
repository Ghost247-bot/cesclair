# Fixing 404 Error on Netlify

## Issue
Getting 404 error when accessing `https://cesclair.store/`

## Root Cause
The `@netlify/plugin-nextjs` should handle all routing automatically, but the 404 suggests:
1. Plugin might not be installed/activated
2. Build might not be completing successfully
3. Next.js build output might not be correct

## Solutions

### Solution 1: Verify Plugin Installation
1. Go to Netlify Dashboard → Your Site → Plugins
2. Ensure `@netlify/plugin-nextjs` is installed and enabled
3. If not installed, Netlify should auto-install it from `netlify.toml`

### Solution 2: Check Build Settings in Netlify Dashboard
1. Go to Site settings → Build & deploy → Build settings
2. Verify:
   - **Build command:** `npm run build`
   - **Publish directory:** Should be empty or `.next` (plugin handles this)
   - **Base directory:** Should be empty (root of repo)

### Solution 3: Verify Build Output
1. Check build logs in Netlify Dashboard
2. Look for:
   - "Installing @netlify/plugin-nextjs"
   - "Next.js plugin detected"
   - Build completion without errors
3. Check that `.next` directory is created during build

### Solution 4: Clear Cache and Rebuild
1. In Netlify Dashboard → Deploys
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for build to complete

### Solution 5: Check Environment Variables
Ensure these are set in Netlify:
- `DATABASE_URL`
- `BETTER_AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL` (should be `https://cesclair.store`)

### Solution 6: Verify Next.js Configuration
The `next.config.ts` should NOT have:
- `output: 'export'` (this creates static export, not compatible with Netlify plugin)
- Custom server configuration

### Solution 7: Check Domain Configuration
1. Go to Site settings → Domain management
2. Verify `cesclair.store` is properly configured
3. Check DNS settings if using custom domain

## Expected Behavior
With `@netlify/plugin-nextjs`:
- Plugin automatically creates `.netlify/functions/next` function
- All routes are handled by the plugin
- No manual redirects needed in `netlify.toml`
- Static pages are served directly
- Dynamic/SSR pages go through the function

## Troubleshooting Steps
1. Check Netlify build logs for errors
2. Verify plugin is installed: Look for "Installing @netlify/plugin-nextjs" in logs
3. Check function logs: Netlify Dashboard → Functions → next
4. Test with Netlify preview URL first
5. Verify `package.json` has correct dependencies
6. Check that `.next` directory exists after build

## If Issue Persists
1. Check Netlify status page for service issues
2. Verify Next.js version compatibility with plugin
3. Review Netlify plugin documentation: https://github.com/netlify/netlify-plugin-nextjs
4. Contact Netlify support with build logs

## Quick Fix Checklist
- [ ] Plugin installed and enabled
- [ ] Build completes successfully
- [ ] No errors in build logs
- [ ] Environment variables set
- [ ] Domain configured correctly
- [ ] Cache cleared and redeployed
- [ ] Next.js config is correct (no `output: 'export'`)
- [ ] Publish directory is empty or `.next` in Netlify settings

