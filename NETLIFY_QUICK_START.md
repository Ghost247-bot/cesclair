# 🚀 Netlify Quick Start Guide

Deploy your Next.js app to Netlify in 5 minutes!

## ✅ Prerequisites Checklist

- [ ] Code pushed to GitHub (`Ghost247-bot/cesclair`)
- [ ] Neon PostgreSQL database with pooler endpoint
- [ ] Netlify account ([Sign up here](https://app.netlify.com))

---

## 🎯 5-Minute Setup

### Step 1: Generate Auth Secret (1 minute)

```bash
npm run generate-secret
```

**Copy the generated secret** - you'll need it in Step 3.

**Example output:**
```
BETTER_AUTH_SECRET=Az3ivuZLfw89yTAOPmKlLA6qeRw3KlMFZnE0JrAyl+4=
```

### Step 2: Connect Repository (1 minute)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect **GitHub** (authorize if needed)
4. Select repository: **`Ghost247-bot/cesclair`**
5. Netlify auto-detects settings from `netlify.toml`
6. Click **"Deploy site"**

**Wait for first deployment** (5-10 minutes)

### Step 3: Add Environment Variables (2 minutes)

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
Value: [paste secret from Step 1]
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

### Step 4: Redeploy (1 minute)

1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for deployment (5-10 minutes)

### Step 5: Test Deployment (1 minute)

Visit these URLs to verify:

- ✅ **Homepage:** `https://your-site.netlify.app`
- ✅ **API Test:** `https://your-site.netlify.app/api/test/production-diagnostics`
- ✅ **Login:** `https://your-site.netlify.app/cesworld/login`
- ✅ **Checkout:** `https://your-site.netlify.app/checkout`

---

## 🔧 Configuration Summary

### Build Settings (Auto-configured)

From `netlify.toml`:
- ✅ **Build command:** `npm run build`
- ✅ **Node version:** `20`
- ✅ **Plugin:** `@netlify/plugin-nextjs`
- ✅ **Publish directory:** *(auto-handled by plugin)*

### Security Headers (Auto-configured)

From `netlify.toml`:
- ✅ Security headers enabled
- ✅ Cache headers configured
- ✅ SSL/TLS enforced

---

## 🐛 Quick Troubleshooting

### Build Fails
- Check build logs for specific error
- Verify Node.js 20 is set
- Ensure all dependencies are in `package.json`

### Variables Not Working
- Redeploy after adding variables
- Verify variable names (case-sensitive)
- Check all scopes are selected

### Database Connection Error
- Use **pooler endpoint** (not direct)
- Verify `DATABASE_URL` format
- Check `?sslmode=require` is present

### Auth Not Working
- Verify `NEXT_PUBLIC_SITE_URL` matches actual URL
- Check `BETTER_AUTH_SECRET` is set correctly
- Review function logs

---

## 📋 Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] Environment variables set
- [ ] Database connection works
- [ ] Authentication works (sign up/login)
- [ ] Checkout flow works
- [ ] Order placement works
- [ ] Custom domain configured (optional)

---

## 📚 Additional Resources

- **Full Setup Guide:** `NETLIFY_SETUP_GUIDE.md`
- **Environment Variables:** `NETLIFY_ENV_VARIABLES.md`
- **Deployment Checklist:** `NETLIFY_DEPLOYMENT_CHECKLIST.md`

---

## 🆘 Need Help?

1. Check Netlify build logs
2. Review function logs
3. Test locally with production env vars
4. Check [Netlify Status](https://www.netlifystatus.com/)

---

**✅ Ready?** Follow the 5 steps above and your site will be live in minutes! 🎉
