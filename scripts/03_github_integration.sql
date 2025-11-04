-- GitHub Integration Tables for Employee Tracking

-- Table to store employee GitHub account connections
CREATE TABLE IF NOT EXISTS employee_github_accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  github_username TEXT NOT NULL,
  github_token_encrypted TEXT, -- Store encrypted token (in production, use proper encryption)
  is_active BOOLEAN DEFAULT true,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id)
);

-- Table to store tracked repositories for each employee
CREATE TABLE IF NOT EXISTS employee_repositories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  github_account_id UUID NOT NULL REFERENCES employee_github_accounts(id) ON DELETE CASCADE,
  repo_name TEXT NOT NULL, -- format: "owner/repo"
  repo_url TEXT NOT NULL,
  description TEXT,
  language TEXT,
  is_private BOOLEAN DEFAULT false,
  is_tracked BOOLEAN DEFAULT true,
  last_commit_date TIMESTAMP,
  last_sync TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, repo_name)
);

-- Table to store GitHub activity logs and statistics
CREATE TABLE IF NOT EXISTS github_activity_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES employee_repositories(id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL, -- 'commit', 'pull_request', 'issue', 'review', 'release'
  activity_data JSONB NOT NULL, -- Store full activity details
  github_id TEXT, -- GitHub's unique ID for the activity
  occurred_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(github_id)
);

-- Table to store daily/weekly GitHub statistics per employee
CREATE TABLE IF NOT EXISTS github_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
  repository_id UUID REFERENCES employee_repositories(id) ON DELETE SET NULL,
  period_type TEXT NOT NULL, -- 'daily', 'weekly', 'monthly'
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  total_commits INT DEFAULT 0,
  total_prs_opened INT DEFAULT 0,
  total_prs_merged INT DEFAULT 0,
  total_prs_reviewed INT DEFAULT 0,
  total_issues_opened INT DEFAULT 0,
  total_issues_closed INT DEFAULT 0,
  lines_added INT DEFAULT 0,
  lines_deleted INT DEFAULT 0,
  active_days INT DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(employee_id, repository_id, period_type, period_start)
);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_github_accounts_employee ON employee_github_accounts(employee_id);
CREATE INDEX IF NOT EXISTS idx_repositories_employee ON employee_repositories(employee_id);
CREATE INDEX IF NOT EXISTS idx_repositories_tracked ON employee_repositories(is_tracked) WHERE is_tracked = true;
CREATE INDEX IF NOT EXISTS idx_activity_employee ON github_activity_log(employee_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON github_activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_occurred ON github_activity_log(occurred_at DESC);
CREATE INDEX IF NOT EXISTS idx_statistics_employee ON github_statistics(employee_id);
CREATE INDEX IF NOT EXISTS idx_statistics_period ON github_statistics(period_type, period_start);

-- Enable Row Level Security
ALTER TABLE employee_github_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE employee_repositories ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE github_statistics ENABLE ROW LEVEL SECURITY;

-- RLS Policies for super_admin access
CREATE POLICY "Super admins can view all GitHub accounts" ON employee_github_accounts
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage GitHub accounts" ON employee_github_accounts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all repositories" ON employee_repositories
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage repositories" ON employee_repositories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all activity logs" ON github_activity_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage activity logs" ON github_activity_log
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can view all statistics" ON github_statistics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

CREATE POLICY "Super admins can manage statistics" ON github_statistics
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM users_metadata 
      WHERE id = auth.uid() AND role = 'super_admin'
    )
  );

-- Function to update last_sync timestamp
CREATE OR REPLACE FUNCTION update_github_sync_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.last_sync = NOW();
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_github_account_sync
  BEFORE UPDATE ON employee_github_accounts
  FOR EACH ROW
  EXECUTE FUNCTION update_github_sync_timestamp();

CREATE TRIGGER update_repository_sync
  BEFORE UPDATE ON employee_repositories
  FOR EACH ROW
  EXECUTE FUNCTION update_github_sync_timestamp();
