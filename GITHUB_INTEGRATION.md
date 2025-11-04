# 🔗 GitHub Integration Guide

Complete guide to connect multiple GitHub repositories and get real-time data for your employees.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Prerequisites](#prerequisites)
- [Step 1: Generate GitHub Personal Access Token](#step-1-generate-github-personal-access-token)
- [Step 2: Configure Environment Variable](#step-2-configure-environment-variable)
- [Step 3: Add GitHub Repositories to Employees](#step-3-add-github-repositories-to-employees)
- [Step 4: Update Supabase Database](#step-4-update-supabase-database)
- [Step 5: View Real-Time GitHub Data](#step-5-view-real-time-github-data)
- [Advanced Features](#advanced-features)
- [Troubleshooting](#troubleshooting)
- [Rate Limits & Best Practices](#rate-limits--best-practices)

---

## 🎯 Overview

This dashboard integrates with GitHub API to:
- ✅ Track multiple repositories per employee
- ✅ Monitor commits and contributions
- ✅ View repository statistics
- ✅ Display activity feeds
- ✅ Generate reports with GitHub data

---

## 📦 Prerequisites

Before starting, ensure you have:

- ✅ A GitHub account
- ✅ Admin access to repositories you want to monitor
- ✅ Supabase database configured
- ✅ Development server running

---

## Step 1: Generate GitHub Personal Access Token

### 1.1 Go to GitHub Settings

1. Log in to [GitHub.com](https://github.com)
2. Click your profile picture (top-right)
3. Select **Settings**
4. Scroll down and click **Developer settings** (left sidebar)

### 1.2 Create Personal Access Token (Classic)

1. Click **Personal access tokens** → **Tokens (classic)**
2. Click **Generate new token** → **Generate new token (classic)**
3. You may need to confirm your password

### 1.3 Configure Token Settings

**Note/Description:**
```
Super Admin Dashboard - Employee GitHub Monitoring
```

**Expiration:**
- Select: `90 days` or `No expiration` (for testing)
- ⚠️ For production, use 90 days and rotate regularly

**Select Scopes:**

Check the following permissions:

- ✅ **repo** (Full control of private repositories)
  - `repo:status` - Access commit status
  - `repo_deployment` - Access deployment status
  - `public_repo` - Access public repositories
  - `repo:invite` - Access repository invitations

- ✅ **read:user** (Read user profile data)
  - `read:user` - Read user profile
  - `user:email` - Access user email addresses

- ✅ **read:org** (Read organization data) - Optional, if monitoring org repos
  - `read:org` - Read organization details

### 1.4 Generate and Copy Token

1. Click **Generate token** (bottom of page)
2. **IMPORTANT:** Copy the token immediately!
3. It looks like: `ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`
4. ⚠️ Save it securely - you won't see it again!

---

## Step 2: Configure Environment Variable

### 2.1 Update `.env` File

1. Open `.env` file in your project root
2. Add or update the GitHub token:

```env
# GitHub Integration
VITE_GITHUB_TOKEN=ghp_your_actual_token_here
```

**Example:**
```env
VITE_SUPABASE_URL=https://yourproject.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_GITHUB_TOKEN=ghp_abc123XYZ456def789GHI012jkl345MNO678
```

### 2.2 Restart Development Server

```powershell
# Stop current server (Ctrl+C)
# Then restart:
pnpm dev
```

⚠️ **Important:** Changes to `.env` require server restart!

---

## Step 3: Add GitHub Repositories to Employees

### Method 1: Add During Employee Creation

1. Go to **Employees** page in dashboard
2. Click **Add Employee** button
3. Fill in employee details
4. In **GitHub Username** field: Enter their GitHub username (e.g., `@johndoe`)
5. In **GitHub Repositories** section:
   - Enter repository in format: `owner/repo`
   - Examples:
     - `facebook/react`
     - `microsoft/vscode`
     - `your-org/your-project`
   - Click **Add** or press **Enter**
   - Add multiple repositories by repeating
6. Click **Add Employee**

### Method 2: Edit Existing Employee

1. Find employee in the list
2. Click **Edit** button (pencil icon)
3. Scroll to **GitHub Repositories** section
4. Add repositories using same format as above
5. Click **Save Changes**

### Repository Format Examples

```
✅ Correct:
- facebook/react
- vercel/next.js
- supabase/supabase
- your-username/your-repo

❌ Incorrect:
- https://github.com/facebook/react (don't include full URL)
- facebook/react/ (no trailing slash)
- @facebook/react (no @ symbol)
```

---

## Step 4: Update Supabase Database

### 4.1 Run SQL Update Script

If you haven't already, run the RLS fix script:

1. Open Supabase Dashboard
2. Go to **SQL Editor**
3. Open file: `scripts/03_fix_rls_policies.sql` from your project
4. Copy all SQL code
5. Paste in SQL Editor
6. Click **Run**

This script:
- ✅ Fixes RLS policies (allows adding employees)
- ✅ Adds `github_repos` column (supports multiple repos)
- ✅ Adds `github_last_sync` column (tracks sync time)

### 4.2 Verify Database Update

Run this query to check:

```sql
-- Check if columns exist
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'employees' 
AND column_name IN ('github_repos', 'github_last_sync');
```

You should see both columns listed.

---

## Step 5: View Real-Time GitHub Data

### 5.1 GitHub Monitoring Dashboard

1. Navigate to **GitHub Monitoring** in sidebar
2. You'll see all employees with GitHub repos
3. View:
   - Repository cards with stats
   - Recent commits
   - Contribution activity
   - Repository details

### 5.2 Employee GitHub Activity

For each employee, you can view:

**Repository Statistics:**
- ⭐ Stars count
- 🔄 Fork count
- 👁️ Watchers
- 🐛 Open issues
- 📝 Programming language

**Recent Activity:**
- Latest commits with messages
- Commit authors and timestamps
- Files changed
- Lines added/removed

**Contribution Graph:**
- Daily contribution heatmap
- Commit frequency
- Most active days

---

## 🚀 Advanced Features

### Multi-Repository Analytics

The dashboard automatically:

1. **Aggregates Data** from all employee repos
2. **Calculates Metrics:**
   - Total commits across all repos
   - Average commits per week
   - Most active repository
   - Contribution trends

3. **Generates Reports:**
   - Team-wide GitHub activity
   - Individual performance metrics
   - Repository health scores

### Real-Time Sync

GitHub data refreshes:
- **Automatically:** Every time you visit the GitHub Monitoring page
- **Manually:** Click refresh button on any repository card
- **Background:** Can be configured for periodic sync

### Webhook Integration (Future Feature)

For real-time updates, you can set up GitHub webhooks:

```
Webhook URL: https://your-domain.vercel.app/api/github/webhook
Events: push, pull_request, issues
```

---

## 🐛 Troubleshooting

### Issue: "GitHub API Rate Limit Exceeded"

**Problem:** GitHub limits API requests

**Solution:**
```
Without token: 60 requests/hour per IP
With token: 5,000 requests/hour

✅ Make sure VITE_GITHUB_TOKEN is set in .env
✅ Restart dev server after adding token
```

### Issue: "Repository Not Found"

**Problem:** Can't access repository data

**Causes:**
1. Repository doesn't exist
2. Repository is private and token lacks permissions
3. Repository owner/name is incorrect

**Solution:**
- Verify repository exists: https://github.com/owner/repo
- Check token has `repo` scope for private repos
- Ensure format is `owner/repo` (no spaces, lowercase)

### Issue: "Cannot Add Multiple Repositories"

**Problem:** Database doesn't have `github_repos` column

**Solution:**
1. Run `scripts/03_fix_rls_policies.sql` in Supabase
2. Verify column exists with query in Step 4.2
3. Refresh the page and try again

### Issue: "401 Unauthorized"

**Problem:** GitHub token is invalid or expired

**Solution:**
1. Generate new token (Step 1)
2. Update `.env` file
3. Restart dev server
4. Try again

### Issue: "Data Not Updating"

**Problem:** Cached data or sync issue

**Solution:**
1. Clear browser cache (Ctrl+Shift+Delete)
2. Refresh page (Ctrl+F5)
3. Check browser console for errors (F12)
4. Verify token is valid

---

## ⚡ Rate Limits & Best Practices

### GitHub API Rate Limits

| Type | Limit | Reset Time |
|------|-------|------------|
| Unauthenticated | 60 requests/hour | Every hour |
| Authenticated | 5,000 requests/hour | Every hour |
| Search API | 30 requests/minute | Every minute |

### Best Practices

1. **Always Use Authentication Token**
   - 83x more requests allowed
   - Access to private repositories
   - More detailed data

2. **Cache GitHub Data**
   - Store in Supabase for quick access
   - Update periodically, not on every page load
   - Use `github_last_sync` to track freshness

3. **Batch Repository Requests**
   ```typescript
   // ✅ Good: Fetch multiple repos in parallel
   const repos = await Promise.all(
     repoNames.map(name => octokit.repos.get({ owner, repo: name }))
   )
   
   // ❌ Bad: Sequential requests
   for (const name of repoNames) {
     await octokit.repos.get({ owner, repo: name })
   }
   ```

4. **Handle Rate Limit Errors**
   - Check `X-RateLimit-Remaining` header
   - Implement exponential backoff
   - Show user-friendly error messages

5. **Monitor Usage**
   - Check rate limit status:
   ```javascript
   const { data } = await octokit.rateLimit.get()
   console.log('Remaining:', data.rate.remaining)
   console.log('Reset at:', new Date(data.rate.reset * 1000))
   ```

---

## 📊 Example Use Cases

### Use Case 1: Track Team Productivity

**Setup:**
1. Add all team members as employees
2. Link their GitHub repositories
3. View aggregate metrics in Reports

**Metrics Available:**
- Total commits this week/month
- Most active contributors
- Repository with most activity
- Coding language breakdown

### Use Case 2: Code Review Monitoring

**Setup:**
1. Add repositories with active pull requests
2. Monitor PR activity in GitHub Monitoring
3. Track review response times

**Data Visible:**
- Open PRs count
- Average time to merge
- Top reviewers
- PR approval rates

### Use Case 3: Project Progress Tracking

**Setup:**
1. Link project repositories
2. Track issue resolution
3. Monitor milestone completion

**Insights:**
- Open vs closed issues trend
- Issue resolution time
- Milestone progress percentage
- Bug vs feature ratio

---

## 🔐 Security Best Practices

### Token Security

1. **Never Commit Tokens**
   ```gitignore
   # ✅ Always in .gitignore
   .env
   .env.local
   .env.*.local
   ```

2. **Rotate Tokens Regularly**
   - Set expiration: 90 days
   - Generate new before expiration
   - Update `.env` immediately

3. **Use Minimum Required Scopes**
   - Public repos only? Use `public_repo` instead of `repo`
   - Read-only? Don't grant write permissions
   - Limit organizational access

4. **Store in Environment Variables**
   - ✅ Use `.env` file (local development)
   - ✅ Use Vercel environment variables (production)
   - ❌ Never hardcode in source files

### Access Control

1. **Limit Repository Access**
   - Only add repositories team needs to monitor
   - Use organization tokens for org repos
   - Review access regularly

2. **Monitor Token Usage**
   - Check GitHub Settings → Developer settings
   - Review active tokens monthly
   - Revoke unused tokens

---

## 📚 Additional Resources

### GitHub API Documentation
- **REST API:** https://docs.github.com/en/rest
- **GraphQL API:** https://docs.github.com/en/graphql
- **Rate Limits:** https://docs.github.com/en/rest/rate-limit

### Octokit (GitHub API Library)
- **Documentation:** https://octokit.github.io/rest.js/
- **Examples:** https://github.com/octokit/rest.js#usage

### Dashboard Documentation
- **Setup Guide:** `QUICK_START.md`
- **Testing Checklist:** `TESTING_CHECKLIST.md`
- **Deployment:** `DEPLOYMENT.md`

---

## 🎉 Quick Start Example

Here's a complete example workflow:

```bash
# 1. Generate token at GitHub.com/settings/tokens
# Copy: ghp_abc123xyz...

# 2. Update .env
echo "VITE_GITHUB_TOKEN=ghp_abc123xyz..." >> .env

# 3. Restart server
pnpm dev

# 4. In dashboard:
# - Go to Employees
# - Click Add Employee
# - Enter name, email, etc.
# - Add GitHub username: @johndoe
# - Add repositories:
#   - johndoe/my-project
#   - acme-corp/website
#   - team/api-backend
# - Click Add Employee

# 5. View GitHub data:
# - Navigate to GitHub Monitoring
# - See all repositories and activity
# - Generate reports with GitHub metrics
```

---

## ✅ Verification Checklist

- [ ] GitHub token generated with correct scopes
- [ ] `.env` file updated with `VITE_GITHUB_TOKEN`
- [ ] Dev server restarted after `.env` change
- [ ] Supabase database updated (RLS policies)
- [ ] Employee created with GitHub repositories
- [ ] GitHub Monitoring page shows repository data
- [ ] Can view commits and contributions
- [ ] Reports include GitHub metrics
- [ ] Download reports works (CSV/HTML)

---

**Ready to track your team's GitHub activity!** 🚀

For issues or questions, check the troubleshooting section or create an issue in the project repository.

**Last Updated:** October 31, 2025
