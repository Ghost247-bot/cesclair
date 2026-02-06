# 🔐 Netlify Environment Variables Guide

Quick reference for setting up environment variables in Netlify.

## 📍 Where to Set

**Netlify Dashboard → Site settings → Environment variables → Add variable**

## ✅ Required Variables

### 1. Database Connection
```
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

**Important:**
- ✅ Use **pooler endpoint** (ends with `-pooler`)
- ✅ Include `?sslmode=require`
- ✅ Test connection: `npm run db:check`

**Example:**
```
DATABASE_URL=postgresql://neondb_owner:abc123@ep-cool-darkness-123456-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

### 2. Site URL
```
NEXT_PUBLIC_SITE_URL=https://your-site.netlify.app
```

**Important:**
- ✅ Update after first deployment with actual Netlify URL
- ✅ Must match your actual Netlify site URL
- ✅ Include `https://` protocol
- ✅ No trailing slash

**First Deployment:**
```
NEXT_PUBLIC_SITE_URL=https://your-random-site-name.netlify.app
```

**After Custom Domain:**
```
NEXT_PUBLIC_SITE_URL=https://cesclair.store
```

### 3. Auth Secret
```
BETTER_AUTH_SECRET=Az3ivuZLfw89yTAOPmKlLA6qeRw3KlMFZnE0JrAyl+4=
```

**Generate New Secret:**
```bash
npm run generate-secret
```

**Or manually:**
```bash
# Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# PowerShell (Windows)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Important:**
- ✅ Use a unique, secure random string
- ✅ 32+ characters recommended
- ✅ Never commit to git

## 🟡 Optional Variables

### 4. Alternative Auth URL (if different)
```
BETTER_AUTH_URL=https://your-site.netlify.app
```
*Only needed if auth URL is different from site URL*

### 5. SignWell Integration (if using)
```
SIGNWELL_API_KEY=YWNjZXNzOjhiYWUyMTI2MzgxMmQ0YzVlMTUzMDE1MDM1ZWY4OWU4
SIGNWELL_API_BASE=https://www.signwell.com/api/v1
```

## 📋 Setup Checklist

### Before First Deployment:
- [ ] Get Neon PostgreSQL pooler connection string
- [ ] Generate `BETTER_AUTH_SECRET`
- [ ] Push code to GitHub

### During First Deployment:
- [ ] Connect repository to Netlify
- [ ] Let first deployment complete (will use default URL)
- [ ] Copy the Netlify-generated URL (e.g., `https://amazing-site-123.netlify.app`)

### After First Deployment:
- [ ] Add `DATABASE_URL` environment variable
- [ ] Add `BETTER_AUTH_SECRET` environment variable
- [ ] Add `NEXT_PUBLIC_SITE_URL` with actual Netlify URL
- [ ] Select all scopes (Production, Deploy previews, Branch deploys)
- [ ] Trigger new deployment

### After Custom Domain:
- [ ] Update `NEXT_PUBLIC_SITE_URL` to custom domain
- [ ] Optionally update `BETTER_AUTH_URL` if different
- [ ] Trigger new deployment

## ⚙️ Variable Scopes

When adding variables in Netlify, select all scopes:

- ✅ **Production** - Main site deployment
- ✅ **Deploy previews** - Pull request previews
- ✅ **Branch deploys** - Branch-specific deployments

## 🔍 Verify Variables

After setting variables:

1. **Trigger New Deployment:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Clear cache and deploy site"

2. **Check Build Logs:**
   - Verify no errors related to missing variables
   - Check for successful build

3. **Test Site:**
   - Visit your Netlify URL
   - Test authentication
   - Test database operations

## 🐛 Troubleshooting

### Variables Not Loading

**Symptoms:** API returns undefined/null

**Solutions:**
1. Verify variable name is exact (case-sensitive)
2. Check all scopes are selected
3. Redeploy after adding variables
4. Check no trailing spaces in values

### Auth Not Working

**Symptoms:** Can't sign in/sign up

**Solutions:**
1. Verify `NEXT_PUBLIC_SITE_URL` matches actual URL
2. Check `BETTER_AUTH_SECRET` is set correctly
3. Review function logs for auth errors
4. Ensure cookies can be set (check domain)

### Database Connection Failed

**Symptoms:** 500 errors on DB operations

**Solutions:**
1. Use pooler endpoint (not direct)
2. Verify `DATABASE_URL` format
3. Check `?sslmode=require` is present
4. Test connection locally first

## 📝 Quick Copy Template

Copy this template and fill in your values:

```bash
# Required Variables
DATABASE_URL=postgresql://[user]:[password]@[host-pooler].region.aws.neon.tech/[database]?sslmode=require
NEXT_PUBLIC_SITE_URL=https://[your-site].netlify.app
BETTER_AUTH_SECRET=[generated-secret]

# Optional Variables
BETTER_AUTH_URL=https://[your-site].netlify.app
SIGNWELL_API_KEY=[your-api-key]
SIGNWELL_API_BASE=https://www.signwell.com/api/v1
```

---

**Need Help?** Check `NETLIFY_DEPLOYMENT_CHECKLIST.md` for full deployment guide.

