# 🔐 Vercel Environment Variables Checklist

Use this checklist to ensure all required environment variables are set in Vercel.

## ✅ Required Environment Variables

### 1. Database Connection

**Variable:** `DATABASE_URL`

**Description:** PostgreSQL connection string (use pooler endpoint for better performance)

**Format:**
```
postgresql://user:password@host-pooler.region.aws.neon.tech/database?sslmode=require
```

**Example (Neon):**
```
postgresql://neondb_owner:password@ep-example-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

**Important:**
- ✅ Use `-pooler` endpoint (not direct connection) for better performance
- ✅ Include `?sslmode=require` for SSL
- ✅ Test connection locally before deploying

**How to set:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Key: `DATABASE_URL`
4. Value: Your connection string
5. Select environments: Production, Preview, Development
6. Click "Save"

---

### 2. Site URL

**Variable:** `NEXT_PUBLIC_SITE_URL`

**Description:** Your production site URL (required for auth callbacks)

**Format:**
```
https://your-project.vercel.app
```

**Example:**
```
https://cesclair.vercel.app
```

**Important:**
- ✅ Update after first deployment with actual Vercel URL
- ✅ Must use `https://` protocol
- ✅ No trailing slash
- ✅ For custom domain: `https://yourdomain.com`

**How to set:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click "Add New"
3. Key: `NEXT_PUBLIC_SITE_URL`
4. Value: Your site URL (update after first deploy)
5. Select environments: Production, Preview, Development
6. Click "Save"

---

### 3. Auth Secret

**Variable:** `BETTER_AUTH_SECRET`

**Description:** Secret key for authentication (must be 32+ characters)

**How to generate:**

**Method 1: Using npm script (Recommended)**
```bash
npm run generate-secret
```

**Method 2: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Method 3: Using OpenSSL (if installed)**
```bash
openssl rand -base64 32
```

**Method 4: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Important:**
- ✅ Must be at least 32 characters
- ✅ Use the same secret for all environments (or different for security)
- ✅ Keep it secure - never commit to git
- ✅ Generate a new one if compromised

**How to set:**
1. Generate secret using one of the methods above
2. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
3. Click "Add New"
4. Key: `BETTER_AUTH_SECRET`
5. Value: Generated secret
6. Select environments: Production, Preview, Development
7. Click "Save"

---

## 🟡 Optional Environment Variables

### 4. DocuSign Configuration (if using DocuSign)

**Variables:**
- `DOCUSIGN_USER_ID`
- `DOCUSIGN_ACCOUNT_ID`
- `DOCUSIGN_BASE_PATH` (default: `https://na4.docusign.net`)
- `DOCUSIGN_INTEGRATION_KEY`
- `DOCUSIGN_PRIVATE_KEY`

**How to set:**
1. Get credentials from DocuSign Developer Console
2. Add each variable in Vercel Environment Variables
3. Select environments: Production, Preview (usually not needed for Development)

---

### 5. SignWell Configuration (if using SignWell)

**Variable:** `SIGNWELL_API_KEY`

**Description:** SignWell API key for document signing

**How to get:**
1. Sign up at https://www.signwell.com
2. Get API key from dashboard
3. Add to Vercel Environment Variables

**Variable:** `SIGNWELL_API_BASE`

**Description:** SignWell API base URL

**Default:** `https://www.signwell.com/api/v1`

**How to set:**
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Add `SIGNWELL_API_KEY` with your API key
3. Add `SIGNWELL_API_BASE` with the base URL
4. Select environments: Production, Preview

---

## 📋 Complete Checklist

Before deploying, ensure you have:

- [ ] `DATABASE_URL` - PostgreSQL connection string
- [ ] `BETTER_AUTH_SECRET` - Generated auth secret (32+ chars)
- [ ] `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL
- [ ] `DOCUSIGN_USER_ID` - (if using DocuSign)
- [ ] `DOCUSIGN_ACCOUNT_ID` - (if using DocuSign)
- [ ] `DOCUSIGN_BASE_PATH` - (if using DocuSign)
- [ ] `DOCUSIGN_INTEGRATION_KEY` - (if using DocuSign)
- [ ] `DOCUSIGN_PRIVATE_KEY` - (if using DocuSign)
- [ ] `SIGNWELL_API_KEY` - (if using SignWell)
- [ ] `SIGNWELL_API_BASE` - (if using SignWell)

## 🔍 Verification

After setting environment variables:

1. **Verify in Vercel Dashboard:**
   - Go to Project Settings → Environment Variables
   - Confirm all variables are listed
   - Check that correct environments are selected

2. **Test Locally:**
   ```bash
   # Copy .env to .env.local
   cp .env .env.local
   
   # Test build
   npm run build
   
   # Test start
   npm run start
   ```

3. **Check Deployment Logs:**
   - Go to Vercel Dashboard → Deployments
   - Click on latest deployment
   - Check build logs for any environment variable errors

## ⚠️ Important Notes

- **Never commit `.env` files** - They're already in `.gitignore`
- **Use different secrets for production** - Don't reuse development secrets
- **Rotate secrets regularly** - Especially if compromised
- **Use Vercel's environment variable encryption** - All variables are encrypted at rest
- **Test in Preview environment first** - Before deploying to production

## 🔗 Quick Links

- [Vercel Environment Variables Docs](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Dashboard](https://vercel.com/dashboard)

