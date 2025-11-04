import { supabase } from "./supabase"
import type {
  LeaveRequest,
  WFHRequest,
  Payslip,
  Project,
  ProjectTask,
  Notification,
  DailyAttendance,
  LeaveRequestForm,
  WFHRequestForm,
  ProjectForm,
  TaskForm,
  ProfileUpdateForm,
} from "@/types/employee-portal"

// ================================================
// LEAVE MANAGEMENT
// ================================================

export async function createLeaveRequest(employeeId: string, data: LeaveRequestForm) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  // Calculate total days
  const startDate = new Date(data.start_date)
  const endDate = new Date(data.end_date)
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1

  const { data: leaveRequest, error } = await supabase
    .from("leave_requests")
    .insert([
      {
        employee_id: employeeId,
        company_id: user.id,
        ...data,
        total_days: totalDays,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return leaveRequest
}

export async function getLeaveRequests(employeeId?: string) {
  let query = supabase
    .from("leave_requests")
    .select("*, employee:employees(*)")
    .order("created_at", { ascending: false })

  if (employeeId) {
    query = query.eq("employee_id", employeeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as LeaveRequest[]
}

export async function updateLeaveRequest(id: string, status: 'approved' | 'rejected', adminNotes?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("leave_requests")
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error

  // Update employee's used leave days if approved
  if (status === 'approved' && data) {
    const leaveRequest = data as LeaveRequest
    await supabase.rpc('increment_leave_days', {
      emp_id: leaveRequest.employee_id,
      days: leaveRequest.total_days,
    })
  }

  return data
}

// ================================================
// WFH MANAGEMENT
// ================================================

export async function createWFHRequest(employeeId: string, data: WFHRequestForm) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data: wfhRequest, error } = await supabase
    .from("wfh_requests")
    .insert([
      {
        employee_id: employeeId,
        company_id: user.id,
        ...data,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return wfhRequest
}

export async function getWFHRequests(employeeId?: string) {
  let query = supabase
    .from("wfh_requests")
    .select("*, employee:employees(*)")
    .order("wfh_date", { ascending: false })

  if (employeeId) {
    query = query.eq("employee_id", employeeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as WFHRequest[]
}

export async function updateWFHRequest(id: string, status: 'approved' | 'rejected', adminNotes?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("wfh_requests")
    .update({
      status,
      admin_notes: adminNotes,
      reviewed_by: user.id,
      reviewed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================================
// PAYSLIP MANAGEMENT
// ================================================

export async function getPayslips(employeeId?: string) {
  let query = supabase
    .from("payslips")
    .select("*, employee:employees(*)")
    .order("year", { ascending: false })
    .order("month", { ascending: false })

  if (employeeId) {
    query = query.eq("employee_id", employeeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as Payslip[]
}

export async function createPayslip(payslipData: Partial<Payslip>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("payslips")
    .insert([
      {
        ...payslipData,
        company_id: user.id,
        generated_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================================
// PROJECT MANAGEMENT
// ================================================

export async function getProjects() {
  const { data, error } = await supabase
    .from("projects")
    .select("*, assignments:project_assignments(*, employee:employees(*)), tasks:project_tasks(*)")
    .order("created_at", { ascending: false })

  if (error) throw error
  return data as Project[]
}

export async function getEmployeeProjects(employeeId: string) {
  const { data, error } = await supabase
    .from("project_assignments")
    .select("*, project:projects(*, tasks:project_tasks(*))")
    .eq("employee_id", employeeId)

  if (error) throw error
  return data.map((a) => a.project) as Project[]
}

export async function createProject(projectData: ProjectForm) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("projects")
    .insert([
      {
        ...projectData,
        company_id: user.id,
        created_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function assignEmployeeToProject(projectId: string, employeeId: string, role?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("project_assignments")
    .insert([
      {
        project_id: projectId,
        employee_id: employeeId,
        role,
        assigned_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================================
// TASK MANAGEMENT
// ================================================

export async function getTasks(employeeId?: string) {
  let query = supabase
    .from("project_tasks")
    .select("*, project:projects(*), employee:employees(*), updates:task_updates(*)")
    .order("created_at", { ascending: false })

  if (employeeId) {
    query = query.eq("assigned_to", employeeId)
  }

  const { data, error } = await query
  if (error) throw error
  return data as ProjectTask[]
}

export async function createTask(projectId: string, taskData: TaskForm) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("project_tasks")
    .insert([
      {
        project_id: projectId,
        ...taskData,
        created_by: user.id,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTask(taskId: string, updates: Partial<ProjectTask>) {
  const { data, error } = await supabase
    .from("project_tasks")
    .update(updates)
    .eq("id", taskId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function updateTaskStatus(taskId: string, status: ProjectTask["status"]) {
  return updateTask(taskId, { status })
}

export async function addTaskUpdate(taskId: string, employeeId: string, updateText: string) {
  const { data, error } = await supabase
    .from("task_updates")
    .insert([
      {
        task_id: taskId,
        employee_id: employeeId,
        update_text: updateText,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================================
// PROFILE MANAGEMENT
// ================================================

export async function updateEmployeeProfile(employeeId: string, profileData: Partial<ProfileUpdateForm>) {
  const { data, error } = await supabase
    .from("employees")
    .update(profileData)
    .eq("id", employeeId)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getEmployeeProfile(employeeId: string) {
  const { data, error } = await supabase
    .from("employees")
    .select("*")
    .eq("id", employeeId)
    .single()

  if (error) throw error
  return data
}

// ================================================
// NOTIFICATIONS
// ================================================

export async function getNotifications(userId: string) {
  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) throw error
  return data as Notification[]
}

export async function markNotificationAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ is_read: true })
    .eq("id", notificationId)

  if (error) throw error
}

export async function createNotification(userId: string, type: string, title: string, message: string, link?: string) {
  const { data, error } = await supabase
    .from("notifications")
    .insert([
      {
        user_id: userId,
        type,
        title,
        message,
        link,
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

// ================================================
// ATTENDANCE
// ================================================

export async function markAttendance(employeeId: string, date: string, checkInTime?: string, status?: string) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not authenticated")

  const { data, error } = await supabase
    .from("daily_attendance")
    .upsert([
      {
        employee_id: employeeId,
        company_id: user.id,
        date,
        check_in_time: checkInTime,
        status: status || 'present',
      },
    ])
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAttendance(employeeId: string, startDate: string, endDate: string) {
  const { data, error } = await supabase
    .from("daily_attendance")
    .select("*")
    .eq("employee_id", employeeId)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: false })

  if (error) throw error
  return data as DailyAttendance[]
}
