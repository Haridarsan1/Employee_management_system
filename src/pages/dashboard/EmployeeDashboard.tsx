"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/services/supabase"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ErrorModal from "@/components/common/ErrorModal"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import InviteEmployeeModal from "@/components/modals/InviteEmployeeModal"
import CSVImportModal from "@/components/modals/CSVImportModal"
import { toast } from "sonner"
import {
  Users,
  UserCheck,
  Briefcase,
  Plus,
  Upload,
  Search,
  Filter,
  Edit2,
  Trash2,
  Github,
  TrendingUp,
  Activity,
  Target
} from "lucide-react"

interface Employee {
  id: string
  name: string
  email: string
  github_username: string
  role: string
  skills: string[]
  status: string
  hire_date: string
}

export default function EmployeeDashboard() {
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<{ title: string; message: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<{ employee: Employee } | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState("name")
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [showCSVModal, setShowCSVModal] = useState(false)

  useEffect(() => {
    fetchEmployees()

    const subscription = supabase
      .channel("employees_channel")
      .on("postgres_changes", { event: "*", schema: "public", table: "employees" }, (payload) => {
        console.log("Realtime event received:", payload.eventType, payload)
        if (payload.eventType === "INSERT") {
          console.log("New employee inserted:", payload.new)
          setEmployees((prev) => [...prev, payload.new as Employee])
          toast.success(`Employee ${(payload.new as any).name} added!`)
        } else if (payload.eventType === "UPDATE") {
          console.log("Employee updated:", payload.new)
          setEmployees((prev) => prev.map((emp) => (emp.id === (payload.new as Employee).id ? (payload.new as Employee) : emp)))
        } else if (payload.eventType === "DELETE") {
          console.log("Employee deleted:", payload.old)
          setEmployees((prev) => prev.filter((emp) => emp.id !== payload.old.id))
        }
      })
      .subscribe((status) => {
        console.log("Realtime subscription status:", status)
      })

    return () => {
      console.log("Unsubscribing from realtime")
      subscription.unsubscribe()
    }
  }, [])

  const fetchEmployees = async () => {
    try {
      setIsLoading(true)
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error("User not authenticated")
      }

      console.log("Fetching employees for company_id:", user.id)

      // Fetch employees for current user's company
      const { data, error: err } = await supabase
        .from("employees")
        .select("*")
        .eq("company_id", user.id)
        .order("name")

      if (err) {
        console.error("Supabase query error:", err)
        throw err
      }
      
      console.log("Fetched employees:", data?.length || 0, data)
      setEmployees(data || [])
      
      if (data && data.length > 0) {
        toast.success(`Loaded ${data.length} employee(s)`)
      }
    } catch (err: any) {
      console.error("Error fetching employees:", err)
      setError({
        title: "Failed to load employees",
        message: err.message,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleDeleteEmployee = async (id: string) => {
    try {
      const { error: err } = await supabase.from("employees").delete().eq("id", id)

      if (err) throw err

      setEmployees(employees.filter((e) => e.id !== id))
      toast.success("Employee deleted successfully")
      setDeleteConfirm(null)
    } catch (err: any) {
      setError({
        title: "Delete failed",
        message: err.message,
      })
    }
  }

  const filteredEmployees = employees
    .filter(
      (emp) =>
        emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        emp.github_username?.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "email") return a.email.localeCompare(b.email)
      if (sortBy === "role") return a.role.localeCompare(b.role)
      return 0
    })

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your team and track performance metrics</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowCSVModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-slate-700 rounded-lg font-medium transition-colors"
          >
            <Upload className="w-4 h-4" />
            Import CSV
          </button>
          <button
            onClick={() => setShowInviteModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Invite Employee
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading employees..." />
        </div>
      ) : (
        <>
          {/* Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-green-500" />
                <span className="text-sm text-green-600 dark:text-green-400 font-medium">+12% from last month</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Employees</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter((e) => e.status === "active").length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                  <UserCheck className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((employees.filter((e) => e.status === "active").length / Math.max(employees.length, 1)) * 100)}% active rate
                </span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {new Set(employees.map((e) => e.role)).size}
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Target className="w-4 h-4 text-purple-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">Across {new Set(employees.map((e) => e.role)).size} roles</span>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">GitHub Connected</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {employees.filter((e) => e.github_username).length}
                  </p>
                </div>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
                  <Github className="w-6 h-6 text-orange-600 dark:text-orange-400" />
                </div>
              </div>
              <div className="mt-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-orange-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {Math.round((employees.filter((e) => e.github_username).length / Math.max(employees.length, 1)) * 100)}% connected
                </span>
              </div>
            </div>
          </div>

          {/* Employee Table */}
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700">
            {/* Table Header */}
            <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Employee Directory</h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Manage your team members and their information</p>
            </div>
            
            {/* Search and Filter */}
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <div className="flex gap-4 flex-col sm:flex-row">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search by name, email, or GitHub username..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Filter className="w-4 h-4 text-gray-400" />
                  </div>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="pl-9 pr-8 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none min-w-[160px]"
                  >
                    <option value="name">Sort by Name</option>
                    <option value="email">Sort by Email</option>
                    <option value="role">Sort by Role</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-slate-700">
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Employee</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Contact</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Role & Skills</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Status</th>
                    <th className="text-left py-4 px-6 font-medium text-gray-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
                  {filteredEmployees.map((emp) => (
                    <tr
                      key={emp.id}
                      className="hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                            {emp.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">{emp.name}</div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">ID: {emp.id.slice(0, 8)}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-1">
                          <div className="text-sm text-gray-900 dark:text-white">{emp.email}</div>
                          {emp.github_username ? (
                            <a
                              href={`https://github.com/${emp.github_username}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700 font-medium"
                            >
                              <Github className="w-4 h-4" />
                              @{emp.github_username}
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">No GitHub</span>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="space-y-2">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">{emp.role}</div>
                          <div className="flex flex-wrap gap-1">
                            {emp.skills?.slice(0, 2).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-md text-xs font-medium"
                              >
                                {skill}
                              </span>
                            ))}
                            {emp.skills?.length > 2 && (
                              <span className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-xs font-medium">
                                +{emp.skills.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                            emp.status === "active"
                              ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
                              : "bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                            emp.status === "active" ? "bg-green-500" : "bg-gray-400"
                          }`} />
                          {emp.status}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2">
                          {emp.github_username && (
                            <button
                              onClick={() => (window.location.href = `/dashboard/employees/${emp.id}/github`)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-lg transition-colors font-medium"
                            >
                              <Github className="w-4 h-4" />
                              GitHub
                            </button>
                          )}
                          <button className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors">
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ employee: emp })}
                            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Empty State */}
            {filteredEmployees.length === 0 && (
              <div className="text-center py-12">
                <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No employees found</h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  {searchQuery ? "Try adjusting your search criteria" : "Get started by adding your first employee"}
                </p>
                {!searchQuery && (
                  <button
                    onClick={() => setShowInviteModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Invite First Employee
                  </button>
                )}
              </div>
            )}
          </div>
        </>
      )}

      {error && <ErrorModal title={error.title} message={error.message} onClose={() => setError(null)} />}

      {deleteConfirm && (
        <ConfirmationModal
          title="Delete Employee"
          message={`Are you sure you want to delete ${deleteConfirm.employee.name}? This action cannot be undone.`}
          confirmText="Delete"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={() => handleDeleteEmployee(deleteConfirm.employee.id)}
          onCancel={() => setDeleteConfirm(null)}
        />
      )}

      {showInviteModal && (
        <InviteEmployeeModal 
          onClose={() => setShowInviteModal(false)} 
          onSuccess={() => {
            fetchEmployees()
            setShowInviteModal(false)
          }} 
        />
      )}

      <CSVImportModal isOpen={showCSVModal} onClose={() => setShowCSVModal(false)} onImportComplete={fetchEmployees} />
    </div>
  )
}
