# 🌐 Vercel Custom Domain Setup Guide

Complete guide for setting up a custom domain on Vercel.

## 📋 Prerequisites

- [x] Vercel account
- [x] Domain registered with a domain registrar (e.g., GoDaddy, Namecheap, Google Domains)
- [x] Access to your domain registrar's DNS settings

## 🚀 Step-by-Step Setup

### Step 1: Add Domain to Vercel Project

1. Go to your **Vercel Dashboard**
2. Select your project
3. Go to **Settings** → **Domains**
4. Click **"Add Domain"**
5. Enter your domain (e.g., `ceslane.com` or `www.ceslane.com`)
6. Click **"Add"**

### Step 2: Move Domain to Vercel Team (If Required)

If you see the message: **"Please move this domain to this team in order to use Vercel nameservers"**

This means the domain is associated with a different Vercel team or account. Here's how to fix it:

#### Option A: Move Domain to Current Team

1. Go to **Vercel Dashboard** → **Settings** → **Domains** (at account level, not project level)
2. Find your domain in the list
3. Click on the domain
4. Look for **"Team"** or **"Transfer"** option
5. Select your current team from the dropdown
6. Click **"Move"** or **"Transfer"**

#### Option B: Remove and Re-add Domain

1. Go to **Vercel Dashboard** → **Settings** → **Domains** (account level)
2. Find your domain
3. Click **"Remove"** or **"Delete"** (this doesn't delete your domain, just removes it from Vercel)
4. Go back to your **Project** → **Settings** → **Domains**
5. Click **"Add Domain"** again
6. Enter your domain
7. This should now allow you to use Vercel nameservers

#### Option C: Check Team Settings

1. Go to **Vercel Dashboard** → **Settings** → **Team** (or **Account**)
2. Check which team you're currently in
3. If the domain is in a different team:
   - Switch to that team, OR
   - Transfer the domain to your current team

### Step 3: Configure DNS with Vercel Nameservers

Once the domain is moved to your team, you'll see Vercel's nameservers:

**Example nameservers:**
```
ns1.vercel-dns.com
ns2.vercel-dns.com
```

#### How to Update Nameservers:

**For GoDaddy:**
1. Log in to GoDaddy
2. Go to **My Products** → **Domains**
3. Click on your domain
4. Scroll to **"Additional Settings"** → **"Manage DNS"**
5. Scroll down to **"Nameservers"**
6. Click **"Change"**
7. Select **"Custom"**
8. Enter Vercel's nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
9. Click **"Save"**

**For Namecheap:**
1. Log in to Namecheap
2. Go to **Domain List**
3. Click **"Manage"** next to your domain
4. Go to **"Advanced DNS"** tab
5. Scroll to **"Nameservers"**
6. Select **"Custom DNS"**
7. Enter Vercel's nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
8. Click **"✓"** to save

**For Google Domains:**
1. Log in to Google Domains
2. Click on your domain
3. Go to **"DNS"** section
4. Scroll to **"Name servers"**
5. Click **"Use custom name servers"**
6. Enter Vercel's nameservers:
   - `ns1.vercel-dns.com`
   - `ns2.vercel-dns.com`
7. Click **"Save"**

**For Cloudflare:**
1. Log in to Cloudflare
2. Select your domain
3. Go to **"DNS"** → **"Records"**
4. Scroll to **"Nameservers"** section
5. Click **"Change"**
6. Enter Vercel's nameservers
7. Click **"Continue"**

### Step 4: Wait for DNS Propagation

- DNS changes can take **24-48 hours** to propagate globally
- Usually works within **1-2 hours** in most regions
- You can check propagation status at: https://www.whatsmydns.net

### Step 5: Verify Domain

1. Go back to **Vercel Dashboard** → **Project** → **Settings** → **Domains**
2. You should see your domain with a **"Valid Configuration"** status
3. Once DNS propagates, Vercel will automatically provision an SSL certificate
4. Your site will be accessible at your custom domain!

## 🔧 Alternative: Using DNS Records (Without Nameservers)

If you prefer to keep your current nameservers (e.g., using Cloudflare), you can use DNS records instead:

### A Record Method:
1. In Vercel, go to **Project** → **Settings** → **Domains**
2. Add your domain
3. Vercel will show you DNS records to add
4. Add these records to your DNS provider:

**For root domain (ceslane.com):**
```
Type: A
Name: @
Value: 76.76.21.21
```

**For www subdomain (www.ceslane.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
```

### CNAME Method (Recommended):
1. Add both root and www domains in Vercel
2. For root domain, use A record: `76.76.21.21`
3. For www, use CNAME: `cname.vercel-dns.com`

## ✅ Verification Checklist

- [ ] Domain added to Vercel project
- [ ] Domain moved to correct Vercel team (if needed)
- [ ] Nameservers updated at domain registrar
- [ ] DNS propagation completed (check with whatsmydns.net)
- [ ] Domain shows "Valid Configuration" in Vercel
- [ ] SSL certificate automatically provisioned
- [ ] Site accessible at custom domain
- [ ] Both `yourdomain.com` and `www.yourdomain.com` work (if configured)

## 🐛 Troubleshooting

### "Domain not found" or "Invalid domain"
- Make sure you own the domain
- Check domain spelling
- Verify domain is registered and active

### "Please move this domain to this team"
- Follow Step 2 above to move domain to your team
- Or remove and re-add the domain

### DNS not propagating
- Wait 24-48 hours (normal propagation time)
- Clear your DNS cache: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
- Check propagation status: https://www.whatsmydns.net

### SSL certificate not provisioning
- Wait for DNS to fully propagate
- Make sure domain is correctly configured
- Vercel automatically provisions SSL certificates (can take up to 24 hours)

### Domain shows "Invalid Configuration"
- Check DNS records are correct
- Verify nameservers are updated
- Wait for DNS propagation

## 📚 Additional Resources

- [Vercel Domain Documentation](https://vercel.com/docs/concepts/projects/domains)
- [DNS Propagation Checker](https://www.whatsmydns.net)
- [Vercel Support](https://vercel.com/support)

## 🔗 Quick Links

- [Vercel Dashboard](https://vercel.com/dashboard)
- [Vercel Domains Settings](https://vercel.com/dashboard/domains)

