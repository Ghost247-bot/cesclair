# Netlify Deployment Setup Guide

Complete setup guide for deploying your Next.js application to Netlify.

## 📋 Prerequisites

- Node.js 20.x (specified in `.nvmrc`)
- A Netlify account (free tier works)
- A Neon PostgreSQL database
- GitHub repository (for continuous deployment)

## 🚀 Quick Start

### 1. Install Dependencies

First, install the Netlify Next.js plugin:

```bash
npm install
```

The `@netlify/plugin-nextjs` package is already included in `package.json`.

### 2. Environment Variables Setup

Set these environment variables in Netlify Dashboard:

#### Required Variables:

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | Neon PostgreSQL connection string (use pooler endpoint) | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXT_PUBLIC_SITE_URL` | Your production site URL | `https://cesclair.store` |
| `BETTER_AUTH_SECRET` | Secret key for authentication (generate with `npm run generate-secret`) | Random 32+ character string |

#### Optional Variables:

| Variable | Description | When to Use |
|----------|-------------|-------------|
| `BETTER_AUTH_URL` | Alternative auth URL | If different from `NEXT_PUBLIC_SITE_URL` |
| `DATABASE_DEBUG` | Enable database debug logging | Set to `"true"` for troubleshooting |
| `NEXT_PUBLIC_BASE_URL` | Base URL for API calls | Only if different from site URL |

#### How to Set Environment Variables:

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Navigate to **Site configuration** → **Environment variables**
4. Click **Add variable**
5. Enter variable name and value
6. Select scopes:
   - ✅ **Production** - For production deployments
   - ✅ **Deploy previews** - For PR previews
   - ✅ **Branch deploys** - For branch-specific deployments
7. Click **Save**

**Important:** After adding/updating environment variables, you must trigger a new deployment for changes to take effect.

### 3. Generate Auth Secret

Generate a secure auth secret locally:

```bash
npm run generate-secret
```

Copy the output and add it as `BETTER_AUTH_SECRET` in Netlify.

### 4. Database Setup

#### Ensure Database is Ready:

1. **Verify Connection:**
   ```bash
   npm run db:check
   ```

2. **Apply Migrations:**
   - Migrations should be applied before first deployment
   - Use Neon Console or run migrations via API endpoint

3. **Use Pooler Connection:**
   - For serverless functions, use the **pooler** endpoint from Neon
   - Format: `postgresql://user:pass@host-pooler/db?sslmode=require`
   - Pooler endpoints are optimized for serverless environments

## 📦 Deployment Methods

### Option 1: GitHub Integration (Recommended)

**Best for:** Continuous deployment, automatic previews, team collaboration

1. **Connect Repository:**
   - Go to Netlify Dashboard
   - Click **Add new site** → **Import an existing project**
   - Connect your GitHub account
   - Select your repository

2. **Configure Build Settings:**
   - Netlify will auto-detect settings from `netlify.toml`:
     - Build command: `npm run build`
     - Publish directory: `.next` (handled by plugin)
     - Node version: `20` (from `.nvmrc`)

3. **Set Environment Variables:**
   - Add all required variables (see above)
   - Save settings

4. **Deploy:**
   - Click **Deploy site**
   - Netlify will build and deploy automatically
   - Future pushes to `main` branch will auto-deploy

**Benefits:**
- ✅ Automatic deployments on push
- ✅ Deploy previews for pull requests
- ✅ Branch deploys for testing
- ✅ Build logs and history

### Option 2: Netlify CLI

**Best for:** Quick deployments, testing, manual control

```bash
# Install Netlify CLI globally
npm install -g netlify-cli

# Login to Netlify
netlify login

# Initialize site (first time only)
netlify init

# Deploy to production
netlify deploy --prod

# Deploy preview (for testing)
netlify deploy
```

### Option 3: Drag & Drop

**Best for:** One-time deployments, testing builds

1. Build locally:
   ```bash
   npm run build
   ```

2. Go to Netlify Dashboard → **Sites** → **Add new site** → **Deploy manually**

3. Drag the `.next` folder to the deploy area

**Note:** This method doesn't support serverless functions well. Use GitHub integration for production.

