# ⚡ Netlify Quick Deploy Checklist

## ✅ Pre-Deployment Status

- [x] ✅ `netlify.toml` configured correctly
- [x] ✅ `@netlify/plugin-nextjs@5.14.5` installed
- [x] ✅ Next.js 15 configuration optimized
- [x] ✅ All migrations applied to database
- [x] ✅ Code pushed to GitHub

## 🔐 Required Environment Variables

Set these in **Netlify Dashboard → Site settings → Environment variables**:

### 1. DATABASE_URL
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```
- Use **pooler endpoint** from Neon dashboard
- Include `?sslmode=require`

### 2. NEXT_PUBLIC_SITE_URL
```
https://your-site-name.netlify.app
```
- Update after first deployment with actual Netlify URL
- Must use `https://` protocol

### 3. BETTER_AUTH_SECRET
```
aiSqJ07kY8VgxvUNUS7LutJNNEn9uclwR5gm3l5aYqU=
```
- Generated secret (32+ characters)
- Keep secure - never commit to git

## 🚀 Deployment Steps

1. **Connect Repository:**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Add new site → Import from GitHub
   - Select repository: `Ghost247-bot/cesclair`
   - Branch: `main`

2. **Set Environment Variables:**
   - Go to Site settings → Environment variables
   - Add all 3 required variables above
   - Select all scopes (Production, Preview, Branch)

3. **Deploy:**
   - Click "Deploy site"
   - Wait for build to complete (2-5 minutes)

4. **Verify:**
   - Test site functionality
   - Check build logs for errors
   - Update `NEXT_PUBLIC_SITE_URL` if needed

## 📋 Post-Deployment

- [ ] Test authentication (sign up/login)
- [ ] Test database operations
- [ ] Test file uploads
- [ ] Test document viewing/downloading
- [ ] Monitor function logs

## 🔗 Quick Links

- [Netlify Dashboard](https://app.netlify.com)
- [Full Setup Guide](./NETLIFY_DEPLOYMENT_SETUP.md)
- [Environment Variables Guide](./NETLIFY_ENV_CHECKLIST.md)

---

**Status:** ✅ Ready for deployment!

