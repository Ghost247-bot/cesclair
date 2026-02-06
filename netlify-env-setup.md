# Setting Environment Variables in Netlify

## Using Netlify CLI

If you have Netlify CLI installed, you can set environment variables from the command line:

```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link your site (if not already linked)
netlify link

# Set environment variables
netlify env:set DATABASE_URL "postgresql://neondb_owner:npg_Tpxjf7u6DCtH@ep-withered-shadow-a4gnj7n7-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"

netlify env:set NEXT_PUBLIC_SITE_URL "https://cesclair.store"

netlify env:set BETTER_AUTH_SECRET "your-secret-key-here"

# Verify they're set
netlify env:list
```

## Using netlify.toml (Not Recommended for Secrets)

⚠️ **Warning:** Don't put secrets in `netlify.toml` as it's committed to git!

You can only put non-sensitive variables in `netlify.toml`:

```toml
[build.environment]
  NEXT_PUBLIC_SITE_URL = "https://cesclair.store"
```

## Required Environment Variables for Production

Make sure these are all set:

1. ✅ `DATABASE_URL` - Your Neon PostgreSQL connection string
2. ✅ `NEXT_PUBLIC_SITE_URL` - `https://cesclair.store`
3. ✅ `BETTER_AUTH_SECRET` - Secure random string (32+ characters)

## How to Generate BETTER_AUTH_SECRET

### Method 1: Using Node.js Script (Easiest)
```bash
node scripts/generate-auth-secret.js
```

### Method 2: Using Node.js Command
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Method 3: Using OpenSSL (if installed)
```bash
openssl rand -base64 32
```

### Method 4: Using PowerShell (Windows)
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### Method 5: Online Generator
Visit: https://generate-secret.vercel.app/32

**Example output:**
```
WYmx4B4YAwHZbB4Y5rLVQng/kAR6m/n5vOpJ0PXO0/o=
```

Copy the generated value and use it as your `BETTER_AUTH_SECRET`.

## After Setting Variables

1. **Redeploy your site:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"
   - OR push a new commit to trigger auto-deploy

2. **Verify variables are loaded:**
   - Visit: `https://cesclair.store/api/test/production-diagnostics`
   - Check that all environment variables show as "ok"

## Troubleshooting

### Variables not showing up?
- Make sure you saved them in the dashboard
- Check the correct site is selected
- Verify scopes (Production, Preview, etc.)
- Redeploy after adding variables

### Still getting errors?
- Check Netlify build logs for environment variable issues
- Verify connection string is correct (no extra spaces)
- Test connection string locally first

