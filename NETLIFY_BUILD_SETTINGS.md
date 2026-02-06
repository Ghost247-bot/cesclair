# Netlify Build Settings - Critical Configuration

## ⚠️ IMPORTANT: Netlify Dashboard Settings

After deploying to Netlify, you MUST verify these settings in the Netlify Dashboard:

### 1. Build Settings
**Location:** Site settings → Build & deploy → Build settings

**Required Settings:**
```
Build command: npm run build
Publish directory: (LEAVE EMPTY)
Base directory: (LEAVE EMPTY)
```

**⚠️ CRITICAL:** 
- The publish directory MUST be empty
- The `@netlify/plugin-nextjs` plugin automatically handles the publish directory
- If you set it to `.next`, it will cause 404 errors

### 2. Plugin Installation
**Location:** Site settings → Plugins

**Required:**
- `@netlify/plugin-nextjs` must be installed and enabled
- If not installed, Netlify should auto-install it from `netlify.toml`
- Check build logs to confirm plugin installation

### 3. Environment Variables
**Location:** Site settings → Environment variables

**Required Variables:**
```
DATABASE_URL=your-neon-connection-string
BETTER_AUTH_SECRET=your-auth-secret
NEXT_PUBLIC_SITE_URL=https://cesclair.store
```

### 4. Domain Configuration
**Location:** Site settings → Domain management

**Required:**
- `cesclair.store` should be listed as custom domain
- DNS should be properly configured
- SSL certificate should be active

## How to Fix 404 Error

### Step 1: Verify Build Settings
1. Go to Netlify Dashboard → Your Site → Site settings
2. Click "Build & deploy" → "Build settings"
3. Verify:
   - Build command: `npm run build`
   - **Publish directory: (EMPTY - this is critical!)**
   - Base directory: (EMPTY)

### Step 2: Check Plugin Installation
1. Go to Site settings → Plugins
2. Look for `@netlify/plugin-nextjs`
3. If not installed:
   - The plugin should auto-install from `netlify.toml`
   - Check build logs for "Installing @netlify/plugin-nextjs"
   - If it doesn't install, manually add it in the Plugins section

### Step 3: Check Build Logs
1. Go to Deploys tab
2. Click on the latest deployment
3. Check build logs for:
   - ✅ "Installing @netlify/plugin-nextjs"
   - ✅ "Next.js plugin detected"
   - ✅ Build completion without errors
   - ❌ Any errors about missing files or directories

### Step 4: Clear Cache and Redeploy
1. Go to Deploys tab
2. Click "Trigger deploy" → "Clear cache and deploy site"
3. Wait for build to complete
4. Check if site works

### Step 5: Verify Function Creation
1. Go to Functions tab
2. Look for `next` function
3. If function doesn't exist, the plugin didn't run correctly
4. Check function logs for errors

## Common Issues and Solutions

### Issue 1: Publish Directory Set to `.next`
**Symptom:** 404 errors on all routes
**Solution:** 
- Go to Build settings
- Clear the "Publish directory" field
- Save and redeploy

### Issue 2: Plugin Not Installed
**Symptom:** 404 errors, no `next` function in Functions tab
**Solution:**
- Check `netlify.toml` has the plugin configured
- Manually install plugin in Plugins section
- Redeploy

### Issue 3: Build Fails
**Symptom:** Deployment fails, no site deployed
**Solution:**
- Check build logs for errors
- Verify all environment variables are set
- Check Node version (should be 20)
- Verify `package.json` dependencies

### Issue 4: Domain Not Working
**Symptom:** Site works on `.netlify.app` but not on custom domain
**Solution:**
- Check DNS configuration
- Verify domain is added in Domain management
- Wait for DNS propagation (can take up to 48 hours)
- Check SSL certificate status

## Verification Checklist

After deploying, verify:
- [ ] Build completes successfully
- [ ] Publish directory is EMPTY in Netlify settings
- [ ] Plugin is installed and enabled
- [ ] `next` function exists in Functions tab
- [ ] Environment variables are set
- [ ] Domain is configured correctly
- [ ] SSL certificate is active
- [ ] Site loads on `https://cesclair.store`
- [ ] Homepage renders correctly
- [ ] Navigation works
- [ ] API routes work

## Testing

1. **Test Netlify URL first:**
   - Access your site via `https://your-site-name.netlify.app`
   - If this works, the issue is with domain configuration
   - If this doesn't work, the issue is with build/plugin

2. **Test Custom Domain:**
   - Access `https://cesclair.store`
   - Check browser console for errors
   - Check network tab for failed requests

3. **Test Functions:**
   - Go to Functions tab in Netlify
   - Click on `next` function
   - Check logs for errors
   - Test function directly if possible

## Next Steps After Fix

1. Update `NEXT_PUBLIC_SITE_URL` to `https://cesclair.store`
2. Clear cache and redeploy
3. Test all pages and routes
4. Verify authentication works
5. Test API endpoints
6. Check database connections

## Support

If issue persists:
1. Check Netlify status page
2. Review build logs thoroughly
3. Check function logs
4. Verify all settings match this guide
5. Contact Netlify support with:
   - Build logs
   - Function logs
   - Configuration screenshots
   - Error messages

