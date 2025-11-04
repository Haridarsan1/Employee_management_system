-- ================================================
-- FIX: Users Metadata RLS Policies for Role-Based Auth
-- ================================================
-- This script fixes the 406 error on users_metadata queries
-- Run this in your Supabase SQL Editor

-- Ensure users_metadata table exists
CREATE TABLE IF NOT EXISTS users_metadata (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('admin', 'employee')),
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users_metadata ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own metadata" ON users_metadata;
DROP POLICY IF EXISTS "Users can insert their own metadata" ON users_metadata;
DROP POLICY IF EXISTS "Users can update their own metadata" ON users_metadata;

-- Create new policies that allow users to read their own metadata
CREATE POLICY "Users can view their own metadata" 
  ON users_metadata
  FOR SELECT 
  USING (id = auth.uid());

CREATE POLICY "Users can insert their own metadata" 
  ON users_metadata
  FOR INSERT 
  WITH CHECK (id = auth.uid());

CREATE POLICY "Users can update their own metadata" 
  ON users_metadata
  FOR UPDATE 
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ================================================
-- VERIFICATION
-- ================================================
-- Run these queries to verify:

-- 1. Check if table exists and has correct structure
-- SELECT * FROM information_schema.columns WHERE table_name = 'users_metadata';

-- 2. Check if RLS is enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'users_metadata';

-- 3. Check policies
-- SELECT * FROM pg_policies WHERE tablename = 'users_metadata';

-- 4. Test that authenticated users can read their own data
-- (Run this after logging in to the app)
-- SELECT * FROM users_metadata WHERE id = auth.uid();
