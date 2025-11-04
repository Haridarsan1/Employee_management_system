# 🚀 Deployment Guide - Vercel

Complete guide to deploy your Super Admin Dashboard to Vercel.

---

## 📋 Pre-Deployment Checklist

Before deploying, ensure:

- [ ] All features tested locally and working
- [ ] Supabase database is set up and configured
- [ ] Environment variables documented
- [ ] Code committed to Git repository
- [ ] No sensitive data in code (only in `.env`)
- [ ] Build succeeds locally (`pnpm build`)
- [ ] Preview build works (`pnpm preview`)

---

## 🔧 Prepare for Deployment

### Step 1: Test Production Build Locally

```powershell
# Build the project
pnpm build

# Test the production build
pnpm preview
```

Visit `http://localhost:4173` and test all features.

### Step 2: Create `.gitignore` (if not exists)

Ensure these are in `.gitignore`:
```
node_modules/
dist/
.env
.env.local
.DS_Store
*.log
.vite/
```

### Step 3: Push to GitHub

```powershell
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create main branch
git branch -M main

# Add remote repository (replace with your repo URL)
git remote add origin https://github.com/yourusername/super-admin-dashboard.git

# Push to GitHub
git push -u origin main
```

---

## 🌐 Deploy to Vercel

### Method 1: Via Vercel Dashboard (Recommended for Beginners)

#### Step 1: Create Vercel Account
1. Go to https://vercel.com/signup
2. Sign up with GitHub account
3. Authorize Vercel to access your repositories

#### Step 2: Import Project
1. Go to https://vercel.com/new
2. Click **"Import Project"**
3. Select **Import Git Repository**
4. Choose your repository from the list
5. Click **Import**

#### Step 3: Configure Project

**Build & Development Settings:**
- **Framework Preset**: `Vite`
- **Build Command**: `pnpm build` (or `npm run build`)
- **Output Directory**: `dist`
- **Install Command**: `pnpm install` (or `npm install`)
- **Development Command**: `pnpm dev` (or `npm run dev`)

**Root Directory:**
- Leave as `.` (project root)

#### Step 4: Add Environment Variables

Click **"Environment Variables"** and add:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_GITHUB_TOKEN=ghp_your_github_token_here
```

**Important**: Add these for **Production, Preview, and Development** environments.

#### Step 5: Deploy
1. Click **"Deploy"**
2. Wait for build to complete (2-5 minutes)
3. Once done, you'll get a URL like: `https://your-project.vercel.app`

---

### Method 2: Via Vercel CLI (For Advanced Users)

#### Step 1: Install Vercel CLI

```powershell
npm install -g vercel
```

#### Step 2: Login

```powershell
vercel login
```

Follow the prompts to authenticate.

#### Step 3: Configure Environment Variables

Create `vercel.json` in project root:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "installCommand": "pnpm install",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

#### Step 4: Deploy to Preview

```powershell
# Deploy to preview environment
vercel
```

This creates a preview deployment for testing.

#### Step 5: Add Environment Variables via CLI

```powershell
# Add environment variables
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL when prompted

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your anon key when prompted

vercel env add VITE_GITHUB_TOKEN
# Paste your GitHub token when prompted
```

Select environment: **Production**, **Preview**, and **Development**

#### Step 6: Deploy to Production

```powershell
vercel --prod
```

---

## 🔐 Environment Variables Setup

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://abc123.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIs...` |

### Optional Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_GITHUB_TOKEN` | GitHub Personal Access Token | `ghp_abc123...` |

### How to Add in Vercel Dashboard

1. Go to your project in Vercel
2. Click **Settings**
3. Click **Environment Variables**
4. Click **Add New**
5. Enter **Key** and **Value**
6. Select environments: ✅ Production ✅ Preview ✅ Development
7. Click **Save**
8. Redeploy for changes to take effect

---

## 🔄 Continuous Deployment

Once set up, Vercel automatically:

- ✅ Deploys on every push to `main` branch (Production)
- ✅ Creates preview deployments for pull requests
- ✅ Runs build checks before deploying
- ✅ Provides deployment logs and analytics

### Trigger New Deployment

**Method 1: Push to GitHub**
```powershell
git add .
git commit -m "Update feature"
git push
```

**Method 2: Via Vercel Dashboard**
1. Go to project in Vercel
2. Click **Deployments**
3. Click **Redeploy** on any deployment

**Method 3: Via CLI**
```powershell
vercel --prod
```

---

## 🌍 Custom Domain Setup

### Step 1: Add Domain in Vercel

