# 🚀 Super Admin Dashboard

A comprehensive employee management dashboard with GitHub integration, built with React, TypeScript, Vite, and Supabase.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Local Development Setup](#local-development-setup)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Deployment to Vercel](#deployment-to-vercel)
- [Project Structure](#project-structure)
- [Testing & Development Workflow](#testing--development-workflow)
- [Troubleshooting](#troubleshooting)

## ✨ Features

- **Employee Management**: Add, edit, and manage employees with detailed profiles
- **GitHub Integration**: Monitor employee GitHub activity and repositories
- **Task Management**: Assign and track tasks with priority levels
- **Attendance Tracking**: Record and view employee attendance
- **Reports & Analytics**: Generate comprehensive reports with charts
- **Audit Logs**: Track all system activities for compliance
- **Advanced Features**: 
  - AI Code Insights
  - Skill Gap Analyzer
  - Time Tracking
- **CSV Import**: Bulk import employees via CSV
- **Dark Mode**: Built-in theme switching
- **Responsive Design**: Works on desktop, tablet, and mobile

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS, Radix UI
- **State Management**: Zustand, Immer
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **Charts**: Recharts
- **Forms**: React Hook Form, Zod validation
- **GitHub API**: Octokit REST
- **Notifications**: Sonner (Toast notifications)

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18 or higher) - [Download](https://nodejs.org/)
- **pnpm** (recommended) or npm or yarn
  ```powershell
  npm install -g pnpm
  ```
- **Git** - [Download](https://git-scm.com/)
- **Supabase Account** - [Sign up](https://supabase.com/)
- **GitHub Account** (for GitHub integration features)

## 🚀 Local Development Setup

### Step 1: Install Dependencies

Open PowerShell in the project directory and run:

```powershell
pnpm install
```

Or if you prefer npm:
```powershell
npm install
```

### Step 2: Set Up Environment Variables

1. Copy the example environment file:
   ```powershell
   Copy-Item .env.example .env
   ```

2. Open `.env` file and configure the following variables:

   ```env
   # Required: Supabase Configuration
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key

   # Optional: GitHub Integration
   VITE_GITHUB_TOKEN=ghp_your-github-personal-access-token
   ```

### Step 3: Get Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing one
3. Navigate to **Settings** → **API**
4. Copy the following:
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon public** key → `VITE_SUPABASE_ANON_KEY`

### Step 4: Set Up Database

1. In your Supabase project dashboard, go to **SQL Editor**
2. Create a new query
3. Copy and paste the contents of `scripts/01_setup_database.sql`
4. Click **Run** to create all tables and policies
5. Optionally, run `scripts/02_seed_data.sql` to add sample data

#### Database Tables Created:
- `users_metadata` - User profile information
- `employees` - Employee records
- `tasks` - Task assignments
- `attendance` - Attendance records
- `audit_logs` - System audit trail

### Step 5: GitHub Integration Setup (Optional)

If you want to use GitHub monitoring features:

1. Go to [GitHub Settings → Developer Settings → Personal Access Tokens](https://github.com/settings/tokens)
2. Click **Generate new token (classic)**
3. Select scopes:
   - `repo` (Full control of private repositories)
   - `read:user` (Read user profile data)
4. Copy the generated token and add to `.env` as `VITE_GITHUB_TOKEN`

## 🎯 Running the Application

### Development Mode

Run the development server with hot module replacement:

```powershell
pnpm dev
```

Or with npm:
```powershell
npm run dev
```

The application will start at: **http://localhost:3000**

### Build for Production

Create an optimized production build:

```powershell
pnpm build
```

### Preview Production Build

Test the production build locally:

```powershell
pnpm preview
```

## 📤 Deployment to Vercel

### Option 1: Deploy via Vercel Dashboard (Recommended)

1. **Push your code to GitHub**:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/super-admin-dashboard.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [Vercel Dashboard](https://vercel.com/new)
   - Click **Import Project**
   - Select your GitHub repository
   - Configure project:
     - **Framework Preset**: Vite
     - **Build Command**: `pnpm build` or `npm run build`
     - **Output Directory**: `dist`
     - **Install Command**: `pnpm install` or `npm install`

3. **Add Environment Variables** in Vercel:
   - Go to **Settings** → **Environment Variables**
   - Add the same variables from your `.env` file:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GITHUB_TOKEN` (if using GitHub features)

4. **Deploy**: Click **Deploy** and wait for build to complete

### Option 2: Deploy via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

### Important Vercel Configuration

Create a `vercel.json` file in the root directory if needed:

```json
{
  "buildCommand": "pnpm build",
  "outputDirectory": "dist",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

## 📁 Project Structure

```
super-admin-dashboard/
├── app/                          # Next.js app directory (not used in current setup)
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── components/                   # Shadcn UI components
│   ├── ui/                      # Base UI components (buttons, dialogs, etc.)
│   └── theme-provider.tsx
├── public/                      # Static assets
│   └── *.svg, *.png, *.jpg
├── scripts/                     # Database setup scripts
│   ├── 01_setup_database.sql   # Table creation & RLS policies
│   └── 02_seed_data.sql        # Sample data
├── src/                         # Main application source
│   ├── components/              # React components
│   │   ├── advanced/           # Advanced features (AI, Analytics)
│   │   ├── auth/               # Authentication components
│   │   ├── common/             # Shared components
│   │   ├── github/             # GitHub integration components
│   │   ├── layout/             # Layout components (Sidebar, TopNav)
│   │   ├── modals/             # Modal dialogs
│   │   └── reports/            # Reporting components
│   ├── layouts/                # Page layouts
│   │   └── DashboardLayout.tsx
│   ├── pages/                  # Page components
│   │   ├── auth/               # Login & Signup pages
│   │   └── dashboard/          # Dashboard pages
│   ├── services/               # API & service integrations
│   │   ├── auth.ts             # Authentication service
│   │   ├── supabase.ts         # Supabase client
│   │   ├── github.ts           # GitHub API service
│   │   └── github-integration.ts
│   ├── App.tsx                 # Main app component with routing
│   ├── main.tsx                # Application entry point
│   └── index.css               # Global styles
├── styles/                     # Additional stylesheets
│   └── globals.css
├── .env                        # Environment variables (create from .env.example)
├── .env.example               # Example environment variables
├── index.html                 # HTML entry point
├── package.json               # Dependencies and scripts
├── tsconfig.json             # TypeScript configuration
├── vite.config.ts            # Vite configuration
└── README.md                 # This file
```

## 🧪 Testing & Development Workflow

### Initial Testing Checklist

1. **Authentication**:
   - [ ] Sign up with a new account
   - [ ] Verify email confirmation (if enabled in Supabase)
   - [ ] Log in with credentials
   - [ ] Check authentication persistence (refresh page)
   - [ ] Log out

2. **Employee Management**:
   - [ ] Add a new employee
   - [ ] Edit employee details
   - [ ] View employee list
   - [ ] Search/filter employees
   - [ ] Import employees via CSV

3. **Task Management**:
   - [ ] Create new task
   - [ ] Assign task to employee
   - [ ] Update task status
   - [ ] Set task priority
   - [ ] View tasks by status

4. **Attendance**:
   - [ ] Record attendance
   - [ ] View attendance history
   - [ ] Edit attendance records

5. **GitHub Integration**:
   - [ ] Connect GitHub account
   - [ ] View repository list
   - [ ] Monitor GitHub activity
   - [ ] Check commit history

6. **Reports & Analytics**:
   - [ ] Generate employee report
   - [ ] View analytics charts
   - [ ] Export report data
   - [ ] Check audit logs

7. **UI/UX**:
   - [ ] Test dark/light theme toggle
   - [ ] Check responsive design on mobile
   - [ ] Verify all navigation links
   - [ ] Test form validations
   - [ ] Check toast notifications

### Making Changes

1. **Modify UI Components**: Edit files in `src/components/`
2. **Update Styling**: Modify Tailwind classes or `src/index.css`
3. **Add New Pages**: Create in `src/pages/` and add route in `App.tsx`
4. **Change Database Schema**: Update SQL in `scripts/` and rerun in Supabase
5. **Add New Features**: Follow existing patterns in respective directories

### Development Tips

- **Hot Reload**: Changes auto-reload in dev mode
- **Type Checking**: Run `tsc --noEmit` to check TypeScript errors
- **Linting**: Run `pnpm lint` to check code quality
- **Console Logs**: Check browser console for errors/warnings
- **Supabase Logs**: Monitor real-time logs in Supabase dashboard

## 🐛 Troubleshooting

### Common Issues

#### 1. Module Not Found Errors
```powershell
# Clear cache and reinstall
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

#### 2. Supabase Connection Issues
- Verify `.env` file has correct credentials
- Check Supabase project is running
- Ensure database tables are created (run SQL scripts)
- Verify Row Level Security policies are set up

#### 3. GitHub Integration Not Working
- Check GitHub token has correct scopes
- Verify token hasn't expired
- Ensure GitHub username is correctly set for employees

#### 4. Build Failures
```powershell
# Check for TypeScript errors
npx tsc --noEmit

# Clear build cache
Remove-Item -Recurse -Force dist
pnpm build
```

#### 5. Port Already in Use
```powershell
# Change port in vite.config.ts or kill the process
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

#### 6. Authentication Issues
- Clear browser localStorage and cookies
- Check Supabase Auth settings (email confirmation, etc.)
- Verify auth.users table exists in Supabase

### Getting Help

- **Supabase Issues**: [Supabase Docs](https://supabase.com/docs) | [Discord](https://discord.supabase.com/)
- **Vite Issues**: [Vite Docs](https://vitejs.dev/) | [GitHub](https://github.com/vitejs/vite)
- **React Issues**: [React Docs](https://react.dev/)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server at localhost:3000 |
| `pnpm build` | Build production bundle to `dist/` |
| `pnpm preview` | Preview production build locally |
| `pnpm lint` | Run ESLint to check code quality |

## 🔒 Security Notes

- Never commit `.env` file to version control
- Keep Supabase keys secure (anon key is safe for client-side)
- Use Row Level Security (RLS) policies in Supabase
- Rotate GitHub tokens regularly
- Enable email confirmation in Supabase for production

## 📚 Additional Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Vite Documentation](https://vitejs.dev/)
- [React Router Documentation](https://reactrouter.com/)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Radix UI Documentation](https://www.radix-ui.com/)
- [Vercel Documentation](https://vercel.com/docs)

## 🤝 Contributing

1. Create a new branch for your feature
2. Make your changes
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create a pull request

## 📄 License

This project is private and proprietary.

---

**Last Updated**: October 31, 2025

**Questions?** Create an issue or contact the development team.
#   E m p l o y e e _ m a n a g e m e n t _ s y s t e m  
 