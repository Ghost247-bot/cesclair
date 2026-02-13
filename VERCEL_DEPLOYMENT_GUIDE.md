# Vercel Deployment Guide

## 🚀 Deployment Status

**Current Status:** ⚠️ **BUILD FAILING**
**Latest Attempt:** Production deployment failed with build error

## 🔍 Troubleshooting Steps

### 1. Environment Variables Setup

Go to your Vercel dashboard and add these environment variables:

#### Required Variables:
```
DATABASE_URL=postgresql://your-credentials-here
BETTER_AUTH_SECRET=your-super-secret-key-here
NEXT_PUBLIC_SITE_URL=https://your-domain.vercel.app
```

#### Optional Variables:
```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
RESEND_API_KEY=re_your_api_key_here
```

### 2. Build Configuration Updates

The `vercel.json` has been optimized with:
- ✅ Increased function timeout (30s → 60s)
- ✅ Enhanced security headers
- ✅ Improved caching strategy
- ✅ Better error handling

### 3. Common Deployment Issues

#### Issue: Database Connection
**Solution:** Ensure `DATABASE_URL` is correctly set in Vercel environment variables

#### Issue: Authentication Errors
**Solution:** Set `BETTER_AUTH_SECRET` and `NEXT_PUBLIC_SITE_URL`

#### Issue: Build Timeout
**Solution:** Increased function timeout to 60 seconds

### 4. Manual Deployment Steps

1. **Push Latest Changes:**
   ```bash
   git add .
   git commit -m "fix: Update deployment configuration"
   git push origin master
   ```

2. **Deploy to Vercel:**
   ```bash
   vercel --prod
   ```

3. **Check Deployment Logs:**
   - Visit Vercel dashboard
   - Go to Functions tab
   - Review build logs for specific errors

### 5. Alternative Deployment Methods

#### Method A: Vercel Dashboard
1. Connect GitHub repository to Vercel
2. Configure environment variables
3. Trigger deployment from dashboard

#### Method B: Vercel CLI (Current Method)
```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### 6. Post-Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection working
- [ ] Authentication system functional
- [ ] All API endpoints responding
- [ ] Static assets loading correctly
- [ ] Mobile responsiveness working
- [ ] SSL certificate active

## 📊 Current Configuration

### vercel.json
```json
{
  "buildCommand": "npm run build",
  "devCommand": "npm run dev", 
  "installCommand": "npm install --legacy-peer-deps",
  "framework": "nextjs",
  "regions": ["iad1"],
  "functions": {
    "src/app/api/**/*.ts": {
      "maxDuration": 60
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/_next/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/images/(.*)", 
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options", 
          "value": "DENY"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        }
      ]
    }
  ]
}
```

## 🎯 Next Steps

1. **Configure Environment Variables** in Vercel dashboard
2. **Retry Deployment** with updated configuration
3. **Monitor Build Logs** for specific error details
4. **Test All Features** after successful deployment

## 📞 Support

If deployment continues to fail:
1. Check Vercel build logs for specific error messages
2. Verify all environment variables are correctly set
3. Ensure database is accessible from Vercel's network
4. Contact Vercel support if issues persist

---

**Last Updated:** February 13, 2026
**Deployment URL:** https://cesclair-main-gwoicbgpx-hariyaws-projects.vercel.app
