# 🚀 Employee Portal Implementation Guide

## Overview
This guide will help you implement a complete Employee Portal system where:
- **Super Admins** manage employees, approve requests, assign projects
- **Employees** login separately, view their profile, request leave/WFH, update tasks, download payslips

---

## 🗄️ Step 1: Setup Database (CRITICAL - Do This First!)

### 1.1 Run SQL Scripts in Supabase

Open **Supabase SQL Editor** and run these scripts **in order**:

#### Script 1: Fix SELECT Policy (if not done already)
```sql
-- From: scripts/04_add_select_policy.sql
DROP POLICY IF EXISTS "Users can view their company employees" ON employees;

CREATE POLICY "Users can view their company employees" ON employees
  FOR SELECT 
  USING (company_id = auth.uid());
```

#### Script 2: Employee Portal Schema
```sql
-- From: scripts/05_employee_portal_schema.sql
-- (This is a LARGE script - copy entire contents and run)
```

This creates:
- ✅ 9 new tables (leave_requests, wfh_requests, payslips, projects, etc.)
- ✅ All RLS policies
- ✅ Indexes for performance
- ✅ Triggers for automation

### 1.2 Verify Tables Created

Run this to check:
```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('leave_requests', 'wfh_requests', 'payslips', 'projects', 
                     'project_assignments', 'project_tasks', 'task_updates', 
                     'notifications', 'daily_attendance')
ORDER BY table_name;
```

Should return 9 rows.

---

## 🏗️ Step 2: Architecture Overview

### Two Separate Portals:

```
┌─────────────────────────────────────────────────────────────┐
│  SUPER ADMIN PORTAL                                          │
│  - Login with Supabase Auth (existing)                      │
│  - Manage employees                                          │
│  - Approve/Reject leave & WFH requests                       │
│  - Create projects & assign employees                        │
│  - Upload payslips                                           │
│  - View all reports                                          │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  EMPLOYEE PORTAL                                             │
│  - Login with email/employee_id (custom auth)               │
│  - View & edit own profile                                   │
│  - Request leave & WFH                                       │
│  - View payslips                                             │
│  - View assigned projects & tasks                            │
│  - Update task progress                                      │
│  - Mark daily attendance                                     │
└─────────────────────────────────────────────────────────────┘
```

### Database Relationships:

```
auth.users (Super Admin)
    │
    └──> employees (company_id FK)
            │
            ├──> leave_requests (employee_id FK)
            ├──> wfh_requests (employee_id FK)
            ├──> payslips (employee_id FK)
            ├──> project_assignments (employee_id FK)
            │       │
            │       └──> projects (project_id FK)
            │
            └──> project_tasks (assigned_to FK)
                    │
                    └──> task_updates (task_id FK)
```

---

## 📋 Step 3: What I've Created For You

### Files Created:

1. **`scripts/05_employee_portal_schema.sql`**
   - Complete database schema
   - All tables, policies, indexes, triggers
   - Run this in Supabase SQL Editor

2. **`src/types/employee-portal.ts`**
   - TypeScript interfaces for all entities
   - Form types
   - Dashboard stats types
   - Import these in your components

3. **`src/services/employee-portal.ts`**
   - Complete API service layer
   - Functions for all CRUD operations
   - Leave, WFH, Projects, Tasks, Payslips, etc.

---

## 🎯 Step 4: Implementation Plan

### Phase 1: Employee Authentication (RECOMMENDED FIRST)

Since employees need separate login, you have two options:

#### Option A: Simple Approach (Recommended for MVP)
**Use employee table as employee list only** - No separate employee login
- Super admin adds employees
- Employees DON'T login - Super admin manages everything
- Simpler to implement
- Good for small teams

#### Option B: Full Dual Authentication
**Separate employee login system**
- Need to implement custom authentication
- Employees get their own credentials
- More complex but better for large teams

**My Recommendation**: Start with Option A, then add Option B later if needed.

For now, let me show you how to build **Phase 1** for Option A (simpler):

---

## 🔨 Step 5: Build Admin Portal Features (Option A)

Since you asked for both portals to be "merged" into the super admin page, here's the approach:

### Add These Pages to Super Admin Dashboard:

#### 1. **Approvals Page** (New)
Location: `src/pages/dashboard/Approvals.tsx`

