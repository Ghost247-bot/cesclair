# Netlify Deployment Guide

Complete guide for deploying your Next.js app to Netlify.

## 📋 Pre-Deployment Checklist

### 1. Environment Variables Setup

Before deploying, ensure these environment variables are set in Netlify:

#### Required Variables:
- ✅ `DATABASE_URL` - Your Neon PostgreSQL connection string
- ✅ `NEXT_PUBLIC_SITE_URL` - `https://cesclair.store`
- ✅ `BETTER_AUTH_SECRET` - Secure random string (generate with `npm run generate-secret`)

#### How to Set:
1. Go to Netlify Dashboard → Your Site → **Site configuration** → **Environment variables**
2. Add each variable with appropriate scopes (Production, Deploy previews, Branch deploys)
3. Click **Save**

### 2. Database Setup

Ensure your Neon database is ready:
- ✅ Database is created and accessible
- ✅ All migrations have been applied
- ✅ Connection string is correct

**Test connection:**
```bash
npm run db:check
```

### 3. Build Configuration

The project is configured for Netlify with:
- ✅ `netlify.toml` - Build settings
- ✅ Next.js 15.3.5 - Compatible with Netlify
- ✅ Serverless functions ready

## 🚀 Deployment Steps

### Option 1: Deploy via GitHub (Recommended)

1. **Connect Repository:**
   - Go to Netlify Dashboard
   - Click **Add new site** → **Import an existing project**
   - Connect your GitHub repository
   - Select the repository

2. **Configure Build Settings:**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `.next` (auto-detected by Netlify plugin)
   - Node version: `20.x` (or latest LTS)

3. **Set Environment Variables:**
   - Add all required environment variables (see above)
   - Save settings

4. **Deploy:**
   - Click **Deploy site**
   - Wait for build to complete
   - Your site will be live!

### Option 2: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize and deploy
netlify init
netlify deploy --prod
```

### Option 3: Manual Deploy

1. Build locally:
   ```bash
   npm run build
   ```

2. Deploy to Netlify:
   ```bash
   netlify deploy --prod --dir=.next
   ```

## ⚙️ Netlify Configuration

### Build Settings (netlify.toml)

The `netlify.toml` file contains:
- Build command
- Publish directory
- Node version
- Plugin configuration

### Next.js Plugin

Netlify automatically uses the `@netlify/plugin-nextjs` plugin which:
- Handles Next.js routing
- Optimizes serverless functions
- Manages API routes
- Handles image optimization

## 🔍 Post-Deployment Verification

### 1. Check Build Logs

After deployment:
- Go to **Deploys** tab
- Click on the latest deployment
- Review build logs for any errors

### 2. Test Diagnostic Endpoint

Visit: `https://cesclair.store/api/test/production-diagnostics`

This will show:
- ✅ Environment variables status
- ✅ Database connection status
- ✅ Auth configuration status

### 3. Test Login

1. Visit: `https://cesclair.store/everworld/login`
2. Try logging in with a test account
3. Check browser console for errors
4. Verify session is created

### 4. Check Function Logs

- Go to **Functions** tab in Netlify
- Check `/api/auth/[...all]` function logs
- Look for any errors or warnings

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build timeout or memory errors
- **Fix:** Upgrade Netlify plan or optimize build
- **Check:** Build logs for specific error

**Issue:** Missing dependencies
- **Fix:** Ensure `package.json` has all dependencies
- **Check:** `npm install` runs successfully locally

### Environment Variables Not Working

**Issue:** Variables not accessible
- **Fix:** Redeploy after adding variables
- **Check:** Variable names are correct (case-sensitive)
- **Verify:** Scopes are set correctly

### Database Connection Errors

**Issue:** Can't connect to database
- **Fix:** Verify `DATABASE_URL` is correct
- **Check:** Database is not in sleep mode (Neon free tier)
- **Test:** Use diagnostic endpoint

### 500 Errors on Login

**Issue:** Authentication failing
- **Fix:** Check `NEXT_PUBLIC_SITE_URL` is set correctly
- **Check:** `BETTER_AUTH_SECRET` is set
- **Verify:** Database tables exist
- **Review:** Server function logs

### Functions Not Working

**Issue:** API routes return 404
- **Fix:** Ensure Next.js plugin is installed
- **Check:** Routes are in `src/app/api/` directory
- **Verify:** Build completed successfully

## 📊 Monitoring

### Netlify Analytics

Enable Netlify Analytics to monitor:
- Page views
- Function invocations
- Build times
- Error rates

### Function Logs

Monitor serverless function logs:
- Go to **Functions** tab
- Click on function name
- View real-time logs

## 🔄 Continuous Deployment

Once connected to GitHub:
- Every push to `main` branch triggers deployment
- Pull requests create deploy previews
- Branch deploys available for testing

## 📝 Important Notes

1. **Never commit secrets** - Use environment variables only
2. **Test locally first** - Run `npm run build` before deploying
3. **Monitor first deployment** - Check logs carefully
4. **Keep database awake** - Neon free tier sleeps after inactivity
5. **Use pooler connection** - Better for serverless functions

## 🎯 Quick Reference

### Essential Commands:
```bash
# Generate auth secret
npm run generate-secret

# Check database
npm run db:check

# Build locally
npm run build

# Deploy to Netlify
netlify deploy --prod
```

### Essential URLs:
- **Site:** https://cesclair.store
- **Diagnostics:** https://cesclair.store/api/test/production-diagnostics
- **Login:** https://cesclair.store/everworld/login
- **Netlify Dashboard:** https://app.netlify.com

---

**Need Help?** Check the diagnostic endpoint or review Netlify build logs for specific error messages.

