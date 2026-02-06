# Quick Netlify Deployment Guide

## ✅ Code is Ready
All changes have been committed and pushed to GitHub:
- Image fixes (Next.js Image component)
- Database query optimizations
- Timeout handling and retry logic
- Products API improvements

## 🚀 Deploy to Netlify

### Option 1: If Site Already Exists on Netlify

1. **Go to Netlify Dashboard**
   - Visit: https://app.netlify.com/
   - Find your site (cesclair)

2. **Trigger New Deployment**
   - Go to **Deploys** tab
   - Click **"Trigger deploy"** → **"Clear cache and deploy site"**
   - Or wait for automatic deployment (if connected to GitHub)

3. **Verify Environment Variables**
   - Go to **Site settings** → **Environment variables**
   - Ensure these are set:
     - `DATABASE_URL`
     - `BETTER_AUTH_SECRET`
     - `NEXT_PUBLIC_SITE_URL` (should match your Netlify URL)

### Option 2: First Time Deployment

1. **Connect Repository**
   - Go to https://app.netlify.com/
   - Click **"Add new site"** → **"Import an existing project"**
   - Connect to **GitHub**
   - Select repository: **`Ghost247-bot/cesclair`**

2. **Configure Build Settings**
   - Netlify will auto-detect from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: (auto-handled)

3. **Set Environment Variables**
   - Click **"Show advanced"** or go to **Site settings** → **Environment variables**
   - Add these variables:

   ```
   DATABASE_URL=postgresql://neondb_owner:YOUR_PASSWORD@ep-withered-shadow-a4gnj7n7.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

   ```
   BETTER_AUTH_SECRET=your-secret-here
   ```
   (Generate with: `npm run generate-secret`)

   ```
   NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
   ```
   (Update after first deploy with actual URL)

4. **Deploy**
   - Click **"Deploy site"**
   - Wait 2-5 minutes for build

5. **Post-Deployment**
   - Get your Netlify URL (e.g., `https://cesclair-xyz123.netlify.app`)
   - Update `NEXT_PUBLIC_SITE_URL` in environment variables
   - Trigger redeploy: **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

## ✅ Verify Deployment

After deployment, test:

1. **Homepage**: https://your-site.netlify.app
2. **Cart Page**: https://your-site.netlify.app/cart
3. **Products API**: https://your-site.netlify.app/api/products?limit=50
4. **Authentication**: Sign up/Sign in

## 🔍 Check Build Logs

If deployment fails:
1. Go to **Deploys** tab
2. Click on the failed deployment
3. Check build logs for errors
4. Common issues:
   - Missing environment variables
   - Database connection issues
   - Build timeout (increase in Netlify settings if needed)

## 📝 Environment Variables Checklist

Before deploying, ensure these are set in Netlify:

- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - Auth secret (32+ characters)
- [ ] `NEXT_PUBLIC_SITE_URL` - Your Netlify URL (update after first deploy)

## 🎯 Quick Links

- [Netlify Dashboard](https://app.netlify.com/)
- [GitHub Repository](https://github.com/Ghost247-bot/cesclair)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)

---

**Status**: ✅ Ready to deploy
**Last Commit**: Timeout fixes and query optimizations

