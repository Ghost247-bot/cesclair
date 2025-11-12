# Netlify Deployment Checklist

## ✅ Pre-Deployment Checklist

### 1. Code Changes Committed
- [x] All image fixes committed
- [x] Database query fixes committed
- [x] Changes pushed to GitHub

### 2. Environment Variables Required

Before deploying, ensure these are set in Netlify Dashboard:

#### Required Variables:

1. **DATABASE_URL**
   ```
   postgresql://neondb_owner:****@ep-withered-shadow-a4gnj7n7.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```
   - ⚠️ Remove `channel_binding=require` if present (handled automatically by code)
   - Use your actual password

2. **BETTER_AUTH_SECRET**
   ```
   Generate with: npm run generate-secret
   ```
   - Must be a secure random string (32+ characters)

3. **NEXT_PUBLIC_SITE_URL**
   ```
   https://your-site-name.netlify.app
   ```
   - Update after first deployment with actual Netlify URL

#### Optional Variables:

- `BETTER_AUTH_URL` - If different from NEXT_PUBLIC_SITE_URL
- `DATABASE_DEBUG` - Set to `"true"` for troubleshooting
- DocuSign variables (if using DocuSign integration)

## 🚀 Deployment Steps

### Step 1: Connect to Netlify (If Not Already Connected)

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Connect to Git provider"** → Select **GitHub**
4. Authorize Netlify access
5. Select repository: **`Ghost247-bot/cesclair`**

### Step 2: Configure Build Settings

Netlify should auto-detect from `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** (auto-handled by plugin)
- **Base directory:** (leave empty)

### Step 3: Set Environment Variables

1. Go to **Site settings** → **Environment variables**
2. Add all required variables listed above
3. Set scopes:
   - ✅ Production
   - ✅ Deploy previews
   - ✅ Branch deploys

### Step 4: Deploy

1. Click **"Deploy site"** (or it will auto-deploy if connected to GitHub)
2. Wait for build to complete (2-5 minutes)
3. Monitor build logs for any errors

### Step 5: Post-Deployment

1. **Get your Netlify URL** (e.g., `https://cesclair-xyz123.netlify.app`)
2. **Update NEXT_PUBLIC_SITE_URL:**
   - Go to **Site settings** → **Environment variables**
   - Update `NEXT_PUBLIC_SITE_URL` with your actual URL
   - Also update `BETTER_AUTH_URL` if set
3. **Trigger redeploy:**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**

## ✅ Post-Deployment Verification

Test the following:

1. **Homepage loads correctly**
   - Visit your Netlify URL
   - Check that images display properly

2. **Authentication works**
   - Test sign up
   - Test sign in
   - Test sign out

3. **Database connectivity**
   - Test API endpoints (e.g., `/api/designers`)
   - Check that queries execute successfully

4. **Cart functionality**
   - Test adding items to cart
   - Test cart page (`/cart`)
   - Test checkout flow

5. **Images display**
   - Verify product images load
   - Check cart item images
   - Verify all Next.js Image components work

## 🔧 Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify Node version is 20 (configured in netlify.toml)
- Ensure all environment variables are set
- Check for TypeScript/ESLint errors

### Images Not Showing

- Verify image URLs are absolute (starting with `http://` or `https://`)
- Check browser console for image loading errors
- Verify Next.js Image optimization is working
- Check Netlify image optimization settings

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check that `channel_binding` parameter is removed (code handles this)
- Verify Neon database is not paused
- Check Neon connection logs

### Authentication Not Working

- Verify `NEXT_PUBLIC_SITE_URL` matches your Netlify URL
- Check `BETTER_AUTH_SECRET` is set correctly
- Verify database connection for auth tables
- Check browser console for auth errors

## 📝 Quick Deploy Commands

If you need to manually trigger a deployment:

```bash
# Commit and push changes
git add -A
git commit -m "Your commit message"
git push origin main

# Netlify will auto-deploy if connected to GitHub
```

## 🔗 Useful Links

- [Netlify Dashboard](https://app.netlify.com/)
- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Neon Database Dashboard](https://console.neon.tech/)

---

**Last Updated:** After fixing image and database query issues
**Status:** Ready for deployment ✅
