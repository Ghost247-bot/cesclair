# Netlify Deployment Checklist

Use this checklist to ensure your site is ready for deployment on Netlify.

## ✅ Pre-Deployment Checklist

### Configuration Files
- [x] `netlify.toml` - Configured with Next.js 15 settings
- [x] `package.json` - Includes `@netlify/plugin-nextjs`
- [x] `.nvmrc` - Node.js version 20 specified
- [x] `next.config.ts` - Optimized for Netlify

### Code Status
- [x] All code committed to GitHub
- [x] Build command works locally: `npm run build`
- [x] No critical errors in build logs

## 🔐 Environment Variables (REQUIRED)

Set these in Netlify Dashboard → Site configuration → Environment variables:

### Required Variables:

- [ ] `DATABASE_URL`
  - **What:** Neon PostgreSQL connection string
  - **Format:** `postgresql://user:password@host/database?sslmode=require`
  - **Important:** Use the **pooler** endpoint (ends with `-pooler`) for serverless
  - **Where to get:** Neon Dashboard → Your Project → Connection String → Pooler

- [ ] `NEXT_PUBLIC_SITE_URL`
  - **What:** Your production site URL
  - **Example:** `https://cesclair.store` or `https://your-site.netlify.app`
  - **Important:** Must match your actual Netlify site URL

- [ ] `BETTER_AUTH_SECRET`
  - **What:** Secret key for authentication
  - **How to generate:** Run `npm run generate-secret` locally
  - **Format:** Random 32+ character string
  - **Important:** Keep this secret and don't share it

### Optional Variables:

- [ ] `BETTER_AUTH_URL` - Only if different from `NEXT_PUBLIC_SITE_URL`
- [ ] `DATABASE_DEBUG` - Set to `"true"` for troubleshooting (remove in production)

## 🚀 Deployment Steps

### Option 1: Connect GitHub Repository (Recommended)

1. [ ] Go to [Netlify Dashboard](https://app.netlify.com)
2. [ ] Click **Add new site** → **Import an existing project**
3. [ ] Connect your GitHub account
4. [ ] Select repository: `Ghost247-bot/cesclair`
5. [ ] Netlify will auto-detect settings from `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `.next` (handled by plugin)
   - Node version: `20` (from `.nvmrc`)
6. [ ] Add all environment variables (see above)
7. [ ] Click **Deploy site**

### Option 2: Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize (first time only)
netlify init

# Deploy
netlify deploy --prod
```

## ✅ Post-Deployment Verification

After deployment, verify:

1. [ ] **Build succeeded** - Check Netlify build logs
2. [ ] **Site loads** - Visit your Netlify URL
3. [ ] **Favicon appears** - Check browser tab
4. [ ] **Database connection** - Visit `/api/test/production-diagnostics`
5. [ ] **Authentication works** - Test login at `/everworld/login`
6. [ ] **API routes work** - Test a few API endpoints
7. [ ] **No console errors** - Check browser console

## 🔍 Diagnostic Endpoints

Use these to verify your deployment:

- **System Health:** `https://your-site.netlify.app/api/test/production-diagnostics`
- **Database Connection:** `https://your-site.netlify.app/api/test/db-connection`
- **Auth Setup:** `https://your-site.netlify.app/api/test/auth-setup`

## 🐛 Common Issues & Solutions

### Build Fails

**Issue:** Build timeout or errors
- **Solution:** Check build logs in Netlify Dashboard
- **Check:** Ensure all dependencies are in `package.json`
- **Verify:** Run `npm run build` locally first

### Environment Variables Not Working

**Issue:** Variables not accessible
- **Solution:** Redeploy after adding variables
- **Check:** Variable names are case-sensitive
- **Verify:** Use diagnostic endpoint to check

### Database Connection Errors

**Issue:** Can't connect to database
- **Solution:** Use pooler endpoint (not direct connection)
- **Check:** Database is not in sleep mode (Neon free tier)
- **Verify:** Connection string includes `?sslmode=require`

### 500 Errors on Login

**Issue:** Authentication failing
- **Solution:** Check `NEXT_PUBLIC_SITE_URL` matches actual URL
- **Check:** `BETTER_AUTH_SECRET` is set
- **Verify:** Database tables exist (user, session, account)

## 📊 Quick Reference

### Essential Commands:
```bash
# Generate auth secret
npm run generate-secret

# Check database
npm run db:check

# Build locally
npm run build

# Deploy to Netlify (CLI)
netlify deploy --prod
```

### Essential URLs:
- **Netlify Dashboard:** https://app.netlify.com
- **GitHub Repository:** https://github.com/Ghost247-bot/cesclair
- **Diagnostics:** `https://your-site.netlify.app/api/test/production-diagnostics`

## 📝 Notes

- **First deployment** may take 5-10 minutes
- **Subsequent deployments** are faster (caching)
- **Database sleep mode:** Neon free tier databases sleep after inactivity
- **Function cold starts:** First request after inactivity may be slower

---

**Ready to deploy?** Follow the steps above and your site will be live! 🚀

