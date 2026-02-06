# Production Deployment Checklist

This checklist helps ensure your production deployment (cesclair.store) is properly configured.

## ✅ Step 1: Environment Variables

Verify these environment variables are set in your production hosting platform (Vercel/Netlify/etc.):

### Required Variables:

1. **`NEXT_PUBLIC_SITE_URL`** ⚠️ **CRITICAL**
   - **Value:** `https://cesclair.store`
   - **Why:** Required for authentication callbacks and cookie domain
   - **Check:** Visit `/api/test/production-diagnostics` to verify

2. **`DATABASE_URL`** ⚠️ **CRITICAL**
   - **Value:** Your Neon PostgreSQL connection string
   - **Format:** `postgresql://user:password@host/database?sslmode=require`
   - **Why:** Required for all database operations
   - **Check:** Visit `/api/test/production-diagnostics` to verify connection

3. **`BETTER_AUTH_SECRET`** ⚠️ **CRITICAL**
   - **Value:** A secure random string (32+ characters)
   - **Generate:** `openssl rand -base64 32`
   - **Why:** Required for session encryption
   - **Note:** Must be the same across all instances

### Optional Variables:

4. **`BETTER_AUTH_URL`**
   - **Value:** `https://cesclair.store` (if different from NEXT_PUBLIC_SITE_URL)
   - **Why:** Override auth URL if needed

5. **`VERCEL_URL`** (Auto-set by Vercel)
   - Automatically set by Vercel, used as fallback

## ✅ Step 2: Database Migrations

Ensure all database migrations have been applied to your production database.

### Check Migration Status:

1. **Verify tables exist:**
   ```sql
   SELECT table_name 
   FROM information_schema.tables 
   WHERE table_schema = 'public' 
   AND table_name IN ('user', 'session', 'account', 'verification');
   ```

2. **Required tables for authentication:**
   - ✅ `user` - User accounts
   - ✅ `session` - Active sessions
   - ✅ `account` - Authentication accounts (email/password)
   - ✅ `verification` - Email verification tokens

### Apply Migrations:

If tables are missing, apply migrations:

**Option 1: Using Drizzle Kit (Recommended)**
```bash
# Set DATABASE_URL environment variable
export DATABASE_URL="your-production-database-url"

# Generate migrations (if needed)
npm run drizzle-kit generate

# Apply migrations
npm run drizzle-kit push
```

**Option 2: Manual SQL Execution**
```bash
# Run each migration file in order:
# drizzle/0000_crazy_harry_osborn.sql
# drizzle/0001_fancy_sentinels.sql
# drizzle/0002_cheerful_blink.sql
# drizzle/0003_add_audit_logs.sql
# drizzle/0004_add_banner_to_designers.sql
# drizzle/0005_add_documents_table.sql
```

**Option 3: Using the Migration Script**
```bash
node scripts/run-migration.js
```

## ✅ Step 3: Run Diagnostics

After deployment, visit the diagnostic endpoint to verify everything:

**URL:** `https://cesclair.store/api/test/production-diagnostics`

### What to Check:

1. **Environment Variables Status:**
   - ✅ `NEXT_PUBLIC_SITE_URL` is set to `https://cesclair.store`
   - ✅ `DATABASE_URL` is set and valid
   - ✅ `BETTER_AUTH_SECRET` is set

2. **Database Connection:**
   - ✅ Connection successful
   - ✅ All required tables exist (`user`, `session`, `account`, `verification`)

3. **Auth Configuration:**
   - ✅ BaseURL is correct
   - ✅ Auth instance initialized

### Expected Response:

```json
{
  "summary": {
    "status": "ok",
    "errors": 0,
    "warnings": 0
  }
}
```

If you see errors, follow the recommendations in the response.

## ✅ Step 4: Test Login

1. **Visit:** `https://cesclair.store/Cesworld/login`
2. **Try logging in** with a test account
3. **Check browser console** for any errors
4. **Check server logs** for detailed error messages

### Common Issues:

#### Issue: 500 Error on `/api/auth/sign-in/email`

**Possible Causes:**
1. ❌ `NEXT_PUBLIC_SITE_URL` not set → Fix: Set to `https://cesclair.store`
2. ❌ Database connection failed → Fix: Check `DATABASE_URL` and network access
3. ❌ Missing database tables → Fix: Run migrations
4. ❌ Database timeout → Fix: Check Neon database is not in "sleep" mode

**How to Debug:**
- Check server logs for detailed error messages
- Visit `/api/test/production-diagnostics` for system status
- Check browser console for client-side errors

#### Issue: Cookies Not Set

**Possible Causes:**
1. ❌ BaseURL mismatch → Fix: Ensure `NEXT_PUBLIC_SITE_URL=https://cesclair.store`
2. ❌ Cookie domain incorrect → Fix: Check trusted origins in auth config

## 🔍 Step 5: Check Server Logs

After attempting login, check your hosting platform's logs:

### Vercel:
1. Go to your project dashboard
2. Click on "Deployments"
3. Click on the latest deployment
4. Click on "Functions" tab
5. Look for `/api/auth/[...all]` function logs

### What to Look For:

**Good Signs:**
- ✅ `Auth request:` logs showing successful requests
- ✅ `Better Auth baseURL: https://cesclair.store`
- ✅ No database connection errors

**Bad Signs:**
- ❌ `WARNING: NEXT_PUBLIC_SITE_URL or BETTER_AUTH_URL not set`
- ❌ `Database connection error`
- ❌ `Table "user" does not exist`
- ❌ `Request timeout`

## 📋 Quick Verification Commands

### Check Environment Variables (via API):
```bash
curl https://cesclair.store/api/test/production-diagnostics
```

### Check Database Connection (via API):
```bash
curl https://cesclair.store/api/test/db-connection
```

### Check Auth Setup (via API):
```bash
curl https://cesclair.store/api/test/auth-setup
```

## 🚨 Emergency Fixes

### If Login Still Fails After All Checks:

1. **Verify Environment Variables:**
   - Double-check all variables are set correctly
   - Ensure no typos (especially in `NEXT_PUBLIC_SITE_URL`)
   - Verify `DATABASE_URL` is accessible from production

2. **Check Database:**
   - Ensure Neon database is not paused/sleeping
   - Verify connection string is correct
   - Check if tables exist: `SELECT * FROM information_schema.tables WHERE table_schema = 'public';`

3. **Redeploy:**
   - Sometimes a fresh deployment fixes environment variable issues
   - Clear build cache if available

4. **Check Auth Configuration:**
   - Verify `src/lib/auth.ts` has correct `trustedOrigins`
   - Ensure `baseURL` is being set correctly

## 📝 Notes

- The diagnostic endpoint (`/api/test/production-diagnostics`) is safe to leave enabled in production
- It only reads configuration and tests connections - it doesn't modify anything
- All error messages include specific fixes
- Server logs will show detailed error information

## ✅ Final Checklist

Before considering the deployment complete:

- [ ] All environment variables set correctly
- [ ] Database migrations applied
- [ ] Diagnostic endpoint shows no errors
- [ ] Can successfully log in
- [ ] Server logs show no errors
- [ ] Cookies are being set correctly
- [ ] Session persists after login

---

**Need Help?** Check the error messages from:
1. Browser console
2. Server logs
3. `/api/test/production-diagnostics` endpoint

All errors include specific fix instructions.

