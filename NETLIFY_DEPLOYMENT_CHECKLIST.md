# ✅ Netlify Deployment Checklist

Use this checklist to ensure a successful deployment to Netlify.

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code is committed to Git
- [ ] Code is pushed to GitHub repository
- [ ] No sensitive data in code (secrets, API keys, etc.)
- [ ] `.env` files are in `.gitignore`
- [ ] `package.json` has all required dependencies
- [ ] `package-lock.json` is committed

### Local Testing
- [ ] `npm install` runs without errors
- [ ] `npm run build` completes successfully
- [ ] `npm run start` works locally
- [ ] Database connection works locally
- [ ] Authentication works locally

### Configuration Files
- [ ] `netlify.toml` exists and is configured
- [ ] `.nvmrc` specifies Node.js version (20)
- [ ] `next.config.ts` is optimized for production
- [ ] `@netlify/plugin-nextjs` is in `package.json`

## 🔧 Netlify Setup

### Repository Connection
- [ ] Netlify account created
- [ ] GitHub account connected to Netlify
- [ ] Repository selected: `Ghost247-bot/cesclair`
- [ ] Build settings auto-detected from `netlify.toml`

### Environment Variables
- [ ] `DATABASE_URL` - Neon PostgreSQL connection string (pooler endpoint)
- [ ] `NEXT_PUBLIC_SITE_URL` - Production site URL (update after first deploy)
- [ ] `BETTER_AUTH_SECRET` - Generated secret key (32+ characters)
- [ ] All variables have correct scopes (Production, Deploy previews, Branch deploys)

### Optional Environment Variables
- [ ] `BETTER_AUTH_URL` - If different from site URL
- [ ] `DOCUSIGN_USER_ID` - If using DocuSign
- [ ] `DOCUSIGN_ACCOUNT_ID` - If using DocuSign
- [ ] `DOCUSIGN_BASE_PATH` - If using DocuSign
- [ ] `DOCUSIGN_INTEGRATION_KEY` - If using DocuSign
- [ ] `DOCUSIGN_PRIVATE_KEY` - If using DocuSign

## 🚀 Deployment

### Initial Deployment
- [ ] Clicked "Deploy site" in Netlify
- [ ] Build completed successfully (check logs)
- [ ] No build errors or warnings
- [ ] Site is accessible at Netlify URL

### Post-Deployment Configuration
- [ ] Updated `NEXT_PUBLIC_SITE_URL` with actual Netlify URL
- [ ] Triggered new deployment after updating URL
- [ ] Custom domain configured (if applicable)
- [ ] SSL certificate active (automatic)

## ✅ Verification

### Site Functionality
- [ ] Homepage loads: `https://your-site.netlify.app`
- [ ] No console errors in browser
- [ ] Images load correctly
- [ ] Navigation works
- [ ] Responsive design works on mobile/tablet

### API Endpoints
- [ ] Diagnostics: `/api/test/production-diagnostics` returns OK
- [ ] Database test: `/api/test/db-connection` works
- [ ] Authentication endpoints work
- [ ] API routes return expected responses

### Authentication
- [ ] Login page loads: `/everworld/login`
- [ ] Can create new account
- [ ] Can log in with existing account
- [ ] Session persists after login
- [ ] Logout works correctly
- [ ] Protected routes redirect when not authenticated

### Database
- [ ] Database connection successful
- [ ] Tables exist and are accessible
- [ ] Can read data from database
- [ ] Can write data to database (if applicable)
- [ ] Migrations are applied

### Functions
- [ ] Serverless functions are deployed
- [ ] Function logs show no errors
- [ ] Function execution times are reasonable
- [ ] No timeout errors

## 🔍 Monitoring

### Build Monitoring
- [ ] Build logs reviewed for warnings
- [ ] Build time is acceptable (< 10 minutes)
- [ ] No dependency issues

### Function Monitoring
- [ ] Function logs reviewed
- [ ] No recurring errors
- [ ] Execution times are normal
- [ ] Cold start times are acceptable

### Performance
- [ ] Page load times are acceptable
- [ ] Lighthouse score is 90+ (if checked)
- [ ] Images are optimized
- [ ] Static assets are cached

## 🔐 Security

### Security Headers
- [ ] Security headers are configured in `netlify.toml`
- [ ] HTTPS is enforced
- [ ] SSL certificate is valid

### Secrets Management
- [ ] No secrets in code
- [ ] All secrets in environment variables
- [ ] Environment variables are not exposed in client-side code
- [ ] Database credentials are secure

## 📊 Post-Deployment

### Documentation
- [ ] Deployment process documented
- [ ] Environment variables documented
- [ ] Troubleshooting steps documented

### Team Access
- [ ] Team members have Netlify access (if applicable)
- [ ] Deployment notifications configured
- [ ] Error alerts configured (if applicable)

## 🐛 Troubleshooting (if issues occur)

### Build Issues
- [ ] Checked build logs for specific errors
- [ ] Verified Node.js version (20)
- [ ] Verified all dependencies are installed
- [ ] Checked for TypeScript/ESLint errors

### Runtime Issues
- [ ] Checked function logs
- [ ] Verified environment variables are set
- [ ] Tested database connection
- [ ] Verified authentication configuration

### Performance Issues
- [ ] Checked function execution times
- [ ] Verified caching is working
- [ ] Checked for cold start issues
- [ ] Reviewed image optimization

## 📝 Notes

**Deployment Date:** _______________

**Netlify URL:** _______________

**Custom Domain:** _______________

**Issues Encountered:** 
- 

**Resolutions:**
- 

---

**Status:** ⬜ Not Started | ⬜ In Progress | ⬜ Completed | ⬜ Blocked

**Next Steps:**
- 

