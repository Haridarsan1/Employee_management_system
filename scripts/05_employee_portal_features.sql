-- ================================================
-- EMPLOYEE PORTAL ENHANCEMENT
-- ================================================
-- Features: Attendance, Performance, Training, Help Desk, Announcements, Themes
-- Run this after 04_fix_users_metadata_rls.sql

-- ================================================
-- 1. ADD EMPLOYEE METADATA
-- ================================================

-- Add columns to employees table for portal features
ALTER TABLE employees 
ADD COLUMN IF NOT EXISTS must_change_password BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS last_password_change TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS theme_preference TEXT DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'neon', 'black')),
ADD COLUMN IF NOT EXISTS is_invited BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS invited_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS invitation_token TEXT;

-- ================================================
-- 2. ATTENDANCE SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  clock_in TIMESTAMP WITH TIME ZONE,
  clock_out TIMESTAMP WITH TIME ZONE,
  status TEXT CHECK (status IN ('present', 'absent', 'half-day', 'leave', 'holiday', 'weekend')),
  work_hours DECIMAL(4,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(employee_id, date)
);

-- Attendance leave requests
CREATE TABLE IF NOT EXISTS leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  leave_type TEXT NOT NULL CHECK (leave_type IN ('sick', 'vacation', 'personal', 'unpaid', 'emergency')),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_count INTEGER NOT NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  admin_notes TEXT,
  approved_by UUID REFERENCES users_metadata(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 3. PERFORMANCE SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  reviewer_id UUID REFERENCES users_metadata(id),
  review_period_start DATE NOT NULL,
  review_period_end DATE NOT NULL,
  overall_rating DECIMAL(3,2) CHECK (overall_rating >= 0 AND overall_rating <= 5),
  technical_skills DECIMAL(3,2),
  communication DECIMAL(3,2),
  teamwork DECIMAL(3,2),
  productivity DECIMAL(3,2),
  quality_of_work DECIMAL(3,2),
  strengths TEXT,
  areas_for_improvement TEXT,
  goals TEXT,
  reviewer_comments TEXT,
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'acknowledged')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS performance_goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  status TEXT DEFAULT 'in-progress' CHECK (status IN ('not-started', 'in-progress', 'completed', 'cancelled')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')),
  created_by UUID REFERENCES users_metadata(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS kpi_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  metric_name TEXT NOT NULL,
  metric_value DECIMAL(10,2),
  target_value DECIMAL(10,2),
  unit TEXT,
  period_month INTEGER CHECK (period_month >= 1 AND period_month <= 12),
  period_year INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 4. TRAINING/COURSES SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  duration_hours INTEGER,
  difficulty TEXT CHECK (difficulty IN ('beginner', 'intermediate', 'advanced')),
  instructor_name TEXT,
  thumbnail_url TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS course_enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  course_id UUID REFERENCES courses(id) ON DELETE CASCADE,
  enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completion_date TIMESTAMP WITH TIME ZONE,
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  status TEXT DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'in-progress', 'completed', 'dropped')),
  certificate_url TEXT,
  final_score DECIMAL(5,2),
  UNIQUE(employee_id, course_id)
);

-- ================================================
-- 5. HELP DESK SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_number TEXT UNIQUE NOT NULL,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  category TEXT CHECK (category IN ('technical', 'hr', 'payroll', 'leave', 'equipment', 'other')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
  status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in-progress', 'waiting', 'resolved', 'closed')),
  assigned_to UUID REFERENCES users_metadata(id),
  resolved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ticket_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT CHECK (sender_type IN ('employee', 'admin')),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS faq_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  order_index INTEGER DEFAULT 0,
  is_visible BOOLEAN DEFAULT TRUE,
  views_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- 6. ANNOUNCEMENTS SYSTEM
-- ================================================

CREATE TABLE IF NOT EXISTS announcements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('general', 'urgent', 'policy', 'event', 'holiday', 'maintenance')),
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high')),
  is_pinned BOOLEAN DEFAULT FALSE,
  published_by UUID REFERENCES users_metadata(id),
  published_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  target_audience TEXT DEFAULT 'all' CHECK (target_audience IN ('all', 'employees', 'admins')),
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS announcement_reads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  announcement_id UUID REFERENCES announcements(id) ON DELETE CASCADE,
  employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
  read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(announcement_id, employee_id)
);

