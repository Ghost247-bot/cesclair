# 🚀 Netlify Deployment Setup Guide

Complete step-by-step guide to deploy your Next.js application to Netlify.

## ✅ Pre-Deployment Checklist

- [x] ✅ `netlify.toml` configured
- [x] ✅ `@netlify/plugin-nextjs` installed
- [x] ✅ Next.js 15 configuration optimized
- [x] ✅ Database migrations ready
- [ ] ⚠️ Environment variables set in Netlify
- [ ] ⚠️ GitHub repository connected
- [ ] ⚠️ Site deployed and tested

---

## 📋 Step 1: Connect GitHub Repository to Netlify

1. **Go to Netlify Dashboard:**
   - Visit [https://app.netlify.com](https://app.netlify.com)
   - Sign in or create an account

2. **Add New Site:**
   - Click **"Add new site"** → **"Import an existing project"**
   - Select **"GitHub"** as your Git provider
   - Authorize Netlify to access your GitHub account (if needed)
   - Select your repository: `Ghost247-bot/cesclair`

3. **Configure Build Settings:**
   - **Branch to deploy:** `main`
   - **Build command:** `npm run build` (auto-detected)
   - **Publish directory:** `.next` (auto-detected by plugin)
   - Click **"Deploy site"**

---

## 🔐 Step 2: Set Environment Variables

**IMPORTANT:** Set these in Netlify Dashboard → Site settings → Environment variables

### Required Variables:

#### 1. `DATABASE_URL`
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```
- ✅ Use **pooler endpoint** (not direct connection)
- ✅ Include `?sslmode=require` for SSL
- ✅ Get from your Neon dashboard → Connection Details → Pooler connection string

#### 2. `NEXT_PUBLIC_SITE_URL`
```
https://your-site-name.netlify.app
```
- ⚠️ **Update after first deployment** with your actual Netlify URL
- ✅ Must use `https://` protocol
- ✅ No trailing slash

#### 3. `BETTER_AUTH_SECRET`
```
aiSqJ07kY8VgxvUNUS7LutJNNEn9uclwR5gm3l5aYqU=
```
- ✅ Generated secret (32+ characters)
- ✅ Keep it secret - never commit to git
- ✅ Use the same secret for all environments

### How to Set Variables:

1. Go to **Site settings** → **Environment variables**
2. Click **"Add variable"**
3. Enter:
   - **Key:** Variable name (e.g., `DATABASE_URL`)
   - **Value:** Variable value
   - **Scopes:** Select all (Production, Deploy previews, Branch deploys)
4. Click **"Save"**
5. **Trigger a new deployment** for changes to take effect

---

## 🔧 Step 3: Verify Build Configuration

Your `netlify.toml` is already configured with:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NODE_VERSION = "20"
  NPM_FLAGS = "--legacy-peer-deps"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

✅ This configuration is correct and ready for deployment.

---

## 🚀 Step 4: Deploy

### Option A: Automatic Deployment (Recommended)

1. **Push to GitHub:**
   ```bash
   git push origin main
   ```
   - Netlify will automatically detect the push
   - Build will start automatically
   - Deployment will complete in 2-5 minutes

### Option B: Manual Deployment

1. Go to Netlify Dashboard → **Deploys** tab
2. Click **"Trigger deploy"** → **"Deploy site"**
3. Wait for build to complete

---

## ✅ Step 5: Post-Deployment Verification

### 1. Check Build Logs

- Go to **Deploys** → Click on your deployment
- Verify:
  - ✅ Build completed successfully
  - ✅ No environment variable errors
  - ✅ No build errors

### 2. Test Your Site

Visit your Netlify URL and test:

- [ ] ✅ Homepage loads
- [ ] ✅ Authentication (sign up/login) works
- [ ] ✅ Database operations work
- [ ] ✅ API routes respond correctly
- [ ] ✅ File uploads work
- [ ] ✅ Documents can be viewed/downloaded

### 3. Update Site URL (If Needed)

If your Netlify URL is different from what you set:

1. Go to **Site settings** → **Environment variables**
2. Update `NEXT_PUBLIC_SITE_URL` to your actual Netlify URL
3. Trigger a new deployment

---

## 🔍 Step 6: Monitor and Debug

### Check Function Logs

1. Go to **Functions** tab in Netlify Dashboard
2. Monitor for runtime errors
3. Check API route logs

### Common Issues

#### Build Fails

**Issue:** Build timeout or memory errors
- **Solution:** Check build logs for specific errors
- **Check:** Ensure `NODE_VERSION = "20"` is set

**Issue:** Missing dependencies
- **Solution:** Run `npm install` locally to verify
- **Check:** Ensure `package.json` is up to date

#### Runtime Errors

**Issue:** "DATABASE_URL not found"
- **Solution:** Verify environment variable is set correctly
- **Check:** Variable name is exactly `DATABASE_URL` (case-sensitive)

**Issue:** "BETTER_AUTH_SECRET is invalid"
- **Solution:** Regenerate secret and update in Netlify
- **Check:** Secret is 32+ characters

**Issue:** Auth callbacks not working
- **Solution:** Verify `NEXT_PUBLIC_SITE_URL` matches your Netlify URL
- **Check:** URL uses `https://` protocol

---

## 📊 Step 7: Custom Domain (Optional)

1. Go to **Site settings** → **Domain management**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `cesclair.store`)
4. Follow DNS configuration instructions
5. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
6. Trigger a new deployment

---

## 🔄 Continuous Deployment

Your site is now set up for continuous deployment:

- ✅ Every push to `main` branch triggers a new deployment
- ✅ Pull requests get preview deployments automatically
- ✅ Build logs are available in Netlify Dashboard

---

## 📚 Additional Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/next-js/)
- [Environment Variables Guide](https://docs.netlify.com/environment-variables/overview/)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

---

## 🎉 You're All Set!

Your application is now ready for Netlify deployment. Follow the steps above to complete the setup.

**Quick Summary:**
1. ✅ Connect GitHub repository
2. ✅ Set environment variables
3. ✅ Deploy
4. ✅ Verify and test
5. ✅ Monitor and maintain

---

**Generated BETTER_AUTH_SECRET:** `aiSqJ07kY8VgxvUNUS7LutJNNEn9uclwR5gm3l5aYqU=`

⚠️ **Remember:** Keep this secret secure and never commit it to git!

