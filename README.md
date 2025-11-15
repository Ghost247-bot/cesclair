This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Environment Variables

Before running the application, you need to set up your environment variables. Copy `.env.example` to `.env.local` and fill in the required values:

```bash
cp .env.example .env.local
```

Required environment variables:
- `DATABASE_URL` - Neon PostgreSQL connection string
- `BETTER_AUTH_SECRET` - Secret key for authentication (generate with: `openssl rand -base64 32`)
- `NEXT_PUBLIC_SITE_URL` - Your production site URL (required for auth callbacks)

Optional environment variables:
- `BETTER_AUTH_URL` - Override auth URL if different from site URL
- `SIGNWELL_API_KEY` - SignWell API key (if using SignWell integration)
- `SIGNWELL_API_BASE` - SignWell API base URL (default: https://www.signwell.com/api/v1)

## Deployment

### Deploy on Vercel (Recommended)

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

#### Steps:

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Prepare for deployment"
   git push origin main
   ```

2. **Import your project to Vercel**
   - Go to [Vercel](https://vercel.com/new)
   - Import your GitHub repository
   - Vercel will automatically detect Next.js

3. **Configure Environment Variables**
   In your Vercel project settings, add the following environment variables:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Generate a secure secret (use: `openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` - Your Vercel deployment URL (e.g., `https://your-app.vercel.app`)
   - `SIGNWELL_API_KEY` - (if using SignWell integration)
   - `SIGNWELL_API_BASE` - (if using SignWell integration, optional)

4. **Deploy**
   - Click "Deploy"
   - Vercel will build and deploy your application
   - Your app will be available at `https://your-app.vercel.app`

#### Important Notes:
- Make sure your `NEXT_PUBLIC_SITE_URL` matches your Vercel deployment URL
- Update your Neon database connection string to allow connections from Vercel
- The `BETTER_AUTH_SECRET` should be a strong, random string (at least 32 characters)

### Deploy on Netlify

Netlify provides excellent support for Next.js applications with serverless functions and edge computing.

#### Steps:

1. **Push your code to GitHub** (already done)
   - Your code is already pushed to: `https://github.com/Ghost247-bot/cesclair`

2. **Import your project to Netlify**
   - Go to [Netlify](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select the `cesclair` repository
   - Netlify will automatically detect Next.js from the `netlify.toml` file

3. **Configure Build Settings**
   - Build command: `npm run build` (auto-detected)
   - Publish directory: `.next` (auto-detected)
   - Node version: `20` (configured in netlify.toml)

4. **Set Environment Variables**
   In your Netlify project settings → Site settings → Environment variables, add:
   - `DATABASE_URL` - Your Neon PostgreSQL connection string
   - `BETTER_AUTH_SECRET` - Generate a secure secret (use: `openssl rand -base64 32`)
   - `NEXT_PUBLIC_SITE_URL` - Your Netlify deployment URL (e.g., `https://your-app.netlify.app`)
   - `SIGNWELL_API_KEY` - (if using SignWell integration)
   - `SIGNWELL_API_BASE` - (if using SignWell integration, optional)

5. **Deploy**
   - Click "Deploy site"
   - Netlify will build and deploy your application
   - Your app will be available at `https://your-app.netlify.app`

#### Important Notes for Netlify:
- Make sure your `NEXT_PUBLIC_SITE_URL` matches your Netlify deployment URL
- Update your Neon database connection string to allow connections from Netlify
- The `BETTER_AUTH_SECRET` should be a strong, random string (at least 32 characters)
- Netlify uses the `@netlify/plugin-nextjs` plugin (configured in netlify.toml) for optimal Next.js support
- After deployment, update `NEXT_PUBLIC_SITE_URL` with your actual Netlify URL if using a custom domain

### Other Deployment Options

#### Docker Deployment

You can also deploy using Docker. Create a `Dockerfile`:

```dockerfile
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED 1

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

#### Build for Production

```bash
npm run build
npm start
```

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!
