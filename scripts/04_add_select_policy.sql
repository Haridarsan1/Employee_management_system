-- ================================================
-- FIX: Add SELECT Policy for Employees
-- ================================================
-- This is the missing piece! Without a SELECT policy,
-- employees won't be visible after insertion.
-- ================================================

-- Add SELECT policy for employees (filter by company_id)
DROP POLICY IF EXISTS "Users can view their company employees" ON employees;

CREATE POLICY "Users can view their company employees" ON employees
  FOR SELECT 
  USING (company_id = auth.uid());

-- Verify all policies
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd as operation,
  qual as using_expression,
  with_check as check_expression
FROM pg_policies 
WHERE tablename = 'employees'
ORDER BY cmd;

-- ================================================
-- IMPORTANT: Run this in Supabase SQL Editor!
-- ================================================
