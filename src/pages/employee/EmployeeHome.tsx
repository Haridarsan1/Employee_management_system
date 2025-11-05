"use client"

import { useState, useEffect } from "react"
import { useAuthStore } from "@/services/auth"
import { supabase } from "@/services/supabase"
import EmployeeGitHubSettings from "@/components/github/EmployeeGitHubSettings"
import ChangePasswordModal from "@/components/modals/ChangePasswordModal"
import AttendanceWidget from "@/components/attendance/AttendanceWidget"
import { checkMustChangePassword } from "@/services/employee-invitation"
import { toast } from "sonner"
import {
  Github,
  CheckSquare,
  Calendar,
  TrendingUp,
  Clock,
  Target,
  Activity,
} from "lucide-react"

export default function EmployeeHomePage() {
  const { user } = useAuthStore()
  const [employee, setEmployee] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [attendance, setAttendance] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [mustChangePassword, setMustChangePassword] = useState(false)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useEffect(() => {
    loadEmployeeData()
    checkPasswordChangeRequirement()
  }, [user])

  const checkPasswordChangeRequirement = async () => {
    if (!user?.email) return

    try {
      const needsChange = await checkMustChangePassword(user.email)
      setMustChangePassword(needsChange)
      setShowPasswordModal(needsChange)
    } catch (error) {
      console.error("Error checking password requirement:", error)
    }
  }

  const handlePasswordChangeSuccess = () => {
    setShowPasswordModal(false)
    setMustChangePassword(false)
    toast.success("Password changed successfully! Welcome to your dashboard.")
  }

  const loadEmployeeData = async () => {
    if (!user) return

    try {
      // Find employee by email
      const { data: empData, error: empError } = await supabase
        .from("employees")
        .select("*")
        .eq("email", user.email)
        .single()

      if (empError) throw empError
      setEmployee(empData)

      if (empData) {
        // Load tasks
        const { data: tasksData } = await supabase
          .from("tasks")
          .select("*")
          .eq("assigned_to", empData.id)
          .order("created_at", { ascending: false })
          .limit(5)

        setTasks(tasksData || [])

        // Load attendance
        const { data: attendanceData } = await supabase
          .from("attendance")
          .select("*")
          .eq("employee_id", empData.id)
          .order("date", { ascending: false })
          .limit(5)

        setAttendance(attendanceData || [])
      }
    } catch (error) {
      console.error("Error loading employee data:", error)
      toast.error("Failed to load your data")
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
            <h2 className="text-2xl font-bold text-yellow-900 dark:text-yellow-200 mb-4">
              Employee Profile Not Found
            </h2>
            <p className="text-yellow-700 dark:text-yellow-300 mb-4">
              Your employee profile hasn't been created yet. Please contact your administrator to set up your account.
            </p>
            <p className="text-sm text-yellow-600 dark:text-yellow-400">
              Email: {user?.email}
            </p>
          </div>
        </div>
      </div>
    )
  }

  const pendingTasks = tasks.filter((t) => t.status === "pending").length
  const completedTasks = tasks.filter((t) => t.status === "completed").length

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome, {employee.name}! 👋</h1>
            <p className="text-blue-100">{employee.role} • {employee.email}</p>
          </div>
          <button
            onClick={async () => {
              const { logout } = useAuthStore.getState()
              await logout()
              window.location.href = "/login"
            }}
            className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6 space-y-6">
        {/* Attendance Widget */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <AttendanceWidget />
          </div>
          
          {/* Quick Stats */}
          <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">My Tasks</h3>
                <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {pendingTasks} pending • {completedTasks} done
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">GitHub</h3>
                <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Github className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {employee.github_username ? "✓" : "—"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                {employee.github_username ? "Connected" : "Not connected"}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance</h3>
                <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Completion rate</p>
            </div>
          </div>
        </div>

        {/* Original Stats Cards (removed to avoid duplication) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6" style={{ display: 'none' }}>
          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">My Tasks</h3>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                <CheckSquare className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {pendingTasks} pending • {completedTasks} done
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance</h3>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">{attendance.length}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Days logged</p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">GitHub</h3>
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                <Github className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {employee.github_username ? "✓" : "—"}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              {employee.github_username ? "Connected" : "Not connected"}
            </p>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Performance</h3>
              <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Completion rate</p>
          </div>
        </div>

        {/* My Tasks */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">My Tasks</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{tasks.length} total</span>
          </div>

          {tasks.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No tasks assigned yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-300 dark:hover:border-blue-700 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white mb-1">{task.title}</h3>
                      {task.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {task.due_date ? new Date(task.due_date).toLocaleDateString() : "No deadline"}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          task.priority === "high"
                            ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            : task.priority === "medium"
                            ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                            : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      task.status === "completed"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : task.status === "in_progress"
                        ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                    }`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GitHub Integration */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">GitHub Integration</h2>
          <EmployeeGitHubSettings employeeId={employee.id} />
        </div>

        {/* Recent Attendance */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Attendance</h2>
            <span className="text-sm text-gray-500 dark:text-gray-400">{attendance.length} days</span>
          </div>

          {attendance.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <Activity className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No attendance records yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {attendance.map((record) => (
                <div
                  key={record.id}
                  className="flex items-center justify-between p-3 border border-gray-200 dark:border-slate-700 rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-gray-400" />
                    <span className="font-medium text-gray-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {record.hours_worked}h
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      record.status === "present"
                        ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                        : record.status === "absent"
                        ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                        : "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300"
                    }`}>
                      {record.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Force Password Change Modal */}
      {showPasswordModal && user?.email && (
        <ChangePasswordModal
          employeeEmail={user.email}
          isFirstLogin={mustChangePassword}
          onSuccess={handlePasswordChangeSuccess}
        />
      )}
    </div>
  )
}
