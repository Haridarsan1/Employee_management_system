-- ================================================
-- FIX: Row Level Security Policies Update
-- ================================================
-- Run this SQL in Supabase SQL Editor to fix the
-- "new row violates row-level security policy" error
-- ================================================

-- Drop existing policies that are too restrictive
DROP POLICY IF EXISTS "Super admins can manage employees" ON employees;
DROP POLICY IF EXISTS "Super admins can manage tasks" ON tasks;

-- Create new INSERT policy for employees (allows authenticated users to insert)
CREATE POLICY "Authenticated users can insert employees" ON employees
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create new UPDATE policy for employees
CREATE POLICY "Authenticated users can update employees" ON employees
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create new DELETE policy for employees
CREATE POLICY "Authenticated users can delete employees" ON employees
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Create new INSERT policy for tasks
CREATE POLICY "Authenticated users can insert tasks" ON tasks
  FOR INSERT 
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create new UPDATE policy for tasks
CREATE POLICY "Authenticated users can update tasks" ON tasks
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

-- Create new DELETE policy for tasks
CREATE POLICY "Authenticated users can delete tasks" ON tasks
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);

-- Policies for attendance
DROP POLICY IF EXISTS "Super admins can view all attendance" ON attendance;
DROP POLICY IF EXISTS "Super admins can manage attendance" ON attendance;

CREATE POLICY "Users can view attendance" ON attendance
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can insert attendance" ON attendance
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update attendance" ON attendance
  FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete attendance" ON attendance
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- Policies for audit_logs
CREATE POLICY "Users can insert audit logs" ON audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policies for users_metadata
CREATE POLICY "Users can view their own metadata" ON users_metadata
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can insert their own metadata" ON users_metadata
  FOR INSERT WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own metadata" ON users_metadata
  FOR UPDATE USING (id = auth.uid());

-- ================================================
-- UPDATE: Support multiple GitHub repositories
-- ================================================

-- Add github_repos column to store array of repository URLs
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS github_repos TEXT[] DEFAULT '{}';

-- Add column to track last GitHub sync time
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS github_last_sync TIMESTAMP;

-- Keep github_username for backward compatibility
-- Users can input multiple repos in the format: ["owner/repo1", "owner/repo2"]

-- ================================================
-- VERIFICATION
-- ================================================
-- Run this to verify policies are created:
-- SELECT * FROM pg_policies WHERE tablename IN ('employees', 'tasks', 'attendance', 'users_metadata');

-- Test INSERT (should work now):
-- INSERT INTO employees (company_id, name, email, role, github_username) 
-- VALUES (auth.uid(), 'Test Employee', 'test@example.com', 'Developer', 'testuser');
