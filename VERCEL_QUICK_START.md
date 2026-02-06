# ⚡ Vercel Quick Start Guide

Get your project deployed to Vercel in 5 minutes!

## 🚀 Quick Deploy Steps

### 1. Connect to Vercel (2 minutes)

1. Go to [vercel.com/new](https://vercel.com/new)
2. Click **"Import Git Repository"**
3. Select **GitHub** and authorize
4. Choose repository: **`Ghost247-bot/cesclair`**
5. Click **"Import"**

### 2. Configure Environment Variables (2 minutes)

Click **"Environment Variables"** and add:

```bash
DATABASE_URL=postgresql://neondb_owner:password@ep-example.us-east-1.aws.neon.tech/neondb?sslmode=require
BETTER_AUTH_SECRET=[run: npm run generate-secret]
NEXT_PUBLIC_SITE_URL=https://your-project.vercel.app
```

**Select all environments:** Production, Preview, Development

### 3. Deploy (1 minute)

1. Click **"Deploy"**
2. Wait 2-5 minutes
3. Done! 🎉

### 4. Update Site URL

After deployment:
1. Copy your Vercel URL (e.g., `https://cesclair.vercel.app`)
2. Update `NEXT_PUBLIC_SITE_URL` in Environment Variables
3. Redeploy (automatic on next push)

## 📝 Required Environment Variables

| Variable | Description | How to Get |
|----------|-------------|------------|
| `DATABASE_URL` | Neon PostgreSQL connection | From Neon dashboard |
| `BETTER_AUTH_SECRET` | Auth secret key | Run: `npm run generate-secret` |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel URL | After first deployment |

## 🔧 Optional Variables

- `DOCUSIGN_*` - If using DocuSign
- `SIGNWELL_API_KEY` - If using SignWell
- `SIGNWELL_API_BASE` - If using SignWell

## ✅ Post-Deployment

- [ ] Test your site: `https://your-project.vercel.app`
- [ ] Test authentication flow
- [ ] Test database connection
- [ ] Update `NEXT_PUBLIC_SITE_URL` with actual URL
- [ ] Set up custom domain (optional)

## 🆘 Troubleshooting

**Build fails?**
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Test locally: `npm run build`

**Database connection error?**
- Verify `DATABASE_URL` is correct
- Use pooler endpoint: `-pooler` in hostname
- Check SSL mode: `?sslmode=require`

**Auth not working?**
- Verify `BETTER_AUTH_SECRET` is set
- Check `NEXT_PUBLIC_SITE_URL` matches your Vercel URL

## 📚 Full Documentation

- [Complete Deployment Guide](./VERCEL_DEPLOYMENT.md)
- [Environment Variables Checklist](./VERCEL_ENV_CHECKLIST.md)

## 🔗 Useful Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Docs](https://vercel.com/docs)
- [Next.js on Vercel](https://vercel.com/docs/frameworks/nextjs)

