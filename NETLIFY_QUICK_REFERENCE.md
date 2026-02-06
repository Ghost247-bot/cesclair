# ⚡ Netlify Quick Reference

Quick reference guide for Netlify deployment.

## 🚀 Quick Deploy Steps

1. **Connect Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com)
   - Add new site → Import existing project
   - Connect GitHub and select repository

2. **Set Environment Variables**
   - Site settings → Environment variables
   - Add: `DATABASE_URL`, `NEXT_PUBLIC_SITE_URL`, `BETTER_AUTH_SECRET`
   - Set for: Production, Deploy previews, Branch deploys

3. **Deploy**
   - Click "Deploy site"
   - Wait for build to complete
   - Update `NEXT_PUBLIC_SITE_URL` with actual Netlify URL
   - Trigger new deployment

## 🔑 Required Environment Variables

```bash
# Database (use pooler endpoint)
DATABASE_URL=postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require

# Site URL (update after first deploy)
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app

# Auth Secret (generate with: npm run generate-secret)
BETTER_AUTH_SECRET=your-32-char-secret-here
```

## 🛠️ Generate Auth Secret

```bash
# Method 1: npm script
npm run generate-secret

# Method 2: Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Method 3: OpenSSL
openssl rand -base64 32

# Method 4: PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

## 📁 Configuration Files

- **netlify.toml** - Already configured ✅
- **next.config.ts** - Optimized for Netlify ✅
- **package.json** - Build script configured ✅

## 🔍 Verify Setup

```bash
# Test build locally
npm run build

# Test database connection
npm run db:check

# Check environment variables
# Visit: https://your-site.netlify.app/api/test/production-diagnostics
```

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| Build fails | Check Node.js 20 is set, verify dependencies |
| Database timeout | Use pooler endpoint, check SSL enabled |
| Auth not working | Verify `NEXT_PUBLIC_SITE_URL` matches Netlify URL |
| Variables not working | Redeploy after setting variables |

## 📚 Full Documentation

- **Complete Setup Guide:** `NETLIFY_SETUP_GUIDE.md`
- **Environment Variables:** `NETLIFY_ENV_CHECKLIST.md`
- **Troubleshooting:** See setup guide

## 🎯 Post-Deploy Checklist

- [ ] Site loads
- [ ] Authentication works
- [ ] Database operations work
- [ ] API routes respond
- [ ] Environment variables set
- [ ] Custom domain configured (optional)

---

**Need help?** Check `NETLIFY_SETUP_GUIDE.md` for detailed instructions.

