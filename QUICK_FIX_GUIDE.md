## 🚀 Quick Start - Testing Role-Based Auth

### STEP 1: Run SQL Script (REQUIRED FIRST!)
```
1. Open: https://jhshjqvxzzsrntizullw.supabase.co
2. Go to: SQL Editor
3. Copy & Paste: scripts/04_fix_users_metadata_rls.sql
4. Click: RUN
```

### STEP 2: Test Employee Flow
```
1. Open incognito window
2. Go to: http://localhost:3002/signup
3. Select: Employee (purple button)
4. Fill form & Sign Up
5. Check email → Click confirmation link
6. ✅ Should land on: /employee page
```

### STEP 3: Test Admin Flow
```
1. Open new incognito window
2. Go to: http://localhost:3002/signup
3. Select: Admin (blue button)
4. Fill form & Sign Up
5. Check email → Click confirmation link
6. ✅ Should land on: /dashboard page
```

### STEP 4: Test Login
```
Admin Login → Redirects to /dashboard
Employee Login → Redirects to /employee
```

---

## 🔧 What Was Fixed

### Problem Before:
❌ Email confirmation always redirected to admin dashboard
❌ Employee users were sent to /dashboard
❌ Role wasn't properly checked after email confirmation

### Solution Now:
✅ Dual fallback system for role detection:
   1. Checks users_metadata table first
   2. Falls back to auth.users.user_metadata.role
   3. Defaults to "employee" if neither works

✅ Auth state listener handles email confirmations
✅ Proper redirect logic based on actual user role
✅ LoginPage now checks role before redirecting
✅ Better error handling and logging

---

## 🎯 Expected Behavior

**Employee User:**
- Signup with employee toggle → Gets role "employee"
- Email confirmation → Redirects to /employee
- Can ONLY access /employee
- Tries to go to /dashboard → Auto-redirected to /employee

**Admin User:**
- Signup with admin toggle → Gets role "admin"
- Email confirmation → Redirects to /dashboard
- Can ONLY access /dashboard/* routes
- Tries to go to /employee → Auto-redirected to /dashboard

---

## 📍 Key Files Changed

1. **auth.ts** - Added fallback role detection + auth state listener
2. **LoginPage.tsx** - Fixed to redirect based on role
3. **ProtectedRoute.tsx** - Better null handling
4. **04_fix_users_metadata_rls.sql** - Database setup script
5. **TESTING_GUIDE.md** - Comprehensive test plan

---

## 🆘 If Something Goes Wrong

### Clear Everything:
```
1. Log out
2. Clear browser cache
3. Close all tabs
4. Open new incognito window
5. Try again
```

### Check Database:
```sql
-- See all users and their roles
SELECT id, email, raw_user_meta_data FROM auth.users;

-- See users_metadata table
SELECT * FROM users_metadata;
```

### Check Console:
Open browser DevTools (F12) → Console tab
Look for "Auth event:" logs
Should show role being set correctly

---

## ✅ Success Indicators

You'll know it's working when:
- Console shows: "Auth event: SIGNED_IN"
- Employee email confirmation goes to /employee
- Admin email confirmation goes to /dashboard
- No 406 errors in Network tab
- No infinite redirect loops
- Role shows correctly in browser console
