# Deployment Checklist

Use this checklist to ensure your application is ready for deployment.

## Pre-Deployment Checklist

### Environment Variables
- [ ] Copy `.env.example` to `.env.local` for local development
- [ ] Set up all required environment variables in your deployment platform
- [ ] Generate a secure `BETTER_AUTH_SECRET` using: `openssl rand -base64 32`
- [ ] Verify `DATABASE_URL` is correctly configured for production
- [ ] Set `NEXT_PUBLIC_SITE_URL` to your production domain
- [ ] Configure SignWell credentials (if using SignWell integration)

### Database
- [ ] Ensure Neon PostgreSQL database is accessible from your deployment platform
- [ ] Run database migrations if needed: `npx drizzle-kit push`
- [ ] Verify database connection string is correct
- [ ] Test database connectivity from production environment

### Code
- [ ] Run `npm run build` locally to ensure build succeeds
- [ ] Fix any TypeScript errors (if not ignoring build errors)
- [ ] Fix any ESLint errors (if not ignoring during builds)
- [ ] Test all critical user flows locally
- [ ] Verify authentication flows work correctly
- [ ] Test API routes

### Security
- [ ] Remove any hardcoded secrets from code
- [ ] Ensure `.env` files are in `.gitignore`
- [ ] Review and update `BETTER_AUTH_SECRET` for production
- [ ] Verify `trustedOrigins` in `src/lib/auth.ts` includes production URL
- [ ] Check that sensitive API keys are stored as environment variables

## Vercel Deployment Steps

1. **Connect Repository**
   - [ ] Push code to GitHub/GitLab/Bitbucket
   - [ ] Import project in Vercel dashboard
   - [ ] Select the correct repository and branch

2. **Configure Project Settings**
   - [ ] Framework Preset: Next.js (auto-detected)
   - [ ] Root Directory: `./` (or your project root)
   - [ ] Build Command: `npm run build` (default)
   - [ ] Output Directory: `.next` (default)
   - [ ] Install Command: `npm install` (default)

3. **Set Environment Variables**
   - [ ] `DATABASE_URL` - Neon PostgreSQL connection string
   - [ ] `BETTER_AUTH_SECRET` - Secure random string (32+ characters)
   - [ ] `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL
   - [ ] `BETTER_AUTH_URL` - (Optional) Override auth URL
   - [ ] `SIGNWELL_API_KEY` - (If using SignWell)
   - [ ] `SIGNWELL_API_BASE` - (If using SignWell, optional)

4. **Deploy**
   - [ ] Click "Deploy"
   - [ ] Monitor build logs for errors
   - [ ] Wait for deployment to complete

5. **Post-Deployment Verification**
   - [ ] Visit your deployment URL
   - [ ] Test homepage loads correctly
   - [ ] Test authentication (sign up, sign in, sign out)
   - [ ] Test protected routes (admin, account pages)
   - [ ] Verify API routes are working
   - [ ] Check database connectivity
   - [ ] Test critical user flows

## Post-Deployment

### Monitoring
- [ ] Set up error monitoring (if applicable)
- [ ] Monitor application logs in Vercel dashboard
- [ ] Check database connection health
- [ ] Monitor API response times

### Domain Configuration (Optional)
- [ ] Add custom domain in Vercel project settings
- [ ] Update `NEXT_PUBLIC_SITE_URL` to custom domain
- [ ] Update `trustedOrigins` in auth configuration
- [ ] Configure DNS records
- [ ] Verify SSL certificate is active

### Performance
- [ ] Run Lighthouse audit
- [ ] Check Core Web Vitals
- [ ] Optimize images if needed
- [ ] Verify caching is working correctly

## Troubleshooting

### Build Failures
- Check build logs in Vercel dashboard
- Verify all environment variables are set
- Ensure `package.json` has correct build scripts
- Check for TypeScript/ESLint errors

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify environment variables are accessible
- Test database connectivity
- Check API route handlers

### Authentication Issues
- Verify `BETTER_AUTH_SECRET` is set correctly
- Check `NEXT_PUBLIC_SITE_URL` matches deployment URL
- Verify `trustedOrigins` includes production URL
- Check cookie settings in auth configuration

## Rollback Plan

If deployment fails:
1. Go to Vercel dashboard → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"
4. Investigate and fix issues
5. Redeploy when ready

## Notes

- Always test in a staging environment before production
- Keep environment variables secure and never commit them
- Regularly update dependencies for security patches
- Monitor application performance and errors

