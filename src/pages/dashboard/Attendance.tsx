"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import type { Employee } from "@/types/employee-portal"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { toast } from "sonner"
import {
  CalendarCheck,
  Plus,
  UserCheck,
  UserX,
  Home,
  Clock,
  TrendingUp,
  Users,
  Filter,
  Download
} from "lucide-react"

interface AttendanceRecord {
  id: string
  employee_id: string
  date: string
  status: "present" | "absent" | "wfh" | "half-day" | "on-leave"
  check_in_time?: string
  check_out_time?: string
  notes?: string
  created_at: string
  employee?: Employee
}

export default function AttendancePage() {
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split("T")[0])
  const [showMarkModal, setShowMarkModal] = useState(false)
  const [filterEmployee, setFilterEmployee] = useState<string>("all")
  const [formData, setFormData] = useState({
    employee_id: "",
    date: new Date().toISOString().split("T")[0],
    status: "present" as "present" | "absent" | "wfh" | "half-day" | "on-leave",
    check_in_time: "",
    check_out_time: "",
    notes: "",
  })

  useEffect(() => {
    loadData()
  }, [selectedDate])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [attendanceData, employeesData] = await Promise.all([
        supabase
          .from("daily_attendance")
          .select("*, employee:employees(*)")
          .eq("company_id", user.id)
          .gte("date", getMonthStart(selectedDate))
          .lte("date", getMonthEnd(selectedDate))
          .order("date", { ascending: false }),
        supabase.from("employees").select("*").eq("company_id", user.id).order("name"),
      ])

      setAttendance(attendanceData.data || [])
      setEmployees(employeesData.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load attendance")
    } finally {
      setIsLoading(false)
    }
  }

  const getMonthStart = (date: string) => {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth(), 1).toISOString().split("T")[0]
  }

  const getMonthEnd = (date: string) => {
    const d = new Date(date)
    return new Date(d.getFullYear(), d.getMonth() + 1, 0).toISOString().split("T")[0]
  }

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase.from("daily_attendance").insert([
        {
          ...formData,
          company_id: user.id,
        },
      ])

      if (error) throw error

      toast.success("Attendance marked successfully")
      setShowMarkModal(false)
      setFormData({
        employee_id: "",
        date: new Date().toISOString().split("T")[0],
        status: "present",
        check_in_time: "",
        check_out_time: "",
        notes: "",
      })
      await loadData()
    } catch (error: any) {
      console.error("Error marking attendance:", error)
      if (error.message?.includes("duplicate")) {
        toast.error("Attendance already marked for this date")
      } else {
        toast.error("Failed to mark attendance")
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "present":
        return "bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300"
      case "absent":
        return "bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300"
      case "wfh":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
      case "half-day":
        return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300"
      case "on-leave":
        return "bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300"
      default:
        return "bg-gray-100 text-gray-700"
    }
  }

  const filteredAttendance = attendance.filter((record) => {
    if (filterEmployee !== "all" && record.employee_id !== filterEmployee) return false
    return true
  })

  const presentCount = filteredAttendance.filter((a) => a.status === "present").length
  const absentCount = filteredAttendance.filter((a) => a.status === "absent").length
  const wfhCount = filteredAttendance.filter((a) => a.status === "wfh").length

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading attendance..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Attendance</h1>
          <p className="text-gray-600 dark:text-gray-400">Track daily employee attendance records</p>
        </div>
        <button
          onClick={() => setShowMarkModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Mark Attendance
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Records</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{filteredAttendance.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <CalendarCheck className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 text-xs">This period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Present</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{presentCount}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium text-xs">Checked in</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Absent</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{absentCount}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <UserX className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <UserX className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-600 dark:text-red-400 font-medium text-xs">Not present</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Work From Home</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{wfhCount}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Home className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Home className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 text-xs">Remote work</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400 text-xs">Total staff</span>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
          </div>
          <input
            type="month"
            value={selectedDate.substring(0, 7)}
            onChange={(e) => setSelectedDate(e.target.value + "-01")}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <select
            value={filterEmployee}
            onChange={(e) => setFilterEmployee(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Employees</option>
            {employees.map((emp) => (
              <option key={emp.id} value={emp.id}>
                {emp.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Attendance Table */}
      {filteredAttendance.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No attendance records for this month.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Date</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Check In</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Check Out</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredAttendance.map((record) => (
                  <tr key={record.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {new Date(record.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      <div>
                        <p className="font-medium">{record.employee?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{record.employee?.role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {record.check_in_time || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {record.check_out_time || "-"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                      {record.notes || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Mark Attendance Modal */}
      {showMarkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Mark Attendance</h2>
            </div>

            <form onSubmit={handleMarkAttendance} className="p-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Employee *</label>
                <select
                  required
                  value={formData.employee_id}
                  onChange={(e) => setFormData({ ...formData, employee_id: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="">Select Employee</option>
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.name} - {emp.role}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Date *</label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Status *</label>
                <select
                  required
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="present">Present</option>
                  <option value="absent">Absent</option>
                  <option value="wfh">Work From Home</option>
                  <option value="half-day">Half Day</option>
                  <option value="on-leave">On Leave</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Check In</label>
                  <input
                    type="time"
                    value={formData.check_in_time}
                    onChange={(e) => setFormData({ ...formData, check_in_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Check Out</label>
                  <input
                    type="time"
                    value={formData.check_out_time}
                    onChange={(e) => setFormData({ ...formData, check_out_time: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  placeholder="Add any additional notes..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Mark Attendance
                </button>
                <button
                  type="button"
                  onClick={() => setShowMarkModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
