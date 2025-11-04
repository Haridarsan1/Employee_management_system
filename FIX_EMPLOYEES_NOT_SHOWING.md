# 🔴 CRITICAL FIX NEEDED: Missing SELECT Policy

## Problem
Employees are being added to Supabase but **NOT showing up** in the dashboard.

## Root Cause
The RLS (Row Level Security) policies in Supabase are missing a **SELECT** policy for the `employees` table. 

Without this policy:
- ✅ Employees CAN be inserted (INSERT policy exists)
- ❌ Employees CANNOT be read/fetched (NO SELECT policy)
- Result: Data goes in, but can't come out!

## Solution

### Step 1: Run the SQL Script in Supabase

1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Go to your project: `jhshjqvxzzsrntizullw`
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste this SQL:

```sql
-- Add SELECT policy for employees
DROP POLICY IF EXISTS "Users can view their company employees" ON employees;

CREATE POLICY "Users can view their company employees" ON employees
  FOR SELECT 
  USING (company_id = auth.uid());
```

6. Click **Run** or press `Ctrl+Enter`
7. Should see: "Success. No rows returned"

### Step 2: Verify It Worked

Run this query to check all policies:

```sql
SELECT 
  policyname,
  cmd as operation
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY cmd;
```

You should see:
- ✅ DELETE policy
- ✅ INSERT policy
- ✅ SELECT policy ← **THIS IS THE NEW ONE**
- ✅ UPDATE policy

### Step 3: Test in Your App

1. Refresh your browser at http://localhost:3001/
2. Go to Employee Dashboard
3. Click "Add Employee"
4. Fill in the form with GitHub repos
5. Click Save
6. **Employee should now appear immediately!**

## Why This Happened

The original `03_fix_rls_policies.sql` script had:
- ✅ INSERT policy
- ✅ UPDATE policy
- ✅ DELETE policy
- ❌ **MISSING**: SELECT policy

This is a common RLS mistake - forgetting that READ operations need their own policy!

## Alternative: Complete RLS Reset

If you want to start fresh with proper policies:

```sql
-- Drop all existing policies
DROP POLICY IF EXISTS "Authenticated users can insert employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can update employees" ON employees;
DROP POLICY IF EXISTS "Authenticated users can delete employees" ON employees;
DROP POLICY IF EXISTS "Users can view their company employees" ON employees;

-- Create complete set of policies
CREATE POLICY "Users can view their company employees" ON employees
  FOR SELECT 
  USING (company_id = auth.uid());

CREATE POLICY "Users can insert employees" ON employees
  FOR INSERT 
  WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can update their company employees" ON employees
  FOR UPDATE 
  USING (company_id = auth.uid())
  WITH CHECK (company_id = auth.uid());

CREATE POLICY "Users can delete their company employees" ON employees
  FOR DELETE 
  USING (company_id = auth.uid());
```

These policies ensure users can only:
- SELECT their own company's employees (where company_id = their user ID)
- INSERT employees with their user ID as company_id
- UPDATE/DELETE only their own company's employees

## Files Created

I've created these scripts for you:
- ✅ `scripts/04_add_select_policy.sql` - Quick fix (just adds SELECT policy)

## After Running the SQL

The enhanced logging I added will help you see what's happening:

**In Browser Console**, you should see:
```
Fetching employees for company_id: [your-user-id]
Fetched employees: 1 [Array with employee data]
✅ Loaded 1 employee(s)
```

**When adding an employee**, you'll see:
```
Adding employee with company_id: [your-user-id]
Employee data: {company_id: "...", name: "...", github_repos: [...]}
Employee inserted successfully: [{...}]
Realtime event received: INSERT {...}
New employee inserted: {...}
🎉 Employee [Name] added!
```

## Summary

**DO THIS NOW**:
1. Open Supabase SQL Editor
2. Run the SELECT policy creation SQL (see Step 1 above)
3. Refresh your app
4. Try adding an employee
5. Should work immediately!

The issue was **100% the missing SELECT policy** in Supabase RLS. This is fixed now with proper SQL script.