## ⚙️ Configuration Files

### `netlify.toml`

The project includes a pre-configured `netlify.toml` with:

- ✅ Build settings (Node 20, npm flags)
- ✅ Next.js plugin configuration
- ✅ Serverless function settings
- ✅ Security headers
- ✅ Caching headers for static assets

**No manual changes needed** - the configuration is optimized for Next.js 15.

### `.nvmrc`

Specifies Node.js version 20 for consistency across environments.

### `next.config.ts`

Already configured for Netlify:
- ✅ Image optimization
- ✅ Production optimizations
- ✅ Compatible output mode

## 🔍 Post-Deployment Verification

### 1. Check Build Logs

After deployment:
- Go to **Deploys** tab in Netlify Dashboard
- Click on the latest deployment
- Review build logs for errors or warnings
- ✅ Build should complete successfully
- ✅ No missing dependencies
- ✅ No TypeScript/ESLint errors (these are ignored in build)

### 2. Test Diagnostic Endpoint

Visit: `https://your-site.netlify.app/api/test/production-diagnostics`

This endpoint shows:
- ✅ Environment variables status
- ✅ Database connection status
- ✅ Auth configuration status
- ✅ Base URL configuration

**Expected Output:**
```json
{
  "status": "ok",
  "environment": "production",
  "checks": {
    "database": "connected",
    "auth": "configured",
    "baseURL": "https://your-site.netlify.app"
  }
}
```

### 3. Test Authentication

1. Visit: `https://your-site.netlify.app/everworld/login`
2. Try logging in with a test account
3. Check browser console for errors
4. Verify session is created correctly

### 4. Check Function Logs

- Go to **Functions** tab in Netlify Dashboard
- Check `/api/auth/[...all]` function logs
- Look for any errors or warnings
- Monitor function execution times

### 5. Test API Routes

Test key API endpoints:
- `/api/test/production-diagnostics` - System health
- `/api/test/db-connection` - Database connectivity
- `/api/products` - Product listing
- `/api/auth/[...all]` - Authentication

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build timeout or memory errors
- **Solution:** 
  - Upgrade Netlify plan (free tier has limits)
  - Optimize build process
  - Check build logs for specific error

**Issue:** Missing dependencies
- **Solution:**
  - Ensure `package.json` has all dependencies
  - Run `npm install` locally to verify
  - Check `package-lock.json` is committed

**Issue:** TypeScript/ESLint errors
- **Solution:**
  - These are ignored in build (see `next.config.ts`)
  - Fix locally if needed: `npm run lint`

### Environment Variables Not Working

**Issue:** Variables not accessible in functions
- **Solution:**
  - Redeploy after adding variables
  - Verify variable names are correct (case-sensitive)
  - Check variable scopes (Production/Preview/Branch)
  - Use diagnostic endpoint to verify

**Issue:** `NEXT_PUBLIC_*` variables not available
- **Solution:**
  - These must be set in Netlify (not just `.env`)
  - Redeploy after adding
  - Variables are injected at build time

### Database Connection Errors

**Issue:** Can't connect to database
- **Solution:**
  - Verify `DATABASE_URL` is correct
  - Use **pooler** endpoint (not direct connection)
  - Check database is not in sleep mode (Neon free tier)
  - Test with diagnostic endpoint: `/api/test/db-connection`

**Issue:** Connection timeout
- **Solution:**
  - Use pooler endpoint (faster for serverless)
  - Check Neon dashboard for connection limits
  - Verify SSL mode is set: `?sslmode=require`

### Authentication Issues

**Issue:** 500 errors on login
- **Solution:**
  - Check `NEXT_PUBLIC_SITE_URL` is set correctly
  - Verify `BETTER_AUTH_SECRET` is set
  - Check database tables exist (user, session, account)
  - Review function logs for specific errors

**Issue:** Session not persisting
- **Solution:**
  - Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
  - Check cookie settings in browser
  - Review CORS/trusted origins in `src/lib/auth.ts`

### Functions Not Working

**Issue:** API routes return 404
- **Solution:**
  - Ensure `@netlify/plugin-nextjs` is installed
  - Verify routes are in `src/app/api/` directory
  - Check build completed successfully
  - Review function logs in Netlify Dashboard