-- ================================================
-- 7. ENABLE RLS ON ALL TABLES
-- ================================================

ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE performance_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE kpi_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticket_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE faq_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;

-- ================================================
-- 8. RLS POLICIES - ATTENDANCE
-- ================================================

DROP POLICY IF EXISTS "Employees can view their own attendance" ON attendance;
CREATE POLICY "Employees can view their own attendance" ON attendance
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can view all attendance" ON attendance;
CREATE POLICY "Admins can view all attendance" ON attendance
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can insert their own attendance" ON attendance;
CREATE POLICY "Employees can insert their own attendance" ON attendance
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can manage all attendance" ON attendance;
CREATE POLICY "Admins can manage all attendance" ON attendance
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 9. RLS POLICIES - LEAVE REQUESTS
-- ================================================

DROP POLICY IF EXISTS "Employees can view their own leave requests" ON leave_requests;
CREATE POLICY "Employees can view their own leave requests" ON leave_requests
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Employees can create leave requests" ON leave_requests;
CREATE POLICY "Employees can create leave requests" ON leave_requests
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can view all leave requests" ON leave_requests;
CREATE POLICY "Admins can view all leave requests" ON leave_requests
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 10. RLS POLICIES - PERFORMANCE
-- ================================================

DROP POLICY IF EXISTS "Employees can view their own performance" ON performance_reviews;
CREATE POLICY "Employees can view their own performance" ON performance_reviews
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can manage all performance reviews" ON performance_reviews;
CREATE POLICY "Admins can manage all performance reviews" ON performance_reviews
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can view their own goals" ON performance_goals;
CREATE POLICY "Employees can view their own goals" ON performance_goals
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can manage all goals" ON performance_goals;
CREATE POLICY "Admins can manage all goals" ON performance_goals
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can view their own KPIs" ON kpi_metrics;
CREATE POLICY "Employees can view their own KPIs" ON kpi_metrics
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can manage all KPIs" ON kpi_metrics;
CREATE POLICY "Admins can manage all KPIs" ON kpi_metrics
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 11. RLS POLICIES - TRAINING
-- ================================================

DROP POLICY IF EXISTS "Everyone can view active courses" ON courses;
CREATE POLICY "Everyone can view active courses" ON courses
  FOR SELECT USING (is_active = TRUE);

DROP POLICY IF EXISTS "Admins can manage courses" ON courses;
CREATE POLICY "Admins can manage courses" ON courses
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can view their enrollments" ON course_enrollments;
CREATE POLICY "Employees can view their enrollments" ON course_enrollments
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Employees can enroll in courses" ON course_enrollments;
CREATE POLICY "Employees can enroll in courses" ON course_enrollments
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can manage all enrollments" ON course_enrollments;
CREATE POLICY "Admins can manage all enrollments" ON course_enrollments
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 12. RLS POLICIES - HELP DESK
-- ================================================

