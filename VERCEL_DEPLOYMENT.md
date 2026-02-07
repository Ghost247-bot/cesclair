# 🚀 Vercel Deployment Guide

Complete setup guide for deploying your Next.js application to Vercel.

**Quick setup:** See **[VERCEL_SETUP.md](./VERCEL_SETUP.md)** for a short checklist and env list.

## ✅ Prerequisites

- [x] Vercel account (free tier works)
- [x] Neon PostgreSQL database with connection string
- [x] GitHub repository connected
- [x] Node.js 18+ (Vercel auto-detects from package.json)

## 📋 Quick Setup Checklist

### Step 1: Connect Repository to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New Project"**
3. Import your GitHub repository: **`Ghost247-bot/cesclair`**
4. Vercel will automatically detect Next.js framework
5. Review build settings (should auto-detect from `vercel.json`)

**Build Settings (Auto-detected):**
- Framework: Next.js
- Build Command: `npm run build`
- Output Directory: `.next` (auto-handled)
- Install Command: `npm install`
- Node.js Version: 18.x or 20.x (auto-detected)

### Step 2: Set Environment Variables

Before deploying, you **must** set the following environment variables in Vercel:

1. Go to **Project Settings** → **Environment Variables**
2. Add the following variables for **Production**, **Preview**, and **Development** environments:

#### 🔴 Required Environment Variables:

**1. DATABASE_URL**
```
Variable: DATABASE_URL
Value: postgresql://neondb_owner:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
Scope: ✓ Production ✓ Preview ✓ Development
```

**Important:**
- Use your Neon PostgreSQL connection string
- For better performance, use the pooler endpoint: `-pooler` in hostname
- Include `?sslmode=require` for SSL

**2. BETTER_AUTH_SECRET**
```
Variable: BETTER_AUTH_SECRET
Value: [generate using: npm run generate-secret]
Scope: ✓ Production ✓ Preview ✓ Development
```

**How to generate:**
```bash
npm run generate-secret
# or
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**3. NEXT_PUBLIC_SITE_URL**
```
Variable: NEXT_PUBLIC_SITE_URL
Value: https://your-project.vercel.app
Scope: ✓ Production ✓ Preview ✓ Development
```

**Important:**
- Update after first deployment with your actual Vercel URL
- Must use `https://` protocol
- No trailing slash
- For custom domain, use: `https://yourdomain.com`

#### 🟡 Optional Environment Variables:

**4. DOCUSIGN_USER_ID** (if using DocuSign)
```
Variable: DOCUSIGN_USER_ID
Value: your-docusign-user-id
Scope: ✓ Production ✓ Preview
```

**5. DOCUSIGN_ACCOUNT_ID** (if using DocuSign)
```
Variable: DOCUSIGN_ACCOUNT_ID
Value: your-docusign-account-id
Scope: ✓ Production ✓ Preview
```

**6. DOCUSIGN_BASE_PATH** (if using DocuSign)
```
Variable: DOCUSIGN_BASE_PATH
Value: https://na4.docusign.net
Scope: ✓ Production ✓ Preview
```

**7. DOCUSIGN_INTEGRATION_KEY** (if using DocuSign)
```
Variable: DOCUSIGN_INTEGRATION_KEY
Value: your-docusign-integration-key
Scope: ✓ Production ✓ Preview
```

**8. DOCUSIGN_PRIVATE_KEY** (if using DocuSign)
```
Variable: DOCUSIGN_PRIVATE_KEY
Value: your-docusign-private-key
Scope: ✓ Production ✓ Preview
```

**9. BETTER_AUTH_URL** (optional)
```
Variable: BETTER_AUTH_URL
Value: https://your-project.vercel.app
Scope: ✓ Production ✓ Preview
```
Same as your site URL if you want to explicitly set the auth base URL. If unset, the app uses NEXT_PUBLIC_SITE_URL or VERCEL_URL.

**10. NEXT_PUBLIC_TAWK_PROPERTY_ID** (if using Tawk.to chat)
```
Variable: NEXT_PUBLIC_TAWK_PROPERTY_ID
Value: your-tawk-property-id
Scope: ✓ Production ✓ Preview
```

**11. NEXT_PUBLIC_TAWK_WIDGET_ID** (if using Tawk.to chat)
```
Variable: NEXT_PUBLIC_TAWK_WIDGET_ID
Value: default (or your widget ID)
Scope: ✓ Production ✓ Preview
```

**12. SIGNWELL_API_KEY** (if using SignWell)
```
Variable: SIGNWELL_API_KEY
Value: your-signwell-api-key
Scope: ✓ Production ✓ Preview
```

**13. SIGNWELL_API_BASE** (if using SignWell)
```
Variable: SIGNWELL_API_BASE
Value: https://www.signwell.com/api/v1
Scope: ✓ Production ✓ Preview
```

### Step 3: Deploy

1. Click **"Deploy"** button
2. Vercel will:
   - Install dependencies (`npm install`)
   - Build your Next.js app (`npm run build`)
   - Deploy to production
3. Wait for deployment to complete (usually 2-5 minutes)

### Step 4: Update Site URL

After first deployment:

1. Copy your Vercel deployment URL (e.g., `https://your-project.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Update `NEXT_PUBLIC_SITE_URL` with your actual Vercel URL
4. Redeploy (or wait for automatic redeploy on next push)

## 🔧 Advanced Configuration

### Custom Domain Setup

1. Go to **Project Settings** → **Domains**
2. Add your custom domain
3. Follow DNS configuration instructions
4. Update `NEXT_PUBLIC_SITE_URL` to your custom domain
5. Wait for SSL certificate provisioning (automatic)

### Environment-Specific Variables

You can set different values for different environments:

- **Production**: Live site
- **Preview**: Pull request previews
- **Development**: Local development (via Vercel CLI)

### Function Configuration

API routes are automatically configured with:
- Max duration: 30 seconds (configurable in `vercel.json`)
- Automatic serverless function creation
- Edge runtime support (if configured)

## 📝 Post-Deployment Checklist

- [ ] Verify all environment variables are set
- [ ] Test database connection
- [ ] Test authentication flow
- [ ] Verify API routes are working
- [ ] Check build logs for any warnings
- [ ] Test production build locally: `npm run build && npm run start`
- [ ] Set up custom domain (if applicable)
- [ ] Configure analytics (optional)
- [ ] Set up monitoring (optional)

## 🐛 Troubleshooting

### Build Failures

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Test build locally: `npm run build`
4. Check for TypeScript errors: `npm run lint`

### Database Connection Issues

1. Verify `DATABASE_URL` is correct
2. Check if database allows connections from Vercel IPs
3. Use pooler endpoint for better connection handling
4. Verify SSL mode is set: `?sslmode=require`

### Authentication Issues

1. Verify `BETTER_AUTH_SECRET` is set and matches local
2. Check `NEXT_PUBLIC_SITE_URL` matches your Vercel URL
3. Verify callback URLs in auth configuration

### API Route Timeouts

1. Increase function timeout in `vercel.json`:
```json
{
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  }
}
```

## 🔗 Useful Links

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)
- [Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Custom Domains](https://vercel.com/docs/concepts/projects/domains)

## 📞 Support

If you encounter issues:
1. Check Vercel deployment logs
2. Review build output
3. Test locally with production build
4. Check Vercel status page: https://vercel-status.com

