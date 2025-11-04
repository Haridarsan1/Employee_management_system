-- ================================================
-- EMPLOYEE PORTAL DATABASE SCHEMA
-- ================================================
-- Run this in Supabase SQL Editor to create all tables
-- for the employee portal system
-- ================================================

-- ================================================
-- 1. UPDATE EMPLOYEES TABLE
-- ================================================

-- Add authentication fields to employees table
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS password_hash TEXT,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS last_login TIMESTAMP,
ADD COLUMN IF NOT EXISTS employee_id VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS department VARCHAR(100),
ADD COLUMN IF NOT EXISTS designation VARCHAR(100),
ADD COLUMN IF NOT EXISTS date_of_birth DATE,
ADD COLUMN IF NOT EXISTS address TEXT,
ADD COLUMN IF NOT EXISTS emergency_contact_name VARCHAR(255),
ADD COLUMN IF NOT EXISTS emergency_contact_phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS bio TEXT,
ADD COLUMN IF NOT EXISTS profile_picture_url TEXT,
ADD COLUMN IF NOT EXISTS total_leave_days INTEGER DEFAULT 20,
ADD COLUMN IF NOT EXISTS used_leave_days INTEGER DEFAULT 0;

-- ================================================
-- 2. LEAVE REQUESTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type VARCHAR(50) NOT NULL, -- 'sick', 'casual', 'vacation', 'unpaid'
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  total_days INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 3. WORK FROM HOME REQUESTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS wfh_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  wfh_date DATE NOT NULL,
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_notes TEXT,
  reviewed_by UUID REFERENCES auth.users(id),
  reviewed_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 4. PAYSLIPS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS payslips (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL, -- 1-12
  year INTEGER NOT NULL,
  basic_salary DECIMAL(10, 2) NOT NULL,
  allowances DECIMAL(10, 2) DEFAULT 0,
  deductions DECIMAL(10, 2) DEFAULT 0,
  net_salary DECIMAL(10, 2) NOT NULL,
  file_url TEXT, -- Link to PDF payslip
  generated_by UUID REFERENCES auth.users(id),
  generated_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, month, year)
);

-- ================================================
-- 5. PROJECTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'on-hold', 'completed', 'archived'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
  start_date DATE,
  end_date DATE,
  github_repo VARCHAR(255),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 6. PROJECT ASSIGNMENTS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS project_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  role VARCHAR(100), -- 'lead', 'developer', 'designer', 'tester', etc.
  assigned_by UUID REFERENCES auth.users(id),
  assigned_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(project_id, employee_id)
);

-- ================================================
-- 7. TASKS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  assigned_to UUID REFERENCES employees(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'todo', -- 'todo', 'in-progress', 'review', 'completed'
  priority VARCHAR(20) DEFAULT 'medium',
  due_date DATE,
  progress INTEGER DEFAULT 0, -- 0-100
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 8. TASK UPDATES TABLE (Activity Log)
-- ================================================

CREATE TABLE IF NOT EXISTS task_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES project_tasks(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  update_text TEXT NOT NULL,
  old_status VARCHAR(50),
  new_status VARCHAR(50),
  old_progress INTEGER,
  new_progress INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 9. NOTIFICATIONS TABLE
-- ================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL, -- Can be employee or admin
  type VARCHAR(50) NOT NULL, -- 'leave_approved', 'wfh_approved', 'task_assigned', etc.
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(255), -- Link to relevant page
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ================================================
-- 10. ATTENDANCE TABLE (Enhanced)
-- ================================================

CREATE TABLE IF NOT EXISTS daily_attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  company_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  check_in_time TIME,
  check_out_time TIME,
  status VARCHAR(20) DEFAULT 'present', -- 'present', 'absent', 'leave', 'wfh', 'half-day'
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- ================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================

-- Enable RLS on all new tables
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE wfh_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payslips ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE task_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_attendance ENABLE ROW LEVEL SECURITY;

-- LEAVE REQUESTS POLICIES
CREATE POLICY "Employees can view their own leave requests" ON leave_requests
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()) OR company_id = auth.uid());

CREATE POLICY "Employees can insert their own leave requests" ON leave_requests
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));

CREATE POLICY "Admins can update leave requests" ON leave_requests
  FOR UPDATE USING (company_id = auth.uid());

-- WFH REQUESTS POLICIES
CREATE POLICY "Employees can view their own WFH requests" ON wfh_requests
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()) OR company_id = auth.uid());

CREATE POLICY "Employees can insert their own WFH requests" ON wfh_requests
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));

CREATE POLICY "Admins can update WFH requests" ON wfh_requests
  FOR UPDATE USING (company_id = auth.uid());

-- PAYSLIPS POLICIES
CREATE POLICY "Employees can view their own payslips" ON payslips
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()) OR company_id = auth.uid());