DROP POLICY IF EXISTS "Employees can view their own tickets" ON support_tickets;
CREATE POLICY "Employees can view their own tickets" ON support_tickets
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Employees can create tickets" ON support_tickets;
CREATE POLICY "Employees can create tickets" ON support_tickets
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Admins can view all tickets" ON support_tickets;
CREATE POLICY "Admins can view all tickets" ON support_tickets
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Users can view messages in their tickets" ON ticket_messages;
CREATE POLICY "Users can view messages in their tickets" ON ticket_messages
  FOR SELECT USING (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
      OR EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Users can send messages in their tickets" ON ticket_messages;
CREATE POLICY "Users can send messages in their tickets" ON ticket_messages
  FOR INSERT WITH CHECK (
    ticket_id IN (
      SELECT id FROM support_tickets 
      WHERE employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
      OR EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
    )
  );

DROP POLICY IF EXISTS "Everyone can view FAQ" ON faq_items;
CREATE POLICY "Everyone can view FAQ" ON faq_items
  FOR SELECT USING (is_visible = TRUE);

DROP POLICY IF EXISTS "Admins can manage FAQ" ON faq_items;
CREATE POLICY "Admins can manage FAQ" ON faq_items
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

-- ================================================
-- 13. RLS POLICIES - ANNOUNCEMENTS
-- ================================================

DROP POLICY IF EXISTS "Employees can view active announcements" ON announcements;
CREATE POLICY "Employees can view active announcements" ON announcements
  FOR SELECT USING (
    is_active = TRUE 
    AND (target_audience IN ('all', 'employees'))
    AND (expires_at IS NULL OR expires_at > NOW())
  );

DROP POLICY IF EXISTS "Admins can manage announcements" ON announcements;
CREATE POLICY "Admins can manage announcements" ON announcements
  FOR ALL USING (
    EXISTS (SELECT 1 FROM users_metadata WHERE id = auth.uid() AND role = 'admin')
  );

DROP POLICY IF EXISTS "Employees can mark announcements as read" ON announcement_reads;
CREATE POLICY "Employees can mark announcements as read" ON announcement_reads
  FOR INSERT WITH CHECK (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

DROP POLICY IF EXISTS "Employees can view their read status" ON announcement_reads;
CREATE POLICY "Employees can view their read status" ON announcement_reads
  FOR SELECT USING (
    employee_id IN (SELECT id FROM employees WHERE email = auth.jwt()->>'email')
  );

-- ================================================
-- 14. CREATE INDEXES FOR PERFORMANCE
-- ================================================

CREATE INDEX IF NOT EXISTS idx_attendance_employee_date ON attendance(employee_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_employee ON leave_requests(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leave_requests_status ON leave_requests(status);
CREATE INDEX IF NOT EXISTS idx_performance_reviews_employee ON performance_reviews(employee_id);
CREATE INDEX IF NOT EXISTS idx_performance_goals_employee ON performance_goals(employee_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_employee ON course_enrollments(employee_id);
CREATE INDEX IF NOT EXISTS idx_support_tickets_employee ON support_tickets(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_support_tickets_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_ticket_messages_ticket ON ticket_messages(ticket_id, created_at);
CREATE INDEX IF NOT EXISTS idx_announcements_active ON announcements(is_active, published_at DESC);
CREATE INDEX IF NOT EXISTS idx_announcement_reads ON announcement_reads(announcement_id, employee_id);

-- ================================================
-- 15. CREATE FUNCTIONS FOR AUTOMATION
-- ================================================

-- Function to generate ticket number
CREATE OR REPLACE FUNCTION generate_ticket_number()
RETURNS TEXT AS $$
DECLARE
  ticket_count INTEGER;
  new_number TEXT;
BEGIN
  SELECT COUNT(*) INTO ticket_count FROM support_tickets;
  new_number := 'TKT-' || LPAD((ticket_count + 1)::TEXT, 6, '0');
  RETURN new_number;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate ticket numbers
CREATE OR REPLACE FUNCTION set_ticket_number()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.ticket_number IS NULL THEN
    NEW.ticket_number := generate_ticket_number();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS set_ticket_number_trigger ON support_tickets;
CREATE TRIGGER set_ticket_number_trigger
  BEFORE INSERT ON support_tickets
  FOR EACH ROW
  EXECUTE FUNCTION set_ticket_number();

-- Function to calculate work hours
CREATE OR REPLACE FUNCTION calculate_work_hours()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.clock_in IS NOT NULL AND NEW.clock_out IS NOT NULL THEN
    NEW.work_hours := EXTRACT(EPOCH FROM (NEW.clock_out - NEW.clock_in)) / 3600;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS calculate_work_hours_trigger ON attendance;
CREATE TRIGGER calculate_work_hours_trigger
  BEFORE INSERT OR UPDATE ON attendance
  FOR EACH ROW
  EXECUTE FUNCTION calculate_work_hours();

-- ================================================
-- 16. SEED DATA - FAQ
-- ================================================

INSERT INTO faq_items (category, question, answer, order_index) VALUES
('attendance', 'How do I mark my attendance?', 'Go to the Attendance section and click "Clock In" when you start work and "Clock Out" when you finish. The system automatically calculates your work hours.', 1),
('attendance', 'How do I request leave?', 'Navigate to Attendance > Leave Requests, click "Request Leave", fill in the details including type, dates, and reason. Your request will be sent to HR for approval.', 2),
('training', 'How do I enroll in a course?', 'Go to Training section, browse available courses, and click "Enroll" on any course. You can track your progress from the "My Courses" tab.', 3),
('training', 'Where can I find my certificates?', 'Completed courses with certificates are available in Training > Completed tab. Click "Download Certificate" next to any completed course.', 4),
('helpdesk', 'How do I create a support ticket?', 'Go to Help Desk section, click "New Ticket", select category and priority, describe your issue, and submit. You will receive a ticket number for tracking.', 5),
('github', 'How do I connect my GitHub account?', 'In your dashboard, find the GitHub Integration section, enter your GitHub username and personal access token, then select repositories to track.', 6),
('performance', 'When are performance reviews conducted?', 'Performance reviews are typically conducted quarterly and annually. You will be notified when a review is scheduled. You can view past reviews in the Performance section.', 7),
('general', 'How do I change my password?', 'Go to Settings, click on "Security", and use the "Change Password" option. For security, you will need to enter your current password.', 8)
ON CONFLICT DO NOTHING;

-- ================================================
-- 17. SEED DATA - SAMPLE COURSES
-- ================================================

INSERT INTO courses (title, description, category, duration_hours, difficulty, instructor_name, is_active) VALUES
('Git & GitHub Fundamentals', 'Learn version control with Git and GitHub, including branching, merging, and collaboration workflows.', 'Development', 8, 'beginner', 'Sarah Chen', TRUE),
('Advanced JavaScript Patterns', 'Master advanced JavaScript concepts including closures, promises, async/await, and design patterns.', 'Development', 12, 'advanced', 'Mike Johnson', TRUE),
('React Best Practices', 'Learn React best practices, hooks, context, and performance optimization techniques.', 'Development', 10, 'intermediate', 'Emily Rodriguez', TRUE),
('Effective Communication Skills', 'Develop professional communication skills for better teamwork and client interactions.', 'Soft Skills', 6, 'beginner', 'David Lee', TRUE),
('Time Management Mastery', 'Learn proven techniques to manage your time effectively and boost productivity.', 'Productivity', 4, 'beginner', 'Lisa Wang', TRUE),
('Cybersecurity Basics', 'Understanding common security threats and best practices to protect yourself and the company.', 'Security', 8, 'beginner', 'Tom Anderson', TRUE),
('Database Design Principles', 'Learn relational database design, normalization, and SQL optimization.', 'Development', 15, 'intermediate', 'Rachel Green', TRUE),
('Leadership Fundamentals', 'Develop leadership skills including team management, decision making, and conflict resolution.', 'Leadership', 10, 'intermediate', 'James Brown', TRUE)
ON CONFLICT DO NOTHING;

-- ================================================
-- VERIFICATION QUERIES
-- ================================================

-- Check tables created
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name LIKE '%attendance%' OR table_name LIKE '%course%' OR table_name LIKE '%ticket%' OR table_name LIKE '%announcement%';

-- Check RLS enabled
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' AND (tablename LIKE '%attendance%' OR tablename LIKE '%course%' OR tablename LIKE '%ticket%' OR tablename LIKE '%announcement%');

-- Check indexes created
-- SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public' AND tablename IN ('attendance', 'support_tickets', 'course_enrollments');
