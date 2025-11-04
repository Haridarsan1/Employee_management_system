// ================================================
// EMPLOYEE PORTAL TYPE DEFINITIONS
// ================================================

export interface Employee {
  id: string
  company_id: string
  name: string
  email: string
  employee_id?: string
  phone?: string
  department?: string
  designation?: string
  github_username?: string
  github_repos?: string[]
  role: string
  skills: string[]
  status: string
  hire_date: string
  date_of_birth?: string
  address?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  bio?: string
  profile_picture_url?: string
  total_leave_days: number
  used_leave_days: number
  is_active: boolean
  last_login?: string
  created_at?: string
  updated_at?: string
}

export interface LeaveRequest {
  id: string
  employee_id: string
  company_id: string
  leave_type: 'sick' | 'casual' | 'vacation' | 'unpaid'
  start_date: string
  end_date: string
  total_days: number
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  employee?: Employee // Joined data
}

export interface WFHRequest {
  id: string
  employee_id: string
  company_id: string
  wfh_date: string
  reason: string
  status: 'pending' | 'approved' | 'rejected'
  admin_notes?: string
  reviewed_by?: string
  reviewed_at?: string
  created_at: string
  updated_at: string
  employee?: Employee // Joined data
}

export interface Payslip {
  id: string
  employee_id: string
  company_id: string
  month: string
  year: number
  basic_salary: number
  allowances: number
  deductions: number
  net_salary: number
  file_url?: string
  payment_date?: string
  payment_method: 'bank_transfer' | 'check' | 'cash'
  remarks?: string
  generated_by?: string
  generated_at: string
  created_at: string
  employee?: Employee // Joined data
}

export interface Project {
  id: string
  company_id: string
  name: string
  description?: string
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date?: string
  end_date?: string
  github_repo?: string
  created_by?: string
  created_at: string
  updated_at: string
  assignments?: ProjectAssignment[] // Joined data
  tasks?: ProjectTask[] // Joined data
}

export interface ProjectAssignment {
  id: string
  project_id: string
  employee_id: string
  role?: string
  assigned_by?: string
  assigned_at: string
  project?: Project // Joined data
  employee?: Employee // Joined data
}

export interface ProjectTask {
  id: string
  project_id: string
  assigned_to: string
  title: string
  description?: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  progress: number
  created_by?: string
  created_at: string
  updated_at: string
  project?: Project // Joined data
  employee?: Employee // Joined data
  updates?: TaskUpdate[] // Joined data
}

export interface TaskUpdate {
  id: string
  task_id: string
  employee_id: string
  update_text: string
  old_status?: string
  new_status?: string
  old_progress?: number
  new_progress?: number
  created_at: string
  employee?: Employee // Joined data
}

export interface Notification {
  id: string
  user_id: string
  type: string
  title: string
  message: string
  link?: string
  is_read: boolean
  created_at: string
}

export interface DailyAttendance {
  id: string
  employee_id: string
  company_id: string
  date: string
  check_in_time?: string
  check_out_time?: string
  status: 'present' | 'absent' | 'leave' | 'wfh' | 'half-day'
  notes?: string
  created_at: string
  updated_at: string
  employee?: Employee // Joined data
}

// Form types for creating/updating
export interface LeaveRequestForm {
  leave_type: 'sick' | 'casual' | 'vacation' | 'unpaid'
  start_date: string
  end_date: string
  reason: string
}

export interface WFHRequestForm {
  wfh_date: string
  reason: string
}

export interface ProjectForm {
  name: string
  description?: string
  status: 'active' | 'on-hold' | 'completed' | 'archived'
  priority: 'low' | 'medium' | 'high' | 'critical'
  start_date?: string
  end_date?: string
  github_repo?: string
}

export interface TaskForm {
  title: string
  description?: string
  assigned_to: string
  status: 'todo' | 'in-progress' | 'review' | 'completed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  due_date?: string
  progress: number
}

export interface ProfileUpdateForm {
  name: string
  email: string
  phone?: string
  address?: string
  date_of_birth?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  bio?: string
  skills: string[]
}

// Dashboard stats types
export interface AdminDashboardStats {
  totalEmployees: number
  activeEmployees: number
  pendingLeaveRequests: number
  pendingWFHRequests: number
  activeProjects: number
  totalTasks: number
  completedTasks: number
}

export interface EmployeeDashboardStats {
  assignedTasks: number
  completedTasks: number
  activeProjects: number
  leaveBalance: number
  pendingRequests: number
}

// User role type
export type UserRole = 'super_admin' | 'employee'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  employee?: Employee
}
