# 🚀 Quick Start Guide

## ✅ Status: Development Server Running

Your Super Admin Dashboard is now running at: **http://localhost:3000/**

---

## 📋 What's Working

- ✅ Dependencies installed
- ✅ Vite development server running on port 3000
- ✅ Tailwind CSS v4 configured
- ✅ React + TypeScript + React Router setup
- ✅ Hot Module Replacement (HMR) enabled

---

## ⚠️ Important: You Must Configure These Before Testing

### 1. **Supabase Setup** (REQUIRED)

The application will NOT work without Supabase configuration:

1. **Create a Supabase Account**: https://supabase.com/
2. **Create a New Project** or use existing one
3. **Get Your Credentials**:
   - Go to **Settings** → **API**
   - Copy **Project URL** and **anon/public key**

4. **Update `.env` file** in the project root:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-supabase-anon-key-here
   ```

5. **Set Up Database Tables**:
   - Go to Supabase Dashboard → **SQL Editor**
   - Open `scripts/01_setup_database.sql` from this project
   - Copy and paste the SQL code
   - Click **Run** to create all tables

6. **Restart the dev server** after updating `.env`:
   ```powershell
   # Press Ctrl+C in the terminal to stop the server
   # Then run:
   pnpm dev
   ```

### 2. **GitHub Integration Setup** (OPTIONAL)

For GitHub monitoring features:

1. Go to: https://github.com/settings/tokens
2. Generate new token (classic)
3. Select scopes: `repo`, `read:user`
4. Add to `.env`:
   ```env
   VITE_GITHUB_TOKEN=ghp_your_token_here
   ```

---

## 🧪 Testing the Application

### Step 1: Sign Up
1. Open http://localhost:3000/
2. You'll be redirected to `/login`
3. Click "Sign Up" or go to `/signup`
4. Create a new account with:
   - Full Name
   - Email
   - Password
   - Company Name

### Step 2: Verify & Login
- Check your email for verification (if enabled in Supabase)
- Login with your credentials

### Step 3: Explore Features

#### Employee Management
- **Add Employee**: Click "Add Employee" button
- **Import CSV**: Upload bulk employees via CSV
- **Edit/Delete**: Use action buttons on employee cards

#### GitHub Integration
- **Connect GitHub**: Add GitHub username to employee profile
- **View Activity**: Monitor commits and contributions
- **Repository Tracking**: View employee repositories

#### Task Management
- **Create Tasks**: Assign tasks to employees
- **Set Priority**: Mark as high, medium, or low priority
- **Track Status**: pending, in-progress, completed

#### Attendance
- **Record Attendance**: Log hours worked
- **View History**: Track attendance over time

#### Reports & Analytics
- **Generate Reports**: Create custom reports
- **View Charts**: Visualize data with interactive charts
- **Export Data**: Download reports as CSV/PDF

---

## 🔧 Development Workflow

### Making Changes

1. **Edit Code**: Make changes in `src/` directory
2. **Hot Reload**: See changes instantly (no refresh needed)
3. **Check Console**: Monitor for errors in browser DevTools (F12)

### Project Structure
```
src/
├── components/       # UI components
│   ├── advanced/    # AI features, analytics
│   ├── auth/        # Login, signup
│   ├── github/      # GitHub integration
│   ├── layout/      # Sidebar, TopNav
│   └── modals/      # Dialogs and forms
├── pages/           # Route pages
│   ├── auth/        # Auth pages
│   └── dashboard/   # Dashboard views
├── services/        # API integrations
│   ├── supabase.ts
│   ├── auth.ts
│   └── github.ts
├── App.tsx          # Main routing
└── main.tsx         # Entry point
```

### Common Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm preview` | Preview production build |
| `pnpm lint` | Check code quality |

### Stopping the Server

1. Click on the terminal
2. Press `Ctrl + C`
3. Confirm with `Y` if prompted

---

## 🐛 Troubleshooting

