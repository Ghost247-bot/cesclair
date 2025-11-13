# Netlify Quick Start Guide

## 🚀 5-Minute Setup

### 1. Connect Repository
- Go to [app.netlify.com](https://app.netlify.com)
- Click **"Add new site"** → **"Import an existing project"**
- Connect GitHub and select your repo

### 2. Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

```bash
DATABASE_URL=your-neon-postgresql-connection-string
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app
BETTER_AUTH_SECRET=your-generated-secret
```

**Generate secret:**
```bash
npm run generate-secret
```

### 3. Deploy

Netlify will automatically:
- ✅ Detect Next.js
- ✅ Install dependencies
- ✅ Build your app
- ✅ Deploy to production

### 4. Update Site URL

After first deployment:
1. Copy your Netlify URL
2. Update `NEXT_PUBLIC_SITE_URL` in environment variables
3. Redeploy

## ✅ That's it!

Your site is now live at `https://your-site-name.netlify.app`

---

**Need more details?** See [NETLIFY_SETUP_COMPLETE.md](./NETLIFY_SETUP_COMPLETE.md)

