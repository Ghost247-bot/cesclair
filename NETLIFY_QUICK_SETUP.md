# 🚀 Netlify Quick Setup Guide

Complete your Netlify deployment in 5 minutes!

## ✅ Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] Database is set up and accessible
- [ ] Environment variables are ready

## 📝 Step-by-Step Setup

### 1. Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect to **GitHub** and authorize Netlify
4. Select your repository: `Ghost247-bot/cesclair`
5. Netlify will auto-detect settings from `netlify.toml`

### 2. Set Environment Variables

**Before deploying**, add these in Netlify Dashboard:

**Go to:** Site settings → Environment variables → Add variable

#### Required Variables:

```bash
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

```bash
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
```
*(Update after first deployment with actual URL)*

```bash
BETTER_AUTH_SECRET=your-generated-secret-here
```

**Generate secret:**
```bash
npm run generate-secret
```

#### Optional Variables (if using DocuSign):

```bash
DOCUSIGN_USER_ID=your-user-id
DOCUSIGN_ACCOUNT_ID=your-account-id
DOCUSIGN_BASE_PATH=https://na4.docusign.net
DOCUSIGN_INTEGRATION_KEY=your-integration-key
DOCUSIGN_PRIVATE_KEY=your-private-key
```

**Important:** 
- ✅ Select all scopes: Production, Deploy previews, Branch deploys
- ✅ Click "Save" after each variable
- ✅ Trigger new deployment after adding variables

### 3. Deploy

1. Click **"Deploy site"** in Netlify
2. Wait for build to complete (5-10 minutes first time)
3. Your site will be live at: `https://random-name.netlify.app`

### 4. Update Site URL

After deployment:

1. Copy your Netlify URL (e.g., `https://your-site-123.netlify.app`)
2. Go to **Environment variables**
3. Update `NEXT_PUBLIC_SITE_URL` with your actual URL
4. Trigger a new deployment

### 5. Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Enter your domain (e.g., `cesclair.store`)
4. Follow DNS configuration instructions
5. Wait for SSL certificate (automatic)

## 🔍 Verify Deployment

### Test These URLs:

1. **Homepage:** `https://your-site.netlify.app`
2. **Diagnostics:** `https://your-site.netlify.app/api/test/production-diagnostics`
3. **Database Test:** `https://your-site.netlify.app/api/test/db-connection`
4. **Login:** `https://your-site.netlify.app/everworld/login`

### Check Build Logs:

- Go to **Deploys** tab
- Click on latest deployment
- Verify: ✅ Build successful, ✅ No errors

### Check Function Logs:

- Go to **Functions** tab
- Monitor for any errors
- Check execution times

## 🐛 Common Issues

### Build Fails

**Solution:**
- Check build logs for specific error
- Verify all dependencies in `package.json`
- Ensure Node.js 20 is used

### Environment Variables Not Working

**Solution:**
- Redeploy after adding variables
- Verify variable names (case-sensitive)
- Check variable scopes are selected

### Database Connection Error

**Solution:**
- Use **pooler** endpoint (not direct)
- Verify `DATABASE_URL` format
- Check database is not sleeping (Neon free tier)

### Authentication Not Working

**Solution:**
- Verify `NEXT_PUBLIC_SITE_URL` matches actual domain
- Check `BETTER_AUTH_SECRET` is set
- Review function logs for errors

## 📚 Additional Resources

- **Full Setup Guide:** See `NETLIFY_SETUP.md`
- **Environment Variables:** See `NETLIFY_ENV_CHECKLIST.md`
- **Troubleshooting:** See `NETLIFY_SETUP.md` → Troubleshooting section

## 🎯 Quick Commands

```bash
# Generate auth secret
npm run generate-secret

# Check database connection
npm run db:check

# Build locally (test before deploy)
npm run build

# Deploy via CLI (optional)
netlify deploy --prod
```

## ✅ Post-Deployment Checklist

- [ ] Site loads successfully
- [ ] Diagnostics endpoint returns OK
- [ ] Database connection works
- [ ] Authentication works
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Environment variables verified

---

**Need Help?** Check the full guide in `NETLIFY_SETUP.md` or review build/function logs in Netlify Dashboard.