Shows:
- Pending leave requests (approve/reject)
- Pending WFH requests (approve/reject)
- Recent approved/rejected requests
- Quick action buttons

#### 2. **Projects Page** (New)
Location: `src/pages/dashboard/Projects.tsx`

Shows:
- All projects with status
- Create new project
- Assign employees to projects
- View project tasks
- Track project progress

#### 3. **Tasks Page** (New)
Location: `src/pages/dashboard/Tasks.tsx`

Shows:
- All tasks across all projects
- Create/assign tasks to employees
- View task status and progress
- Task updates timeline

#### 4. **Payslips Page** (New)
Location: `src/pages/dashboard/Payslips.tsx`

Shows:
- Generate payslips for employees
- Upload PDF payslips
- View payslip history
- Download payslips

#### 5. **Attendance Page** (New)
Location: `src/pages/dashboard/Attendance.tsx`

Shows:
- Daily attendance records
- Mark attendance for employees
- Attendance reports
- Leave calendar view

---

## 📝 Step 6: Update Existing Pages

### Update `EmployeeDashboard.tsx`:

Add quick stats cards:
- Leave requests pending approval
- WFH requests pending approval
- Tasks assigned to employees
- Active projects

### Update Sidebar Navigation:

Add new menu items:
```tsx
- Dashboard
- Employees (existing)
- 🆕 Approvals (NEW - with badge for pending count)
- 🆕 Projects (NEW)
- 🆕 Tasks (NEW)
- 🆕 Payslips (NEW)
- 🆕 Attendance (NEW)
- Reports & Analytics (existing)
- Settings (existing)
```

---

## 🎨 Step 7: UI Components Needed

Create these reusable components:

### 1. `LeaveRequestCard.tsx`
```tsx
// Shows leave request details with approve/reject buttons
```

### 2. `WFHRequestCard.tsx`
```tsx
// Shows WFH request with calendar, approve/reject
```

### 3. `ProjectCard.tsx`
```tsx
// Project overview with progress bar, team members
```

### 4. `TaskCard.tsx`
```tsx
// Task with status badge, progress bar, assigned employee
```

### 5. `PayslipGenerator.tsx`
```tsx
// Form to generate payslip for an employee
```

### 6. `AttendanceCalendar.tsx`
```tsx
// Calendar view showing attendance status
```

---

## 🚀 Step 8: Quick Start Implementation

I'll create the most critical page first - **Approvals Page** - as this is the core feature you requested.

### Would you like me to:

1. ✅ **Create the Approvals Page** (Leave & WFH approval dashboard)
2. ✅ **Create the Projects Page** (Project management with employee assignments)
3. ✅ **Update the Sidebar** (Add new navigation items)
4. ✅ **Create sample components** (Request cards, task cards, etc.)

This will give you a working system where:
- Super admin can see all pending requests
- Approve/reject leave and WFH requests
- Create projects and assign employees
- View employee task progress

---

## 📊 Database Functions Needed

Add this SQL function to Supabase (for leave days tracking):

```sql
CREATE OR REPLACE FUNCTION increment_leave_days(emp_id UUID, days INTEGER)
RETURNS VOID AS $$
BEGIN
  UPDATE employees
  SET used_leave_days = used_leave_days + days
  WHERE id = emp_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

---

## 🔐 Security Considerations

The RLS policies I created ensure:
- ✅ Super admins can see ALL data for their company
- ✅ Employees can only see their own data (when we add employee auth later)
- ✅ All operations are scoped to `company_id = auth.uid()`
- ✅ No cross-company data leaks

---

## 🎯 Next Steps

Tell me which features you want me to implement first:

### Option 1: Core Approvals (Recommended)
- ✅ Approvals page with leave/WFH requests
- ✅ Update sidebar navigation
- ✅ Add notification system

### Option 2: Full Project Management
- ✅ Projects page
- ✅ Task assignment system
- ✅ Progress tracking

### Option 3: Everything at Once
- ✅ All 5 new pages
- ✅ All components
- ✅ Complete integration

**What would you like me to build first?**

---

## 📚 Resources Created

- ✅ Database schema (9 tables, all policies)
- ✅ TypeScript types (complete type safety)
- ✅ Service layer (all API functions)
- ✅ This implementation guide

**Ready to start building! Let me know what to create first.** 🚀
