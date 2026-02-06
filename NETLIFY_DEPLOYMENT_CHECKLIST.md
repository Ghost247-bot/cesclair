# 🚀 Netlify Deployment Checklist

Follow this checklist to deploy your application to Netlify.

## ✅ Pre-Deployment (5 minutes)

### 1. Generate Auth Secret
```bash
npm run generate-secret
```
Copy the generated secret - you'll need it in Netlify.

**Alternative:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 2. Prepare Database URL
- Use the **pooler endpoint** from Neon (not direct connection)
- Format: `postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require`
- Test connection: `npm run db:check`

### 3. Verify Code is Pushed
```bash
git status  # Ensure all changes are committed
git push origin main  # Push to GitHub
```

---

## 🌐 Netlify Setup (10 minutes)

### Step 1: Connect Repository
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect GitHub if not already connected
4. Select repository: **Ghost247-bot/cesclair**
5. Netlify auto-detects settings from `netlify.toml`
6. Click **"Deploy site"** (we'll add env vars after first deployment)

### Step 2: Set Environment Variables
**Go to:** Site settings → Environment variables → Add variable

Add these **REQUIRED** variables:

#### 🔴 Critical Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `DATABASE_URL` | `postgresql://...pooler...?sslmode=require` | Use pooler endpoint |
| `BETTER_AUTH_SECRET` | `[generated-secret]` | From Step 1 above |
| `NEXT_PUBLIC_SITE_URL` | `https://your-site.netlify.app` | Update after first deploy |

#### 🟡 Optional Variables

| Variable | Value | Notes |
|----------|-------|-------|
| `BETTER_AUTH_URL` | `https://your-site.netlify.app` | Only if different from site URL |
| `SIGNWELL_API_KEY` | `your-api-key` | If using SignWell |
| `SIGNWELL_API_BASE` | `https://www.signwell.com/api/v1` | SignWell API base |

**Important Settings:**
- ✅ Check all scopes: **Production**, **Deploy previews**, **Branch deploys**
- ✅ Click **"Save"** after each variable
- ✅ Trigger new deployment after adding variables

### Step 3: Trigger Deployment
1. Go to **Deploys** tab
2. Click **"Trigger deploy"** → **"Clear cache and deploy site"**
3. Wait for build to complete (5-10 minutes first time)

---

## 🔧 Configuration Verification

### Check Build Settings
**Go to:** Site settings → Build & deploy → Build settings

Verify these match `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** *(leave empty - plugin handles it)*
- **Node version:** `20`

### Check Plugin
**Go to:** Site settings → Build & deploy → Plugins

Should see:
- ✅ `@netlify/plugin-nextjs` (auto-installed)

---

## 🧪 Post-Deployment Testing

### 1. Test Homepage
Visit: `https://your-site.netlify.app`

### 2. Test API Endpoints
- Diagnostics: `https://your-site.netlify.app/api/test/production-diagnostics`
- Database: `https://your-site.netlify.app/api/test/db-connection`

### 3. Test Authentication
- Sign up: `https://your-site.netlify.app/cesworld/register`
- Sign in: `https://your-site.netlify.app/cesworld/login`

### 4. Test Checkout Flow
- Add item to cart
- Proceed to checkout
- Complete checkout (test mode)

### 5. Check Function Logs
**Go to:** Functions tab
- Monitor for errors
- Check execution times

---

## 🐛 Common Issues & Fixes

### ❌ Build Fails

**Symptoms:** Build log shows errors

**Solutions:**
1. Check build logs for specific error
2. Verify Node.js 20 is set
3. Ensure all dependencies in `package.json`
4. Try clearing cache and redeploying

### ❌ Environment Variables Not Working

**Symptoms:** API returns undefined/null values

**Solutions:**
1. Redeploy after adding variables
2. Verify variable names (case-sensitive!)
3. Check all scopes are selected
4. Ensure no trailing spaces

### ❌ Database Connection Error

**Symptoms:** 500 errors on database operations

**Solutions:**
1. Use **pooler endpoint** (not direct)
2. Verify `DATABASE_URL` format is correct
3. Check `?sslmode=require` is present
4. Ensure database is not sleeping (Neon free tier)

### ❌ Authentication Not Working

**Symptoms:** Can't sign in/sign up

**Solutions:**
1. Verify `NEXT_PUBLIC_SITE_URL` matches actual Netlify URL
2. Check `BETTER_AUTH_SECRET` is set correctly
3. Review function logs for auth errors
4. Ensure cookies can be set (check domain)

### ❌ Function Timeouts

**Symptoms:** API routes timeout after 10s

**Solutions:**
1. Optimize database queries
2. Use connection pooling
3. Split long operations
4. Upgrade to Netlify Pro (26s timeout)

---

## 📋 Final Checklist

- [ ] Repository connected to Netlify
- [ ] First deployment completed
- [ ] All environment variables set
- [ ] `NEXT_PUBLIC_SITE_URL` updated with actual Netlify URL
- [ ] Site loads successfully
- [ ] Database connection works
- [ ] Authentication works (sign up/login)
- [ ] Checkout flow works
- [ ] Order placement works
- [ ] Order status page works
- [ ] Admin order management works (if admin)
- [ ] Custom domain configured (optional)
- [ ] SSL certificate active

---

## 🚀 Quick Deploy Commands

```bash
# Test build locally
npm run build

# Test database connection
npm run db:check

# Generate auth secret
npm run generate-secret

# Deploy via CLI (if Netlify CLI installed)
netlify deploy --prod
```

---

## 📞 Need Help?

1. Check Netlify build logs in Dashboard
2. Review function logs for runtime errors
3. Test locally with production env vars
4. Check [Netlify Status](https://www.netlifystatus.com/)
5. Review `NETLIFY_SETUP_GUIDE.md` for detailed instructions

---

**✅ Ready to Deploy?** Follow the steps above and your site will be live in minutes! 🎉