CREATE POLICY "Admins can manage payslips" ON payslips
  FOR ALL USING (company_id = auth.uid());

-- PROJECTS POLICIES
CREATE POLICY "Users can view projects" ON projects
  FOR SELECT USING (company_id = auth.uid());

CREATE POLICY "Admins can manage projects" ON projects
  FOR ALL USING (company_id = auth.uid());

-- PROJECT ASSIGNMENTS POLICIES
CREATE POLICY "Users can view assignments" ON project_assignments
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE company_id = auth.uid()));

CREATE POLICY "Admins can manage assignments" ON project_assignments
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE company_id = auth.uid()));

-- TASKS POLICIES
CREATE POLICY "Users can view tasks" ON project_tasks
  FOR SELECT USING (project_id IN (SELECT id FROM projects WHERE company_id = auth.uid()));

CREATE POLICY "Employees can update their own tasks" ON project_tasks
  FOR UPDATE USING (assigned_to IN (SELECT id FROM employees WHERE company_id = auth.uid()));

CREATE POLICY "Admins can manage tasks" ON project_tasks
  FOR ALL USING (project_id IN (SELECT id FROM projects WHERE company_id = auth.uid()));

-- TASK UPDATES POLICIES
CREATE POLICY "Users can view task updates" ON task_updates
  FOR SELECT USING (task_id IN (SELECT id FROM project_tasks WHERE project_id IN (SELECT id FROM projects WHERE company_id = auth.uid())));

CREATE POLICY "Employees can insert task updates" ON task_updates
  FOR INSERT WITH CHECK (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));

-- NOTIFICATIONS POLICIES
CREATE POLICY "Users can view their own notifications" ON notifications
  FOR SELECT USING (user_id = auth.uid() OR user_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));

CREATE POLICY "System can insert notifications" ON notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON notifications
  FOR UPDATE USING (user_id = auth.uid() OR user_id IN (SELECT id FROM employees WHERE company_id = auth.uid()));

-- ATTENDANCE POLICIES
CREATE POLICY "Employees can view their own attendance" ON daily_attendance
  FOR SELECT USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()) OR company_id = auth.uid());

CREATE POLICY "Employees can manage their own attendance" ON daily_attendance
  FOR ALL USING (employee_id IN (SELECT id FROM employees WHERE company_id = auth.uid()) OR company_id = auth.uid());

-- ================================================
-- INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_wfh_requests_employee ON wfh_requests(employee_id);
CREATE INDEX IF NOT EXISTS idx_wfh_requests_status ON wfh_requests(status);
CREATE INDEX IF NOT EXISTS idx_payslips_employee ON payslips(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_assignments_employee ON project_assignments(employee_id);
CREATE INDEX IF NOT EXISTS idx_project_tasks_assigned ON project_tasks(assigned_to);
CREATE INDEX IF NOT EXISTS idx_project_tasks_status ON project_tasks(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);

-- ================================================
-- FUNCTIONS FOR AUTOMATION
-- ================================================

-- Function to automatically update task progress
CREATE OR REPLACE FUNCTION update_task_progress()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO task_updates (task_id, employee_id, update_text, old_status, new_status, old_progress, new_progress)
  VALUES (NEW.id, NEW.assigned_to, 'Task updated', OLD.status, NEW.status, OLD.progress, NEW.progress);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for task updates
DROP TRIGGER IF EXISTS task_update_trigger ON project_tasks;
CREATE TRIGGER task_update_trigger
AFTER UPDATE ON project_tasks
FOR EACH ROW
WHEN (OLD.status IS DISTINCT FROM NEW.status OR OLD.progress IS DISTINCT FROM NEW.progress)
EXECUTE FUNCTION update_task_progress();

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leave_requests', 'wfh_requests', 'payslips', 'projects', 
                     'project_assignments', 'project_tasks', 'task_updates', 
                     'notifications', 'daily_attendance')
ORDER BY table_name;

-- Check policies
SELECT tablename, policyname, cmd 
FROM pg_policies 
WHERE tablename IN ('leave_requests', 'wfh_requests', 'payslips', 'projects', 
                    'project_assignments', 'project_tasks', 'notifications')
ORDER BY tablename, cmd;

-- ================================================
-- SAMPLE DATA (Optional - for testing)
-- ================================================

-- Insert a sample project
-- INSERT INTO projects (company_id, name, description, status, priority)
-- VALUES (auth.uid(), 'Employee Portal Development', 'Build comprehensive employee management system', 'active', 'high');

-- ================================================
-- SUCCESS!
-- ================================================
-- All tables, policies, and functions created successfully
-- Next: Run the SELECT policy fix from 04_add_select_policy.sql
-- ================================================
