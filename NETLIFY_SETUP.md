# 🚀 Netlify Deployment Setup

Complete setup guide for deploying your Next.js application to Netlify.

## ✅ Prerequisites

- [x] Netlify account (free tier works)
- [x] Neon PostgreSQL database with pooler endpoint
- [x] GitHub repository connected
- [x] Node.js 20.x (configured in netlify.toml)

## 📋 Quick Setup Checklist

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect **GitHub** (authorize if needed)
4. Select repository: **`Ghost247-bot/cesclair`** (or your repo name)
5. Netlify auto-detects settings from `netlify.toml`
6. Click **"Deploy site"**

**Wait for first deployment** (5-10 minutes)

### Step 2: Generate Auth Secret

Run locally:
```bash
npm run generate-secret
```

**Copy the generated secret** - you'll need it in Step 3.

### Step 3: Set Environment Variables

After first deployment completes:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"** for each:

#### 🔴 Required Variables:

**1. DATABASE_URL**
```
Variable: DATABASE_URL
Value: postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
Scope: ✓ Production ✓ Deploy previews ✓ Branch deploys
```

**2. BETTER_AUTH_SECRET**
```
Variable: BETTER_AUTH_SECRET
Value: [paste secret from Step 2]
Scope: ✓ Production ✓ Deploy previews ✓ Branch deploys
```

**3. NEXT_PUBLIC_SITE_URL**
```
Variable: NEXT_PUBLIC_SITE_URL
Value: https://your-site-name.netlify.app
Scope: ✓ Production ✓ Deploy previews ✓ Branch deploys
```
*(Copy the URL from Netlify after first deployment)*

**4. SIGNWELL_API_KEY** (if using SignWell)
```
Variable: SIGNWELL_API_KEY
Value: YWNjZXNzOjhiYWUyMTI2MzgxMmQ0YzVlMTUzMDE1MDM1ZWY4OWU4
Scope: ✓ Production ✓ Deploy previews ✓ Branch deploys
```

**5. SIGNWELL_API_BASE** (if using SignWell)
```
Variable: SIGNWELL_API_BASE
Value: https://www.signwell.com/api/v1
Scope: ✓ Production ✓ Deploy previews ✓ Branch deploys
```

### Step 4: Redeploy

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment (5-10 minutes)

### Step 5: Verify Deployment

Visit these URLs to verify:

- ✅ **Homepage:** `https://your-site.netlify.app`
- ✅ **API Test:** `https://your-site.netlify.app/api/test/production-diagnostics`
- ✅ **Login:** `https://your-site.netlify.app/cesworld/login`
- ✅ **Checkout:** `https://your-site.netlify.app/checkout`

## 🔧 Configuration Details

### Build Settings (Auto-configured)

From `netlify.toml`:
- ✅ **Build command:** `npm run build`
- ✅ **Node version:** `20`
- ✅ **Plugin:** `@netlify/plugin-nextjs`
- ✅ **Publish directory:** *(auto-handled by plugin)*
- ✅ **Image optimization:** Disabled (unoptimized: true)

### Security Headers (Auto-configured)

From `netlify.toml`:
- ✅ Security headers enabled
- ✅ Cache headers configured
- ✅ SSL/TLS enforced
- ✅ CORS configured for images

### Image Handling

Images are configured to:
- ✅ Support external URLs (Supabase)
- ✅ Handle `/uploads/` paths via API route
- ✅ Fallback to placeholder images on error
- ✅ Work with Netlify serverless functions

## 🐛 Troubleshooting

### Build Fails
- Check build logs for specific error
- Verify Node.js 20 is set
- Ensure all dependencies are in `package.json`
- Check `netlify.toml` syntax

### Environment Variables Not Working
- Redeploy after adding variables
- Verify variable names (case-sensitive)
- Check all scopes are selected (Production, Deploy previews, Branch deploys)
- Clear cache before redeploying

### Database Connection Error
- Use **pooler endpoint** (not direct connection)
- Verify `DATABASE_URL` format includes `?sslmode=require`
- Check database allows connections from Netlify IPs
- Test connection string locally first

### Authentication Not Working
- Verify `NEXT_PUBLIC_SITE_URL` matches actual Netlify URL
- Check `BETTER_AUTH_SECRET` is set correctly
- Review function logs in Netlify dashboard
- Ensure URL has no trailing slash

### Images Not Loading
- Check external image URLs are accessible
- Verify `remotePatterns` in `next.config.ts`
- Check browser console for CORS errors
- Verify image paths use `/api/uploads/` for uploaded files

### Function Timeouts
- Check function logs for timeout errors
- Optimize database queries
- Increase function timeout if needed (max 26s on free tier)
- Use database connection pooling

## 📝 Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] Environment variables set correctly
- [ ] Database connection works
- [ ] Authentication works (sign up/login)
- [ ] Product images load correctly
- [ ] Checkout flow works
- [ ] Order placement works
- [ ] API routes respond correctly
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

## 🔄 Continuous Deployment

After initial setup:
- ✅ Automatic deployments from `main` branch
- ✅ Deploy previews for pull requests
- ✅ Branch deploys for feature branches

## 📚 Additional Resources

- **Quick Start:** `NETLIFY_QUICK_START.md`
- **Environment Variables:** `NETLIFY_ENV_VARIABLES.md`
- **Deployment Checklist:** `NETLIFY_DEPLOYMENT_CHECKLIST.md`
- **Build Settings:** `NETLIFY_BUILD_SETTINGS.md`

## 🆘 Need Help?

1. Check Netlify build logs
2. Review function logs
3. Test locally with production env vars
4. Check [Netlify Status](https://www.netlifystatus.com/)
5. Review [Next.js on Netlify docs](https://docs.netlify.com/integrations/frameworks/next-js/)

---

**✅ Ready to deploy?** Follow the 5 steps above and your site will be live in minutes! 🎉