1. Go to project in Vercel
2. Click **Settings** → **Domains**
3. Enter your domain (e.g., `dashboard.yourcompany.com`)
4. Click **Add**

### Step 2: Configure DNS

**If using Vercel Nameservers:**
- Update your domain's nameservers to Vercel's
- Vercel provides the nameserver addresses

**If using your own DNS:**

Add these DNS records:

| Type | Name | Value |
|------|------|-------|
| A | @ or subdomain | `76.76.19.19` |
| CNAME | www | `cname.vercel-dns.com` |

### Step 3: Verify

- DNS propagation takes 24-48 hours
- Vercel auto-provisions SSL certificate
- Your site will be available at your custom domain

---

## 📊 Post-Deployment

### Step 1: Verify Deployment

Visit your deployment URL and test:

- [ ] Page loads correctly
- [ ] Can sign up / log in
- [ ] Supabase connection works
- [ ] GitHub integration works (if configured)
- [ ] All features function properly
- [ ] No console errors
- [ ] Mobile view works

### Step 2: Monitor Performance

**Vercel Dashboard Provides:**
- 📈 Visitor analytics
- ⚡ Performance metrics
- 🐛 Error tracking
- 📊 Build logs

Access via: **Your Project** → **Analytics**

### Step 3: Set Up Alerts (Optional)

1. Go to **Settings** → **Notifications**
2. Enable notifications for:
   - Failed deployments
   - Performance issues
   - Error spikes

---

## 🛠️ Troubleshooting

### Build Fails

**Error: "Command pnpm not found"**
```json
// In vercel.json, change:
"installCommand": "npm install",
"buildCommand": "npm run build"
```

**Error: "ENOENT: no such file or directory"**
- Check `outputDirectory` is set to `dist`
- Ensure `vite.config.ts` uses correct paths

**Error: TypeScript errors during build**
```json
// In next.config.mjs (if using):
{
  "typescript": {
    "ignoreBuildErrors": true
  }
}
```

### Environment Variables Not Working

- Ensure variables start with `VITE_` prefix
- Redeploy after adding new variables
- Check variables are set for correct environment
- Clear Vercel cache and redeploy

### 404 Errors on Routes

Add `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Supabase Connection Issues

- Verify `VITE_SUPABASE_URL` is correct
- Ensure `VITE_SUPABASE_ANON_KEY` is correct
- Check Supabase project is not paused
- Verify Row Level Security policies allow access

---

## 🔒 Security Best Practices

### Before Deployment:

1. **Never commit `.env` to Git**
   ```
   # Add to .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Use Environment Variables**
   - All secrets in Vercel environment variables
   - Never hardcode API keys in code

3. **Enable CORS** (in Supabase)
   - Add your Vercel domain to allowed origins
   - Settings → API → CORS

4. **Enable RLS** (Row Level Security)
   - Ensure all Supabase tables have RLS enabled
   - Test policies thoroughly

5. **Secure GitHub Token**
   - Use minimal required scopes
   - Rotate tokens regularly
   - Consider using GitHub Apps instead of tokens

---

## 📈 Performance Optimization

### 1. Enable Caching

Vercel automatically caches static assets. Verify:
- Images are optimized
- Fonts are preloaded
- Code is minified

### 2. Enable Compression

Add to `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        }
      ]
    }
  ]
}
```

### 3. Analyze Bundle Size

```powershell
pnpm build
npx vite-bundle-visualizer
```

### 4. Lazy Load Components

```typescript
// Instead of:
import Dashboard from './Dashboard'

// Use:
const Dashboard = lazy(() => import('./Dashboard'))
```

---

## 🔄 Rollback Deployment

If something goes wrong:

### Via Dashboard:
1. Go to **Deployments**
2. Find previous working deployment
3. Click **•••** → **Promote to Production**

### Via CLI:
```powershell
vercel rollback
```

---

## 📞 Support & Resources

### Vercel Documentation
- https://vercel.com/docs

### Vercel Community
- https://github.com/vercel/vercel/discussions

### Status Page
- https://www.vercel-status.com/

---

## ✅ Deployment Checklist

- [ ] Code tested locally
- [ ] Production build tested
- [ ] Code pushed to GitHub
- [ ] Vercel project created
- [ ] Environment variables added
- [ ] First deployment successful
- [ ] Domain configured (if custom domain)
- [ ] SSL certificate active
- [ ] All features tested on live site
- [ ] Performance checked
- [ ] Error monitoring set up
- [ ] Team notified of deployment

---

**Congratulations! Your app is now live! 🎉**

Your deployment URL: `https://your-project.vercel.app`

---

**Last Updated**: October 31, 2025
