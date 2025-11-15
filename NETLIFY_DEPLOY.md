# Netlify Deployment Guide

## Quick Deploy via Netlify Web Interface

Since your code is already on GitHub at `https://github.com/Ghost247-bot/cesclair`, the easiest way to deploy is through the Netlify web interface.

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com/)
2. Click **"Add new site"** → **"Import an existing project"**
3. Click **"Connect to Git provider"** and select **GitHub**
4. Authorize Netlify to access your GitHub repositories
5. Select the repository: **`Ghost247-bot/cesclair`**

### Step 2: Configure Build Settings

Netlify will automatically detect Next.js from your `netlify.toml` file. The settings should be:
- **Build command:** `npm run build` (auto-detected)
- **Publish directory:** (handled automatically by @netlify/plugin-nextjs)
- **Base directory:** (leave empty)

### Step 3: Set Environment Variables

Before deploying, you **must** set the following environment variables in Netlify:

1. Go to **Site settings** → **Environment variables**
2. Add the following variables:

#### Required Environment Variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
BETTER_AUTH_SECRET=inFvd2NoE+kpwOMYTAhaWiQCb6qnAX7fP/tNaaiNb14=
```

```
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
```
*(Update this after deployment with your actual Netlify URL)*

#### Optional Environment Variables (if using SignWell):

```
SIGNWELL_API_KEY=your-signwell-api-key
SIGNWELL_API_BASE=https://www.signwell.com/api/v1
```

### Step 4: Deploy

1. Click **"Deploy site"**
2. Netlify will:
   - Install dependencies (`npm install`)
   - Build your Next.js app (`npm run build`)
   - Deploy to production
3. Wait for the deployment to complete (usually 2-5 minutes)

### Step 5: Update Site URL

After the first deployment:

1. Note your Netlify URL (e.g., `https://cesclair-xyz123.netlify.app`)
2. Go to **Site settings** → **Environment variables**
3. Update `NEXT_PUBLIC_SITE_URL` with your actual Netlify URL
4. Also update `BETTER_AUTH_URL` if you set it
5. Go to **Deploys** → **Trigger deploy** → **Clear cache and deploy site**

### Step 6: Verify Deployment

1. Visit your Netlify URL
2. Check that the site loads correctly
3. Test authentication (sign up, sign in)
4. Verify database connectivity
5. Test API routes

## Troubleshooting

### Build Fails

- Check build logs in Netlify dashboard
- Verify all environment variables are set
- Ensure Node version is 20 (configured in netlify.toml)
- Check that `package.json` has correct build scripts

### Authentication Not Working

- Verify `NEXT_PUBLIC_SITE_URL` matches your Netlify URL
- Check `BETTER_AUTH_SECRET` is set correctly
- Verify `DATABASE_URL` is accessible from Netlify
- Check trusted origins in `src/lib/auth.ts`

### Database Connection Issues

- Verify `DATABASE_URL` is correct
- Check that Neon database allows connections from Netlify
- Verify SSL mode is set correctly in connection string

## Continuous Deployment

Once connected, Netlify will automatically deploy:
- Every push to the `main` branch (production)
- Every pull request (preview deployments)

## Custom Domain (Optional)

1. Go to **Domain settings**
2. Click **"Add custom domain"**
3. Follow the DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` with your custom domain
5. Redeploy to apply changes

## Need Help?

- [Netlify Documentation](https://docs.netlify.com/)
- [Next.js on Netlify](https://docs.netlify.com/integrations/frameworks/nextjs/)
- [Netlify Support](https://www.netlify.com/support/)

