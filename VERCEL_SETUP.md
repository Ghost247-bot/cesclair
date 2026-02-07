# Vercel deployment setup

Use this as the main checklist to deploy this Next.js app to Vercel.

## 1. Connect the repo

1. Open [vercel.com/new](https://vercel.com/new).
2. Import your Git repository (GitHub/GitLab/Bitbucket).
3. Vercel will detect **Next.js** and use settings from `vercel.json`.

No need to change **Framework Preset**, **Build Command**, or **Output Directory** unless you override them.

## 2. Environment variables

In the project: **Settings → Environment Variables**, add these. Use **Production**, **Preview**, and **Development** where noted.

### Required

| Variable | Value | Environments |
|----------|--------|---------------|
| `DATABASE_URL` | Your Neon (or other) PostgreSQL connection string, e.g. `postgresql://user:pass@host-pooler.region.aws.neon.tech/db?sslmode=require` | Production, Preview, Development |
| `BETTER_AUTH_SECRET` | Random secret (32+ chars). Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"` or `npm run generate-secret` | Production, Preview, Development |
| `NEXT_PUBLIC_SITE_URL` | Your live site URL, e.g. `https://your-app.vercel.app` or `https://yourdomain.com`. Update after first deploy. | Production, Preview, Development |

### Optional but recommended

| Variable | Value | Environments |
|----------|--------|---------------|
| `BETTER_AUTH_URL` | Same as `NEXT_PUBLIC_SITE_URL` if you want to pin auth base URL. If unset, the app uses `NEXT_PUBLIC_SITE_URL` or `VERCEL_URL`. | Production, Preview |

### Optional features

| Variable | Value | When |
|----------|--------|------|
| `NEXT_PUBLIC_TAWK_PROPERTY_ID` | Tawk.to property ID | If using Tawk chat widget |
| `NEXT_PUBLIC_TAWK_WIDGET_ID` | Tawk.to widget ID | If using Tawk chat widget |
| `SIGNWELL_API_KEY` | SignWell API key | If using SignWell |
| `SIGNWELL_API_BASE` | `https://www.signwell.com/api/v1` | If using SignWell |

## 3. Deploy

1. Click **Deploy**.
2. Wait for the build to finish.
3. Open the deployment URL and test login + main flows.

## 4. After first deployment

1. Copy the real deployment URL (e.g. `https://cesclair.vercel.app`).
2. In **Settings → Environment Variables**, set (or update) **`NEXT_PUBLIC_SITE_URL`** to that URL (no trailing slash).
3. Optionally set **`BETTER_AUTH_URL`** to the same value.
4. Redeploy (e.g. **Deployments → … → Redeploy** or push a new commit) so auth callbacks use the correct URL.

## 5. Custom domain (optional)

1. **Settings → Domains** → add your domain.
2. Follow the DNS instructions.
3. Set **`NEXT_PUBLIC_SITE_URL`** (and **`BETTER_AUTH_URL`** if used) to `https://yourdomain.com`.
4. Redeploy.

## Build and runtime

- **Build:** `npm run build` (or as in `vercel.json`).
- **Install:** Uses `vercel.json` `installCommand` if set (e.g. `npm install --legacy-peer-deps`); otherwise Vercel chooses from your lockfile.
- **API routes:** Treated as serverless functions; `vercel.json` sets a 30s max duration for `/api` routes.

## Troubleshooting

- **Build fails:** Check the build log, ensure all required env vars are set, run `npm run build` locally.
- **DB errors:** Verify `DATABASE_URL` (use pooler URL and `?sslmode=require`).
- **Auth/callbacks broken:** Ensure `NEXT_PUBLIC_SITE_URL` (and `BETTER_AUTH_URL` if set) match the URL you use in the browser (including custom domain).

## More detail

- Full deployment steps and troubleshooting: [VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)
- Env checklist: [VERCEL_ENV_CHECKLIST.md](./VERCEL_ENV_CHECKLIST.md)
- Quick start: [VERCEL_QUICK_START.md](./VERCEL_QUICK_START.md)
