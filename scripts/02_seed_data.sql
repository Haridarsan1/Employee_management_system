-- Sample data for testing

INSERT INTO employees (company_id, name, email, github_username, role, skills, hire_date, status) VALUES
  ('00000000-0000-0000-0000-000000000001', 'John Smith', 'john@example.com', 'johnsmith', 'Senior Full Stack Dev', ARRAY['React', 'Node.js', 'PostgreSQL'], NOW() - INTERVAL '2 years', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Jane Doe', 'jane@example.com', 'janedoe', 'Mid Full Stack Dev', ARRAY['React', 'Python', 'Docker'], NOW() - INTERVAL '1 year', 'active'),
  ('00000000-0000-0000-0000-000000000001', 'Bob Johnson', 'bob@example.com', 'bobjohnson', 'Junior Full Stack Dev', ARRAY['JavaScript', 'Vue.js', 'MySQL'], NOW() - INTERVAL '3 months', 'active');

INSERT INTO tasks (company_id, assigned_to, title, description, priority, status, due_date) VALUES
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM employees WHERE email = 'john@example.com'), 'Implement API endpoints', 'Build REST API for user management', 'high', 'in_progress', NOW() + INTERVAL '5 days'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM employees WHERE email = 'jane@example.com'), 'Fix authentication bug', 'Resolve session timeout issue', 'high', 'pending', NOW() + INTERVAL '2 days'),
  ('00000000-0000-0000-0000-000000000001', (SELECT id FROM employees WHERE email = 'bob@example.com'), 'Create unit tests', 'Write tests for utility functions', 'medium', 'pending', NOW() + INTERVAL '7 days');
