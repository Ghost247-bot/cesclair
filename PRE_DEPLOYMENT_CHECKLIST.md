# Pre-Deployment Checklist for Netlify

Use this checklist before deploying to ensure everything is ready.

## ✅ Code & Configuration

- [ ] All code changes committed to GitHub
- [ ] `netlify.toml` is configured correctly
- [ ] `next.config.ts` is optimized for production
- [ ] `package.json` has all required dependencies
- [ ] Build command works locally: `npm run build`

## ✅ Environment Variables

Set these in Netlify Dashboard → Environment Variables:

- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
  - Value: `postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require`
  - Scopes: ✅ Production ✅ Deploy previews ✅ Branch deploys

- [ ] `NEXT_PUBLIC_SITE_URL` - Production URL
  - Value: `https://cesclair.store`
  - Scopes: ✅ Production ✅ Deploy previews ✅ Branch deploys

- [ ] `BETTER_AUTH_SECRET` - Auth secret key
  - Generate: `npm run generate-secret`
  - Copy the generated value
  - Scopes: ✅ Production ✅ Deploy previews ✅ Branch deploys

## ✅ Database

- [ ] Database connection tested: `npm run db:check`
- [ ] All migrations applied to production database
- [ ] Required tables exist: `user`, `session`, `account`, `verification`
- [ ] Database is accessible from Netlify (not in sleep mode)

## ✅ Build Test

Test build locally before deploying:

```bash
# Clean install
rm -rf node_modules .next
npm install

# Test build
npm run build

# Check for errors
# Should complete without errors
```

- [ ] Build completes successfully
- [ ] No TypeScript errors
- [ ] No missing dependencies
- [ ] Build output is generated

## ✅ Git Repository

- [ ] All changes pushed to GitHub
- [ ] Main branch is up to date
- [ ] No sensitive files committed (.env, secrets, etc.)
- [ ] `.gitignore` includes `.env*` files

## ✅ Netlify Setup

- [ ] Netlify account created
- [ ] Site connected to GitHub repository
- [ ] Build settings configured:
  - Build command: `npm run build`
  - Publish directory: `.next` (auto-handled by plugin)
  - Node version: `20.x`
- [ ] Environment variables added
- [ ] Custom domain configured (cesclair.store)

## ✅ Files Ready

Verify these files exist and are correct:

- [ ] `netlify.toml` - Build configuration
- [ ] `next.config.ts` - Next.js configuration
- [ ] `package.json` - Dependencies and scripts
- [ ] `.env.example` - Example environment variables
- [ ] `PRODUCTION_CHECKLIST.md` - Deployment guide
- [ ] `NETLIFY_DEPLOYMENT.md` - Netlify-specific guide

## 🚀 Ready to Deploy

Once all items are checked:

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Ready for Netlify deployment"
   git push origin main
   ```

2. **Deploy on Netlify:**
   - Go to Netlify Dashboard
   - Site should auto-deploy from GitHub
   - OR manually trigger: **Deploys** → **Trigger deploy**

3. **Monitor Deployment:**
   - Watch build logs
   - Check for errors
   - Wait for "Published" status

4. **Post-Deployment Verification:**
   - Visit: `https://cesclair.store/api/test/production-diagnostics`
   - Check all statuses are "ok"
   - Test login: `https://cesclair.store/everworld/login`

## 🔍 Post-Deployment Checks

After deployment:

- [ ] Site loads correctly
- [ ] Diagnostic endpoint works
- [ ] Database connection successful
- [ ] Login functionality works
- [ ] No console errors
- [ ] Functions are working
- [ ] Environment variables loaded

## 📝 Quick Commands Reference

```bash
# Generate auth secret
npm run generate-secret

# Check database
npm run db:check

# Test build
npm run build

# Check git status
git status

# Push to GitHub
git push origin main
```

## ⚠️ Common Issues to Avoid

- ❌ Don't commit `.env` files
- ❌ Don't forget to set environment variables in Netlify
- ❌ Don't deploy without testing build locally
- ❌ Don't forget to apply database migrations
- ❌ Don't use localhost URLs in production

---

**Status:** ⬜ Not Started | 🟡 In Progress | ✅ Complete