### Issue: Can't Login / Blank Page
**Solution**: 
- Check if `.env` is configured with Supabase credentials
- Verify database tables are created (run SQL scripts)
- Check browser console (F12) for errors

### Issue: GitHub Features Not Working
**Solution**:
- Add `VITE_GITHUB_TOKEN` to `.env`
- Ensure GitHub username is set in employee profile
- Check token hasn't expired

### Issue: Module Not Found Errors
**Solution**:
```powershell
Remove-Item -Recurse -Force node_modules
Remove-Item pnpm-lock.yaml
pnpm install
```

### Issue: Port Already in Use
**Solution**:
```powershell
# Kill process on port 3000
netstat -ano | findstr :3000
taskkill /PID <PID_NUMBER> /F
```

### Issue: Build Errors
**Solution**:
```powershell
# Check TypeScript errors
npx tsc --noEmit

# Clear build cache
Remove-Item -Recurse -Force dist
pnpm build
```

---

## 📦 Deployment to Vercel

### Method 1: Via GitHub (Recommended)

1. **Push to GitHub**:
   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/your-repo.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to: https://vercel.com/new
   - Click "Import Project"
   - Select your GitHub repository
   - Configure:
     - **Framework Preset**: Vite
     - **Build Command**: `pnpm build`
     - **Output Directory**: `dist`
     - **Install Command**: `pnpm install`

3. **Add Environment Variables**:
   - In Vercel Dashboard → Settings → Environment Variables
   - Add:
     - `VITE_SUPABASE_URL`
     - `VITE_SUPABASE_ANON_KEY`
     - `VITE_GITHUB_TOKEN` (optional)

4. **Deploy**: Click "Deploy"

### Method 2: Via Vercel CLI

```powershell
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

## 🎯 Next Steps

### For Testing:
1. ✅ Configure Supabase (REQUIRED)
2. ✅ Set up database tables
3. ✅ Create test account
4. ✅ Add sample employees
5. ✅ Test all features systematically

### For Development:
1. Read `README.md` for comprehensive documentation
2. Explore `src/` directory structure
3. Check `components/ui/` for reusable UI components
4. Review `src/services/` for API integrations

### For Deployment:
1. Test thoroughly in local environment
2. Push code to GitHub repository
3. Deploy to Vercel
4. Configure production environment variables
5. Test production deployment

---

## 📞 Need Help?

### Documentation
- **Full README**: See `README.md` in project root
- **Supabase Docs**: https://supabase.com/docs
- **Vite Docs**: https://vitejs.dev/
- **React Router**: https://reactrouter.com/

### Common Resources
- **Tailwind CSS**: https://tailwindcss.com/docs
- **Radix UI**: https://www.radix-ui.com/
- **Shadcn/ui**: https://ui.shadcn.com/

---

## 🔑 Key Files to Know

| File | Purpose |
|------|---------|
| `.env` | Environment variables (Supabase, GitHub) |
| `src/App.tsx` | Main routing configuration |
| `src/main.tsx` | Application entry point |
| `src/services/supabase.ts` | Supabase client |
| `src/services/auth.ts` | Authentication logic |
| `vite.config.ts` | Vite configuration |
| `package.json` | Dependencies and scripts |
| `scripts/01_setup_database.sql` | Database schema |

---

## ✨ Features Available

- ✅ User Authentication (Sign up, Login, Logout)
- ✅ Employee CRUD Operations
- ✅ CSV Bulk Import
- ✅ Task Management
- ✅ Attendance Tracking
- ✅ GitHub Integration
- ✅ Reports & Analytics
- ✅ Audit Logs
- ✅ Dark Mode Theme
- ✅ Responsive Design
- ✅ Real-time Updates (via Supabase)

---

**Last Updated**: October 31, 2025

**Server Status**: ✅ Running on http://localhost:3000/

**Ready to test!** Just configure Supabase and you're good to go! 🎉
