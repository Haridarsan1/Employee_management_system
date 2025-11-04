# 🚀 Multi-Employee GitHub Integration Guide

## Overview
Your dashboard now supports **multiple employee GitHub accounts**! Each employee can connect their own GitHub account, select repositories to track, and admins can view detailed analytics for each employee.

---

## 🏗️ Architecture

### Database Schema
The system uses 4 main tables:
1. **employee_github_accounts** - Stores GitHub connection per employee
2. **employee_repositories** - Tracks selected repositories for each employee
3. **github_activity_log** - Records all GitHub activities (commits, PRs, issues)
4. **github_statistics** - Aggregated metrics (daily/weekly/monthly)

### Features
- ✅ **Employee Self-Service**: Employees connect their own GitHub
- ✅ **Repository Selection**: Choose specific repos to track
- ✅ **Real-time Sync**: Manual or automatic data synchronization
- ✅ **Admin Analytics**: Detailed views of employee GitHub activity
- ✅ **Activity Timeline**: Complete history of commits, PRs, issues
- ✅ **Performance Metrics**: Charts and statistics per employee

---

## 📋 Setup Instructions

### Step 1: Database Setup

1. Run the database migration script:
```bash
# Connect to your Supabase project
# Run the SQL file: scripts/03_github_integration.sql
```

2. Verify tables are created:
   - employee_github_accounts
   - employee_repositories
   - github_activity_log
   - github_statistics

### Step 2: Employee Setup (For Each Employee)

#### A. Connect GitHub Account

