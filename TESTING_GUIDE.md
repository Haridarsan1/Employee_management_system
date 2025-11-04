# 🧪 Role-Based Authentication Testing Guide

## Prerequisites

Before testing, you MUST run the database setup script:

### 1. Run SQL Script in Supabase

1. Open your Supabase Dashboard: https://jhshjqvxzzsrntizullw.supabase.co
2. Go to **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy and paste the entire content of `scripts/04_fix_users_metadata_rls.sql`
5. Click **RUN** (or press Ctrl+Enter)
6. Verify success message appears

### 2. Verify Table Creation

Run this query in SQL Editor to confirm:
```sql
SELECT * FROM information_schema.columns WHERE table_name = 'users_metadata';
```

You should see columns: `id`, `role`, `full_name`, `company_name`, `created_at`, `updated_at`

---

## 🎯 Test Plan

### Test 1: Admin Signup & Login Flow

**Steps:**
1. Go to http://localhost:3002/signup
2. Click the **Admin** button (blue, 👨‍💼 icon)
3. Fill in the form:
   - Email: `admin@test.com`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
   - Full Name: `Admin User`
   - Company Name: `Test Company`
4. Click **Sign Up**
5. Check your email for confirmation link
6. Click the confirmation link in email
7. ✅ Should redirect to root `/` then to `/dashboard` (Admin Dashboard)

**Expected Results:**
- ✅ Admin can access `/dashboard` and all sub-routes
- ❌ Admin CANNOT access `/employee` (should redirect to `/dashboard`)
- ✅ Sidebar shows: Projects, Tasks, Payslips, Attendance, Employees, Reports, Settings
- ✅ Top nav shows admin user info

---

### Test 2: Employee Signup & Login Flow

**Steps:**
1. Open a new incognito/private window
2. Go to http://localhost:3002/signup
3. Click the **Employee** button (purple, 👤 icon)
4. Fill in the form:
   - Email: `employee@test.com`
   - Password: `Test1234!`
   - Confirm Password: `Test1234!`
   - Full Name: `Employee User`
   - Company Name: `Test Company`
5. Click **Sign Up**
6. Check your email for confirmation link
7. Click the confirmation link in email
8. ✅ Should redirect to root `/` then to `/employee` (Employee Home)

**Expected Results:**
- ✅ Employee can access `/employee` only
- ❌ Employee CANNOT access `/dashboard` (should redirect to `/employee`)
- ✅ Page shows: Welcome message, My Tasks, GitHub Integration, Attendance
- ✅ No admin sidebar or navigation
- ✅ Logout button visible

---

### Test 3: Direct Login (After Email Confirmation)

**Admin Login:**
1. Go to http://localhost:3002/login
2. Enter: `admin@test.com` / `Test1234!`
3. Click **Login**
4. ✅ Should redirect to `/dashboard`

**Employee Login:**
1. Go to http://localhost:3002/login
2. Enter: `employee@test.com` / `Test1234!`
3. Click **Login**
4. ✅ Should redirect to `/employee`

---

### Test 4: Protected Routes

**While logged in as Admin:**
1. Try to access: http://localhost:3002/employee
2. ✅ Should auto-redirect to `/dashboard`

**While logged in as Employee:**
1. Try to access: http://localhost:3002/dashboard
2. ✅ Should auto-redirect to `/employee`

---

### Test 5: Root Path Redirect

**Not logged in:**
1. Go to: http://localhost:3002/
2. ✅ Should redirect to `/login`

**Logged in as Admin:**
1. Go to: http://localhost:3002/
2. ✅ Should redirect to `/dashboard`

**Logged in as Employee:**
1. Go to: http://localhost:3002/
2. ✅ Should redirect to `/employee`

---

## 🐛 Troubleshooting

### Issue: Still redirecting to wrong dashboard after email confirmation

**Solution:**
1. Clear browser cache and cookies
2. Log out completely
3. Close all browser tabs
4. Try signup again in a fresh incognito window

### Issue: 406 Error on users_metadata

**Solution:**
1. Verify you ran `04_fix_users_metadata_rls.sql`
2. Check RLS policies exist:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'users_metadata';
   ```
3. Should see 3 policies: view, insert, update

### Issue: Role not persisting

**Solution:**
1. Check browser console for errors
2. Verify data in Supabase:
   ```sql
   SELECT * FROM users_metadata;
   ```
3. Check if role is stored in auth.users metadata:
   ```sql
   SELECT id, email, raw_user_meta_data FROM auth.users;
   ```

### Issue: Infinite redirect loop

**Solution:**
1. Clear browser cache
2. Log out
3. The app now has better loading state handling
4. Check browser console for "Auth event:" logs

---

## ✅ Success Checklist

- [ ] SQL script executed successfully
- [ ] Admin signup redirects to `/dashboard` after email confirmation
- [ ] Employee signup redirects to `/employee` after email confirmation
- [ ] Admin login goes to `/dashboard`
- [ ] Employee login goes to `/employee`
- [ ] Admin cannot access `/employee`
- [ ] Employee cannot access `/dashboard`
- [ ] Root path redirects based on role
- [ ] Logout works for both roles
- [ ] Browser console shows no errors

---

## 📝 Notes

- The app now uses **dual fallback system**:
  1. First tries to get role from `users_metadata` table
  2. Falls back to `auth.users.user_metadata.role` if table query fails
  3. This ensures email confirmation works even if there's a temporary DB issue

- Auth state changes are now monitored, so email confirmation automatically updates the user's session

- Default role is now **employee** (not admin) for safety

---

## 🔍 Debugging Commands

Check user role in browser console:
```javascript
// Get current auth state
const store = useAuthStore.getState()
console.log('User:', store.user?.email)
console.log('Role:', store.userRole)
console.log('Authenticated:', store.isAuthenticated)
```

Check Supabase session:
```javascript
const session = await supabase.auth.getSession()
console.log('Session:', session)
console.log('User metadata:', session.data.session?.user.user_metadata)
```

---

## 📧 Email Confirmation Settings

In Supabase Dashboard → Authentication → Email Templates:

Make sure "Confirm signup" template redirects to:
```
{{ .SiteURL }}
```

This ensures users return to your app root, which then redirects based on their role.
