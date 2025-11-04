"use client"

import { useState, useEffect } from "react"
import { getPayslips } from "@/services/employee-portal"
import { supabase } from "@/services/supabase"
import type { Payslip, Employee } from "@/types/employee-portal"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { toast } from "sonner"
import {
  DollarSign,
  Plus,
  Download,
  TrendingUp,
  Users,
  Calendar,
  Filter,
  FileText
} from "lucide-react"

export default function PayslipsPage() {
  const [payslips, setPayslips] = useState<Payslip[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [selectedPayslip, setSelectedPayslip] = useState<Payslip | null>(null)
  const [filterEmployee, setFilterEmployee] = useState<string>("all")
  const [filterMonth, setFilterMonth] = useState<string>("all")
  const [formData, setFormData] = useState({
    employee_id: "",
    month: "",
    year: new Date().getFullYear().toString(),
    basic_salary: "",
    allowances: "",
    deductions: "",
    net_salary: "",
    payment_date: "",
    payment_method: "bank_transfer" as "bank_transfer" | "check" | "cash",
    remarks: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    // Calculate net salary
    const basic = parseFloat(formData.basic_salary) || 0
    const allowances = parseFloat(formData.allowances) || 0
    const deductions = parseFloat(formData.deductions) || 0
    const net = basic + allowances - deductions
    setFormData((prev) => ({ ...prev, net_salary: net.toFixed(2) }))
  }, [formData.basic_salary, formData.allowances, formData.deductions])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [payslipsData, employeesData] = await Promise.all([
        getPayslips(),
        supabase.from("employees").select("*").eq("company_id", user.id).order("name"),
      ])

      setPayslips(payslipsData)
      setEmployees(employeesData.data || [])
    } catch (error) {
      console.error("Error loading data:", error)
      toast.error("Failed to load payslips")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreatePayslip = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from("payslips").insert([{
        ...formData,
        basic_salary: parseFloat(formData.basic_salary),
        allowances: parseFloat(formData.allowances),
        deductions: parseFloat(formData.deductions),
        net_salary: parseFloat(formData.net_salary),
        year: parseInt(formData.year),
      }])

      if (error) throw error

      toast.success("Payslip created successfully")
      setShowCreateModal(false)
      setFormData({
        employee_id: "",
        month: "",
        year: new Date().getFullYear().toString(),
        basic_salary: "",
        allowances: "",
        deductions: "",
        net_salary: "",
        payment_date: "",
        payment_method: "bank_transfer",
        remarks: "",
      })
      await loadData()
    } catch (error) {
      console.error("Error creating payslip:", error)
      toast.error("Failed to create payslip")
    }
  }

  const filteredPayslips = payslips.filter((payslip) => {
    if (filterEmployee !== "all" && payslip.employee_id !== filterEmployee) return false
    if (filterMonth !== "all" && payslip.month !== filterMonth) return false
    return true
  })

  const totalPayout = filteredPayslips.reduce((sum, p) => sum + p.net_salary, 0)
  const currentMonthPayslips = payslips.filter((p) => {
    const now = new Date()
    return p.month === now.toLocaleString("en-US", { month: "long" }) && p.year === now.getFullYear()
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading payslips..." />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Payslips</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage employee salary payments and records</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all shadow-md hover:shadow-lg"
        >
          <Plus className="w-4 h-4" />
          Generate Payslip
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payslips</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{payslips.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600 dark:text-green-400 font-medium">All records</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Payout</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalPayout.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Total disbursed</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">This Month</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{currentMonthPayslips.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <Calendar className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">Current period</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-slate-700">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Employees</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{employees.length}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <Users className="w-4 h-4 text-orange-500" />
            <span className="text-sm text-gray-600 dark:text-gray-400">On payroll</span>
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
          <div className="flex-1 flex flex-wrap gap-3">
            <select
              value={filterEmployee}
              onChange={(e) => setFilterEmployee(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.id}>{emp.name}</option>
              ))}
            </select>

            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-gray-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Months</option>
              <option value="January">January</option>
              <option value="February">February</option>
              <option value="March">March</option>
              <option value="April">April</option>
              <option value="May">May</option>
              <option value="June">June</option>
              <option value="July">July</option>
              <option value="August">August</option>
              <option value="September">September</option>
              <option value="October">October</option>
              <option value="November">November</option>
              <option value="December">December</option>
            </select>
          </div>
        </div>
      </div>

      {/* Old Stats - Hidden */}
      <div className="hidden grid-cols-1 md:grid-cols-4 gap-3">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-4 shadow-sm text-white">
          <p className="text-xs opacity-90">Total Payslips</p>
          <p className="text-2xl font-bold mt-1">{payslips.length}</p>
        </div>
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-4 shadow-sm text-white">
          <p className="text-xs opacity-90">This Month</p>
          <p className="text-2xl font-bold mt-1">{currentMonthPayslips.length}</p>
        </div>
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-4 shadow-sm text-white">
          <p className="text-xs opacity-90">Total Payout (Filtered)</p>
          <p className="text-2xl font-bold mt-1">₹{totalPayout.toLocaleString("en-IN")}</p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-4 shadow-sm text-white">
          <p className="text-xs opacity-90">Employees</p>
          <p className="text-2xl font-bold mt-1">{employees.length}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-slate-800 rounded-lg p-3 shadow-sm flex flex-wrap gap-3">
        <select
          value={filterEmployee}
          onChange={(e) => setFilterEmployee(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="all">All Employees</option>
          {employees.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.name}
            </option>
          ))}
        </select>

        <select
          value={filterMonth}
          onChange={(e) => setFilterMonth(e.target.value)}
          className="px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
        >
          <option value="all">All Months</option>
          {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
            <option key={month} value={month}>
              {month}
            </option>
          ))}
        </select>
      </div>

      {/* Payslips Table */}
      {filteredPayslips.length === 0 ? (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm p-8 text-center">
          <p className="text-slate-500 dark:text-slate-400 text-sm">No payslips found. Generate your first payslip!</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 dark:bg-slate-900">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Employee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Month</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Basic Salary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Allowances</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Deductions</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Net Salary</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-slate-700 dark:text-slate-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {filteredPayslips.map((payslip) => (
                  <tr key={payslip.id} className="hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      <div>
                        <p className="font-medium">{payslip.employee?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{payslip.employee?.role}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      {payslip.month} {payslip.year}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900 dark:text-white">
                      ₹{payslip.basic_salary.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-green-600 dark:text-green-400">
                      +₹{payslip.allowances.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm text-red-600 dark:text-red-400">
                      -₹{payslip.deductions.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm font-bold text-slate-900 dark:text-white">
                      ₹{payslip.net_salary.toLocaleString("en-IN")}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {payslip.payment_date ? (
                        <span className="px-2 py-1 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs font-medium">
                          Paid
                        </span>
                      ) : (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300 rounded text-xs font-medium">
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <button
                        onClick={() => setSelectedPayslip(payslip)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Create Payslip Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Generate Payslip</h2>
            </div>

            <form onSubmit={handleCreatePayslip} className="p-4 space-y-3">
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Month *</label>
                  <select
                    required
                    value={formData.month}
                    onChange={(e) => setFormData({ ...formData, month: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  >
                    <option value="">Select Month</option>
                    {["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"].map((month) => (
                      <option key={month} value={month}>
                        {month}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Year *</label>
                  <input
                    type="number"
                    required
                    value={formData.year}
                    onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Basic Salary (₹) *</label>
                <input
                  type="number"
                  required
                  step="0.01"
                  value={formData.basic_salary}
                  onChange={(e) => setFormData({ ...formData, basic_salary: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Allowances (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.allowances}
                  onChange={(e) => setFormData({ ...formData, allowances: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Deductions (₹)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.deductions}
                  onChange={(e) => setFormData({ ...formData, deductions: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3">
                <p className="text-xs text-slate-500 dark:text-slate-400">Net Salary</p>
                <p className="text-xl font-bold text-slate-900 dark:text-white">
                  ₹{parseFloat(formData.net_salary || "0").toLocaleString("en-IN")}
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                >
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="check">Check</option>
                  <option value="cash">Cash</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Payment Date</label>
                <input
                  type="date"
                  value={formData.payment_date}
                  onChange={(e) => setFormData({ ...formData, payment_date: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">Remarks</label>
                <textarea
                  value={formData.remarks}
                  onChange={(e) => setFormData({ ...formData, remarks: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Generate Payslip
                </button>
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payslip Details Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b border-slate-200 dark:border-slate-700">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Payslip Details</h2>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg p-4 text-white">
                <p className="text-xs opacity-90">{selectedPayslip.employee?.name}</p>
                <p className="text-2xl font-bold mt-1">₹{selectedPayslip.net_salary.toLocaleString("en-IN")}</p>
                <p className="text-xs opacity-90 mt-1">{selectedPayslip.month} {selectedPayslip.year}</p>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Basic Salary:</span>
                  <span className="font-medium text-slate-900 dark:text-white">₹{selectedPayslip.basic_salary.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Allowances:</span>
                  <span className="font-medium text-green-600 dark:text-green-400">+₹{selectedPayslip.allowances.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Deductions:</span>
                  <span className="font-medium text-red-600 dark:text-red-400">-₹{selectedPayslip.deductions.toLocaleString("en-IN")}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between">
                  <span className="text-slate-700 dark:text-slate-300 font-semibold">Net Salary:</span>
                  <span className="font-bold text-slate-900 dark:text-white">₹{selectedPayslip.net_salary.toLocaleString("en-IN")}</span>
                </div>
              </div>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-3 space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Payment Method:</span>
                  <span className="text-slate-900 dark:text-white font-medium capitalize">{selectedPayslip.payment_method.replace("_", " ")}</span>
                </div>
                {selectedPayslip.payment_date && (
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-slate-400">Payment Date:</span>
                    <span className="text-slate-900 dark:text-white font-medium">{new Date(selectedPayslip.payment_date).toLocaleDateString()}</span>
                  </div>
                )}
                {selectedPayslip.remarks && (
                  <div>
                    <span className="text-slate-500 dark:text-slate-400">Remarks:</span>
                    <p className="text-slate-900 dark:text-white mt-1">{selectedPayslip.remarks}</p>
                  </div>
                )}
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setSelectedPayslip(null)}
                className="w-full bg-slate-200 hover:bg-slate-300 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-medium transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