1. Navigate to **Settings** or **Employee Dashboard**
2. Find the **"GitHub Connection"** section
3. Enter:
   - **GitHub Username**: Your GitHub username
   - **Personal Access Token**: Generate from [GitHub Settings](https://github.com/settings/tokens/new?scopes=repo,read:user)
4. Click **"Connect GitHub"**

#### B. Select Repositories to Track

1. After connecting, click **"Add Repositories"**
2. Select repositories you want to track (check boxes)
3. Click **"Add X Repositories"**
4. Repositories will now be monitored

#### C. Sync Data

1. Click **"Sync Now"** to fetch latest data
2. System will fetch:
   - Commits from last 30 days
   - All pull requests
   - Repository metadata
3. This can be done manually anytime

### Step 3: Admin Monitoring

#### A. View Employee GitHub Status

1. Navigate to **Employees** page (`/dashboard/employees`)
2. You'll see:
   - Total employees with GitHub connected
   - GitHub usernames displayed for each employee
   - **"GitHub"** button for employees with connections

#### B. View Detailed Analytics

1. Click the **"GitHub"** button next to any employee
2. You'll be taken to `/dashboard/employees/{id}/github`
3. View:
   - **Stats Cards**: Total commits, PRs, merges, repositories
   - **Commit Activity Chart**: Visual timeline of activity
   - **Activity Distribution**: Breakdown by type
   - **Repository List**: All tracked repos with details
   - **Recent Activity Timeline**: Chronological activity feed

---

## 🎯 Features Explained

### For Employees

#### GitHub Connection Card
- Connect/disconnect GitHub account
- View connection status
- Last sync timestamp
- Quick sync button

#### Repository Management
- Browse all your repositories
- Select specific repos to track
- Enable/disable tracking per repo
- Remove repositories from tracking
- See repo metadata (language, description, stars)

#### Data Sync
- Manual sync: Click "Sync Now"
- Fetches last 30 days of commits
- Updates PR and issue data
- Updates repository metadata

### For Admins

#### Employee Dashboard Integration
- New metric card: "GitHub Connected"
- Shows count of employees with GitHub
- GitHub usernames visible in employee table
- Quick access button to GitHub analytics

#### Employee GitHub Detail Page
Shows comprehensive analytics:

**1. Summary Statistics**
- Total Commits (with lines added/deleted)
- Pull Requests Opened
- Pull Requests Merged (with merge rate %)
- Number of Tracked Repositories

**2. Commit Activity Chart**
- Area chart showing commits, PRs opened, PRs merged
- Filterable by period (daily/weekly/monthly)
- Visual trends over time

**3. Activity Distribution**
- Bar chart of activity types
- Shows commits, PRs, issues, reviews, releases
- Helps identify work patterns

**4. Tracked Repositories**
- Grid of all tracked repos
- Shows language, description
- Last commit date and sync time
- Direct links to GitHub

**5. Recent Activity Timeline**
- Chronological feed of all activities
- Shows activity type, details, repository
- Timestamps for each activity
- Scrollable list of recent 20 items

---

## 🔒 Security & Privacy

### Token Storage
- Tokens are base64 encoded in database
- **Production**: Should use proper encryption (AES-256)
- Stored per employee, not shared
- Can be disconnected anytime

### Data Access
- Employees can only manage their own GitHub connection
- Admins can view all employee GitHub data
- Row Level Security (RLS) policies enforce access control

### Permissions Required
GitHub token needs these scopes:
- `repo` - Access to repositories
- `read:user` - Read user profile

---

## 📊 Data Synchronization

### What Gets Synced

**Commits**
- SHA, message, author
- Commit date and time
- Lines added/deleted (from diff)
- Repository association

**Pull Requests**
- PR number, title, state
- Open/merged/closed status
- Creation and merge dates
- Associated repository

**Issues**
- Issue number, title, state
- Labels and assignees
- Open/close dates

**Statistics**
- Aggregated by day/week/month
- Per repository and overall
- Cached for performance

### Sync Frequency
- **Manual**: Click "Sync Now" anytime
- **Recommended**: Daily or after major commits
- **Future**: Can add automatic scheduled sync

---

## 🛠️ Troubleshooting

### Employee Can't Connect GitHub
**Problem**: "Invalid GitHub credentials" error
**Solutions**:
- Verify GitHub username is correct (case-sensitive)
- Ensure token has `repo` and `read:user` scopes
- Check token hasn't expired
- Generate a new token if needed

### No Repositories Showing
**Problem**: Connected but no repos visible
**Solutions**:
- Click "Add Repositories" to fetch from GitHub
- Check token permissions include repository access
- Verify repositories exist under your GitHub account
- Try disconnecting and reconnecting

### Sync Fails
**Problem**: "Failed to sync GitHub data" error
**Solutions**:
- Check internet connection
- Verify token is still valid
- Check GitHub API rate limits (5000/hour)
- Try syncing again after a few minutes

### Admin Can't View Employee GitHub
**Problem**: Employee shows "GitHub Not Connected"
**Solutions**:
- Employee needs to connect their account first
- Verify employee has GitHub username set
- Check database tables were created properly
- Ensure employee completed repository selection

---

## 🚀 Advanced Features

### Custom Time Periods
Admins can view activity over:
- Daily: Last 30 days
- Weekly: Last 12 weeks
- Monthly: Last 6 months

### Repository Filtering
- Filter activities by specific repository
- View aggregated stats across all repos
- Compare repository performance

### Activity Types Tracked
- **Commits**: Code changes
- **Pull Requests**: Code review submissions
- **Issues**: Bug reports and features
- **Reviews**: Code review comments
- **Releases**: Version tags and releases

---

## 🎉 Next Steps

1. **Run Database Migration**: Execute `03_github_integration.sql`
2. **Test Employee Flow**: Have test employee connect GitHub
3. **Verify Admin View**: Check employee GitHub detail page
4. **Enable for Team**: Roll out to all employees
5. **Monitor Usage**: Track which employees are connecting

---

## 📈 Benefits

### For Employees
- ✅ Single dashboard for all activity
- ✅ Track personal contributions
- ✅ Visibility into work output
- ✅ Portfolio/performance tracking

### For Managers/Admins
- ✅ Team activity overview
- ✅ Performance metrics per developer
- ✅ Identify high performers
- ✅ Track project contributions
- ✅ Data-driven decision making
- ✅ Transparent productivity metrics

---

## 🔧 Future Enhancements (Suggestions)

1. **Automatic Sync**: Schedule hourly/daily syncs
2. **Email Reports**: Weekly activity summaries
3. **Team Leaderboards**: Gamification of contributions
4. **Code Quality Metrics**: Integrate with code review tools
5. **Sprint Analytics**: Align with Agile sprints
6. **Custom Dashboards**: Per-team or per-project views
7. **Alerts**: Notify on PR status changes
8. **Integration**: Connect with Jira, Slack, etc.

---

## 💡 Tips

- **Encourage Daily Sync**: More accurate data
- **Review Weekly**: Check team patterns
- **Set Expectations**: Communicate what metrics mean
- **Focus on Trends**: Not individual days
- **Use for Support**: Identify blockers early
- **Celebrate Wins**: Recognize achievements

---

## 📞 Support

For issues or questions:
1. Check console for error messages
2. Verify database tables exist
3. Confirm GitHub tokens are valid
4. Review this guide for troubleshooting steps

---

**You're all set!** 🎊 Your team can now connect their GitHub accounts and you can track comprehensive developer activity and analytics!
