# 🔐 Netlify Environment Variables Checklist

Use this checklist to ensure all required environment variables are set in Netlify.

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
- ✅ Use `-pooler` endpoint (not direct connection)
- ✅ Include `?sslmode=require` for SSL
- ✅ Test connection locally before deploying

**How to set:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Click "Add variable"
3. Key: `DATABASE_URL`
4. Value: Your connection string
5. Select scopes: Production, Deploy previews, Branch deploys
6. Click "Save"

---

### 2. Site URL

**Variable:** `NEXT_PUBLIC_SITE_URL`

**Description:** Your production site URL (required for auth callbacks)

**Format:**
```
https://your-site-name.netlify.app
```

**Example:**
```
https://cesclair.store
```

**Important:**
- ✅ Update after first deployment with actual Netlify URL
- ✅ Must use `https://` protocol
- ✅ No trailing slash

**How to set:**
1. Go to Netlify Dashboard → Site settings → Environment variables
2. Click "Add variable"
3. Key: `NEXT_PUBLIC_SITE_URL`
4. Value: Your site URL
5. Select scopes: Production, Deploy previews, Branch deploys
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

**Method 3: Using OpenSSL**
```bash
openssl rand -base64 32
```

**Method 4: Using PowerShell (Windows)**
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

**Example output:**
```
WYmx4B4YAwHZbB4Y5rLVQng/kAR6m/n5vOpJ0PXO0/o=
```

**Important:**
- ✅ Must be 32+ characters
- ✅ Keep it secret (never commit to git)
- ✅ Use different secrets for production and development

**How to set:**
1. Generate secret using one of the methods above
2. Go to Netlify Dashboard → Site settings → Environment variables
3. Click "Add variable"
4. Key: `BETTER_AUTH_SECRET`
5. Value: Your generated secret
6. Select scopes: Production, Deploy previews, Branch deploys
7. Click "Save"

---

## 🔧 Optional Environment Variables

### 4. Alternative Auth URL

**Variable:** `BETTER_AUTH_URL`

**Description:** Override auth URL if different from site URL

**When to use:** Only if your auth URL is different from `NEXT_PUBLIC_SITE_URL`

**Format:**
```
https://your-auth-domain.com
```

---

### 5. Database Debug

**Variable:** `DATABASE_DEBUG`

**Description:** Enable database debug logging

**Values:**
- `true` - Enable debug logging
- `false` - Disable debug logging (default)

**When to use:** Only for troubleshooting database issues

---

### 6. SignWell Configuration (If using SignWell)

**Variables:**
- `SIGNWELL_API_KEY` - Your SignWell API key
- `SIGNWELL_API_BASE` - SignWell API base URL (default: `https://www.signwell.com/api/v1`)

**When to use:** Only if you're using SignWell integration for contract signing

---

## 📋 Quick Checklist

Use this checklist when setting up your Netlify environment:

- [ ] `DATABASE_URL` - Set with pooler endpoint and SSL
- [ ] `NEXT_PUBLIC_SITE_URL` - Set to your Netlify URL (update after first deploy)
- [ ] `BETTER_AUTH_SECRET` - Generated and set (32+ characters)
- [ ] `BETTER_AUTH_URL` - Set only if different from site URL (optional)
- [ ] `DATABASE_DEBUG` - Set to `false` for production (optional)
- [ ] `SIGNWELL_*` - Set if using SignWell (optional)

---

## 🔍 Verification Steps

After setting environment variables:

1. **Trigger a new deployment:**
   - Go to Deploys tab
   - Click "Trigger deploy" → "Deploy site"

2. **Check build logs:**
   - Go to Deploys → Click on deployment → Deploy log
   - Verify no environment variable errors

3. **Test the site:**
   - Visit your Netlify URL
   - Test authentication (sign up/login)
   - Verify database operations work

4. **Check function logs:**
   - Go to Functions tab
   - Monitor for any runtime errors

---

## 🐛 Troubleshooting

### Variables Not Working?

1. **Check scopes:**
   - Ensure variables are set for the correct scopes (Production, Preview, Branch)

2. **Redeploy:**
   - Environment variables only apply to new deployments
   - Trigger a new deployment after adding/updating variables

3. **Verify format:**
   - Check for extra spaces or quotes
   - Ensure connection strings are properly formatted

4. **Test locally:**
   - Copy variables to `.env.local`
   - Test locally to verify they work

### Common Issues

**Issue:** "DATABASE_URL not found"
- **Solution:** Verify variable name is exactly `DATABASE_URL` (case-sensitive)

**Issue:** "BETTER_AUTH_SECRET is invalid"
- **Solution:** Regenerate secret and ensure it's 32+ characters

**Issue:** "Auth callbacks not working"
- **Solution:** Verify `NEXT_PUBLIC_SITE_URL` matches your actual Netlify URL

---

## 📚 Additional Resources

- [Netlify Environment Variables Docs](https://docs.netlify.com/environment-variables/overview/)
- [Better Auth Configuration](https://www.better-auth.com/docs)
- [Neon Connection Pooling](https://neon.tech/docs/connect/connection-pooling)

---

**Remember:** Never commit secrets to git! Always use Netlify's environment variables for sensitive data.