**Issue:** Function timeout
- **Solution:**
  - Optimize database queries
  - Use connection pooling
  - Check function execution time in logs
  - Consider upgrading Netlify plan for longer timeouts

### Performance Issues

**Issue:** Slow page loads
- **Solution:**
  - Enable caching headers (already configured)
  - Use static generation where possible
  - Optimize images
  - Check function cold starts (first request after inactivity)

## 📊 Monitoring & Analytics

### Netlify Analytics

Enable in Netlify Dashboard:
- **Site configuration** → **Analytics**
- Monitor:
  - Page views
  - Function invocations
  - Build times
  - Error rates

### Function Logs

Monitor serverless functions:
- Go to **Functions** tab
- Click on function name
- View real-time logs
- Set up alerts for errors

### Build Notifications

Configure notifications:
- **Site configuration** → **Build & deploy** → **Deploy notifications**
- Get notified of:
  - Successful deployments
  - Failed builds
  - Deploy previews

## 🔄 Continuous Deployment

Once connected to GitHub:

- ✅ **Automatic deployments** on push to `main`
- ✅ **Deploy previews** for pull requests
- ✅ **Branch deploys** for feature branches
- ✅ **Rollback** to previous deployments

### Branch Deploys

Test changes before merging:
1. Push to feature branch
2. Netlify creates preview deployment
3. Test on preview URL
4. Merge when ready

### Deploy Previews

Every PR gets a unique URL:
- Test changes in isolation
- Share with team for review
- Automatic cleanup after merge/close

## 🔐 Security Best Practices

1. **Never commit secrets:**
   - Use environment variables only
   - `.env` files are in `.gitignore`
   - Review `NETLIFY_SETUP.md` before committing

2. **Use secure connection strings:**
   - Always use `?sslmode=require` for database
   - Use pooler endpoints for serverless

3. **Set proper headers:**
   - Security headers are configured in `netlify.toml`
   - Review and update as needed

4. **Monitor access:**
   - Review function logs regularly
   - Set up alerts for errors
   - Monitor authentication attempts

## 📝 Important Notes

1. **Database Sleep Mode:**
   - Neon free tier databases sleep after inactivity
   - First request after sleep may be slow
   - Consider upgrading or using a keep-alive service

2. **Function Cold Starts:**
   - First request after inactivity may be slower
   - Subsequent requests are faster
   - Normal for serverless functions

3. **Build Time:**
   - First build may take 5-10 minutes
   - Subsequent builds are faster (caching)
   - Monitor build times in dashboard

4. **File Uploads:**
   - Uploaded files in `public/uploads/` are ignored by git
   - Consider using external storage (S3, Cloudinary) for production
   - Current setup stores files in build (not recommended for production)

## 🎯 Quick Reference

### Essential Commands:

```bash
# Generate auth secret
npm run generate-secret

# Check database connection
npm run db:check

# Build locally
npm run build

# Deploy to Netlify (CLI)
netlify deploy --prod
```

### Essential URLs:

- **Netlify Dashboard:** https://app.netlify.com
- **Diagnostics:** `https://your-site.netlify.app/api/test/production-diagnostics`
- **Database Test:** `https://your-site.netlify.app/api/test/db-connection`

### Environment Variables Checklist:

- [ ] `DATABASE_URL` - Neon PostgreSQL connection string
- [ ] `NEXT_PUBLIC_SITE_URL` - Production site URL
- [ ] `BETTER_AUTH_SECRET` - Generated secret key

## 🆘 Getting Help

1. **Check Diagnostic Endpoint:**
   - Visit `/api/test/production-diagnostics`
   - Review all status checks

2. **Review Build Logs:**
   - Netlify Dashboard → Deploys → Latest deployment
   - Look for specific error messages

3. **Check Function Logs:**
   - Netlify Dashboard → Functions
   - Review error messages and stack traces

4. **Test Locally:**
   - Run `npm run build` locally
   - Test with `npm run start`
   - Verify environment variables

---

**Ready to Deploy?** Follow the Quick Start section above and you'll be live in minutes! 🚀

