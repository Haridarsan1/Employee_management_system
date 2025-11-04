# 🔗 GitHub Integration Setup Guide

## Overview
Your dashboard now supports **real-time GitHub data** instead of dummy/mock data! Follow these steps to connect your GitHub account.

---

## 📋 Step-by-Step Setup

### 1️⃣ Generate a GitHub Personal Access Token

1. Go to **[GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens/new)**
2. Click **"Generate new token (classic)"**
3. Give it a descriptive name like `Admin Dashboard Integration`
4. Set an expiration date (or choose "No expiration" for convenience)
5. **Select the following scopes:**
   - ✅ `repo` - Full control of private repositories
   - ✅ `read:user` - Read user profile data
6. Click **"Generate token"** at the bottom
7. **⚠️ IMPORTANT:** Copy the token immediately (it won't be shown again!)

### 2️⃣ Connect GitHub in Dashboard

1. Open your dashboard at `http://localhost:3002`
2. Navigate to **Settings** page (from sidebar or user menu)
3. Scroll to the **"GitHub Integration"** section
4. Enter your details:
   - **GitHub Username:** Your GitHub username (e.g., `octocat`)
   - **Personal Access Token:** Paste the token you generated
5. Click **"Connect GitHub"**
6. You should see a success message: ✓ Connected as @your-username

### 3️⃣ View Your Real GitHub Data

1. Navigate to **GitHub Monitoring** page from the sidebar
2. You'll now see:
   - ✅ Your actual repositories
   - ✅ Real commit counts from the last week
   - ✅ Open pull requests across your repos
   - ✅ Repository stats (stars, issues, etc.)
   - ✅ Live charts with your data

---

## 🎯 What Data Gets Displayed?

### GitHub Monitoring Page Shows:
- **Total Commits** - Commits from the last 7 days across your repos
- **Open PRs** - Currently open pull requests
- **Repository List** - Your 10 most recently updated repos with:
  - Repository name and description
  - Star count
  - Open issues count
  - Last update date
  - Direct links to GitHub

### Charts Display:
- **Repository Performance** - Stars and issues per repo
- **Activity Trend** - Weekly commit/PR patterns (coming soon)

---

## 🔒 Security Notes

- Your GitHub token is stored **locally in your browser** (localStorage)
- The token is **never sent to any server** - only used for direct GitHub API calls
- You can disconnect anytime from the Settings page
- Keep your token secure - treat it like a password!

---

## ⚠️ Troubleshooting

### "Failed to connect GitHub"
- **Check your username** - Make sure it's exactly correct
- **Verify token scopes** - Must have `repo` and `read:user` permissions
- **Token expired?** - Generate a new one if needed

### "No repositories found"
- Make sure your GitHub account has repositories
- Check if your token has the correct permissions
- Try disconnecting and reconnecting

### "Rate limited"
- GitHub allows 5,000 API requests per hour with authentication
- If you hit the limit, wait an hour or reduce page refreshes

---

## 🚀 Next Steps

After connecting GitHub:
1. ✅ Visit the **GitHub Monitoring** page to see your data
2. ✅ All stats update based on your real repositories
3. ✅ Charts reflect actual commit/PR activity
4. ✅ Repository cards link directly to GitHub

---

## 💡 Tips

- **Keep your token secure** - Don't share it or commit it to git
- **Refresh the page** after connecting to see updated data
- **Update your token** anytime from Settings if it expires
- **Disconnect** when not in use for extra security

---

## 🎉 You're All Set!

Your dashboard is now connected to real GitHub data. Enjoy tracking your team's activity and contributions in real-time!

Need help? Check the console for any error messages or reconnect your GitHub account in Settings.
