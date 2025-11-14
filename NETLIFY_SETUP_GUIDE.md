# 🚀 Netlify Deployment Setup Guide

Complete step-by-step guide to deploy your Next.js application to Netlify.

## 📋 Prerequisites

- ✅ Node.js 20.x installed
- ✅ Netlify account ([Sign up here](https://app.netlify.com))
- ✅ GitHub repository with your code
- ✅ Neon PostgreSQL database (or other PostgreSQL database)

## 🎯 Quick Setup (5 Steps)

### Step 1: Connect Repository to Netlify

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account (if not already connected)
4. Select your repository
5. Netlify will auto-detect Next.js from `netlify.toml`

### Step 2: Configure Build Settings

Netlify should auto-detect these from `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `.next` (handled by plugin)
- **Node version:** 20

**Manual Configuration (if needed):**
1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Build command: `npm run build`
3. Publish directory: Leave empty (plugin handles it)
4. Node version: 20

### Step 3: Set Environment Variables

Go to **Site settings** → **Environment variables** and add:

#### Required Variables:

```bash
# Database Connection (use pooler endpoint for better performance)
DATABASE_URL=postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require

# Site URL (update after first deployment with your actual Netlify URL)
NEXT_PUBLIC_SITE_URL=https://your-site-name.netlify.app

# Auth Secret (generate using: npm run generate-secret)
BETTER_AUTH_SECRET=your-generated-secret-here
```

#### Optional Variables:

```bash
# Alternative auth URL (if different from site URL)
BETTER_AUTH_URL=https://your-site-name.netlify.app

# Database debugging
DATABASE_DEBUG=false

# DocuSign (if using DocuSign integration)
DOCUSIGN_USER_ID=your-docusign-user-id
DOCUSIGN_ACCOUNT_ID=your-docusign-account-id
DOCUSIGN_BASE_PATH=https://na4.docusign.net
DOCUSIGN_INTEGRATION_KEY=your-docusign-integration-key
DOCUSIGN_PRIVATE_KEY=your-docusign-private-key
```

**Important:** 
- ✅ Set all variables for **Production**, **Deploy previews**, and **Branch deploys**
- ✅ After setting variables, trigger a new deployment

### Step 4: Generate Auth Secret

Run locally to generate a secure secret:

```bash
npm run generate-secret
```

**Alternative methods:**

**Node.js:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**OpenSSL:**
```bash
openssl rand -base64 32
```

**PowerShell (Windows):**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

Copy the generated value and use it as `BETTER_AUTH_SECRET`.

### Step 5: Deploy

1. Click **"Deploy site"** (if not already deploying)
2. Wait for build to complete
3. After first deployment, update `NEXT_PUBLIC_SITE_URL` with your actual Netlify URL
4. Trigger a new deployment

## 🔧 Configuration Files

### netlify.toml

Your `netlify.toml` is already configured with:
- ✅ Next.js plugin (`@netlify/plugin-nextjs`)
- ✅ Node.js 20
- ✅ Security headers
- ✅ Cache headers for static assets
- ✅ Function configuration for Neon database

### next.config.ts

Your Next.js config is optimized for Netlify:
- ✅ Image optimization enabled
- ✅ Compression enabled
- ✅ TypeScript/ESLint errors ignored during build

## 🗄️ Database Setup

### Using Neon PostgreSQL

1. **Use Pooler Endpoint:**
   - Use the `-pooler` endpoint for better connection handling
   - Format: `postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require`

2. **Connection String Format:**
   ```
   postgresql://neondb_owner:password@ep-example-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
   ```

3. **Test Connection Locally:**
   ```bash
   npm run db:check
   ```

4. **Apply Migrations:**
   - Run migrations manually on your production database
   - Or use a migration script in your build process

## 🔐 Security Checklist

- ✅ `BETTER_AUTH_SECRET` is set and secure (32+ characters)
- ✅ `DATABASE_URL` uses SSL (`sslmode=require`)
- ✅ No secrets committed to git
- ✅ Environment variables set in Netlify (not in code)
- ✅ Security headers configured in `netlify.toml`

## 🧪 Testing Deployment

### Before Deploying:

1. **Test build locally:**
   ```bash
   rm -rf .next node_modules
   npm install
   npm run build
   ```

2. **Test database connection:**
   ```bash
   npm run db:check
   ```

3. **Verify environment variables:**
   - Check `.env.example` for required variables
   - Ensure all are set in Netlify

### After Deploying:

1. **Check build logs:**
   - Go to **Deploys** → Click on deployment → **Deploy log**
   - Look for any errors or warnings

2. **Test the site:**
   - Visit your Netlify URL
   - Test authentication (sign up/login)
   - Test database operations
   - Check API routes

3. **Monitor function logs:**
   - Go to **Functions** tab
   - Check for any runtime errors

## 🐛 Troubleshooting

### Build Fails

**Issue:** Build command fails
- **Solution:** Check build logs for specific errors
- **Common fixes:**
  - Ensure Node.js 20 is set
  - Check for missing dependencies
  - Verify build command is correct

**Issue:** "Module not found" errors
- **Solution:** Ensure all dependencies are in `package.json`
- Run `npm install` locally to verify

### Database Connection Issues

**Issue:** "Connection refused" or timeout
- **Solution:** 
  - Use pooler endpoint (not direct connection)
  - Check database is not in sleep mode
  - Verify `DATABASE_URL` is correct
  - Ensure SSL is enabled (`sslmode=require`)

**Issue:** "SSL required" error
- **Solution:** Add `?sslmode=require` to connection string

### Authentication Issues

**Issue:** Auth callbacks not working
- **Solution:**
  - Verify `NEXT_PUBLIC_SITE_URL` matches your Netlify URL
  - Check `BETTER_AUTH_SECRET` is set
  - Ensure cookies can be set (check domain)

**Issue:** "Invalid secret" errors
- **Solution:** Regenerate `BETTER_AUTH_SECRET` and update in Netlify

### Function Timeouts

**Issue:** API routes timeout
- **Solution:**
  - Netlify functions have a 10s timeout (free) or 26s (pro)
  - Optimize database queries
  - Use connection pooling
  - Consider splitting long operations

## 📊 Monitoring

### Netlify Analytics

- **Function invocations:** Monitor API usage
- **Build times:** Track build performance
- **Deploy frequency:** Track deployment patterns

### Logs

- **Build logs:** Check for build issues
- **Function logs:** Monitor runtime errors
- **Deploy logs:** Track deployment history

## 🔄 Continuous Deployment

Netlify automatically deploys when you:
- Push to main branch (production)
- Open a pull request (deploy preview)
- Push to other branches (branch deploy)

### Deploy Previews

- Each PR gets a unique preview URL
- Environment variables are available in previews
- Test changes before merging

## 📝 Post-Deployment Checklist

- [ ] Site loads correctly
- [ ] Authentication works (sign up/login)
- [ ] Database operations work
- [ ] API routes respond correctly
- [ ] Images load properly
- [ ] Static pages render correctly
- [ ] Environment variables are set
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active
- [ ] Analytics configured (optional)

## 🎯 Next Steps

1. **Custom Domain:**
   - Go to **Domain settings**
   - Add your custom domain
   - Configure DNS records

2. **Performance:**
   - Enable Netlify Analytics
   - Monitor function performance
   - Optimize images and assets

3. **Security:**
   - Review security headers
   - Enable DDoS protection
   - Set up form spam protection

## 📚 Additional Resources

- [Netlify Next.js Plugin Docs](https://github.com/netlify/netlify-plugin-nextjs)
- [Netlify Functions Docs](https://docs.netlify.com/functions/overview/)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)
- [Better Auth Docs](https://www.better-auth.com/docs)

## 🆘 Support

If you encounter issues:

1. Check Netlify build logs
2. Review function logs
3. Test locally with production environment variables
4. Check [Netlify Status](https://www.netlifystatus.com/)
5. Review [Netlify Community Forums](https://answers.netlify.com/)

---

**Ready to deploy?** Push your code to GitHub and Netlify will automatically build and deploy! 🚀

