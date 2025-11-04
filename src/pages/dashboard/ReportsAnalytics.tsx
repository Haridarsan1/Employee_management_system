"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import ReportBuilder from "@/components/reports/ReportBuilder"
import AuditLog from "@/components/reports/AuditLog"
import { toast } from "sonner"
import { supabase } from "@/services/supabase"
import {
  getAllEmployeesGitHubStats,
  getWeeklyActivityData,
  getSkillDistribution,
  type EmployeeWithGitHubStats,
  type WeeklyActivity,
} from "@/services/github-stats"
import LoadingSpinner from "@/components/common/LoadingSpinner"

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

const auditLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: "admin@example.com",
    action: "Added employee",
    resource: "employees",
    status: "success" as const,
    details: "Added employee with GitHub integration",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: "admin@example.com",
    action: "Exported report",
    resource: "reports",
    status: "success" as const,
    details: "Exported performance report as HTML",
  },
]

export default function ReportsAnalytics() {
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [activeTab, setActiveTab] = useState<"performance" | "team" | "audit">("performance")
  const [isLoading, setIsLoading] = useState(true)
  
  // Real data states
  const [employeeStats, setEmployeeStats] = useState<EmployeeWithGitHubStats[]>([])
  const [weeklyData, setWeeklyData] = useState<WeeklyActivity[]>([])
  const [skillData, setSkillData] = useState<{ name: string; value: number }[]>([])
  const [totalEmployees, setTotalEmployees] = useState(0)
  const [totalRepos, setTotalRepos] = useState(0)

  useEffect(() => {
    loadRealData()
  }, [])

  const loadRealData = async () => {
    try {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load all real data from GitHub and Supabase
      const [employees, weekly, skills] = await Promise.all([
        getAllEmployeesGitHubStats(user.id),
        getWeeklyActivityData(user.id),
        getSkillDistribution(user.id),
      ])

      setEmployeeStats(employees)
      setWeeklyData(weekly)
      setSkillData(skills)
      setTotalEmployees(employees.length)
      
      // Calculate total unique repos
      const allRepos = new Set<string>()
      employees.forEach((emp) => {
        emp.github_repos.forEach((repo) => allRepos.add(repo))
      })
      setTotalRepos(allRepos.size)
      
      console.log("Real data loaded:", { employees: employees.length, repos: allRepos.size })
    } catch (error) {
      console.error("Error loading real data:", error)
      toast.error("Failed to load GitHub data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleExportPDF = () => {
    try {
      const avgCommits = employeeStats.length > 0
        ? Math.round(employeeStats.reduce((sum, e) => sum + e.commits, 0) / employeeStats.length)
        : 0
      const totalCommits = employeeStats.reduce((sum, e) => sum + e.commits, 0)
      const totalPRs = employeeStats.reduce((sum, e) => sum + e.prs, 0)

      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Performance Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: 'Inter', -apple-system, sans-serif; padding: 40px; background: #f8fafc; }
            .container { max-width: 1000px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #1e40af; margin-bottom: 8px; }
            .subtitle { color: #64748b; margin-bottom: 32px; }
            table { width: 100%; border-collapse: collapse; margin-top: 24px; }
            th, td { border: 1px solid #e2e8f0; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; font-weight: 600; }
            tr:nth-child(even) { background-color: #f8fafc; }
            .metric { margin: 20px 0; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 8px; }
            .metric-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 24px 0; }
            .metric-card { padding: 16px; background: #f1f5f9; border-radius: 8px; border-left: 4px solid #3b82f6; }
            .metric-card h3 { margin: 0 0 8px 0; color: #64748b; font-size: 14px; }
            .metric-card .value { font-size: 32px; font-weight: bold; color: #1e293b; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Performance Report</h1>
            <p class="subtitle">Generated on: ${new Date().toLocaleString()}</p>
            
            <div class="metric-grid">
              <div class="metric-card">
                <h3>Total Employees</h3>
                <div class="value">${totalEmployees}</div>
              </div>
              <div class="metric-card">
                <h3>Total Commits</h3>
                <div class="value">${totalCommits}</div>
              </div>
              <div class="metric-card">
                <h3>Total Pull Requests</h3>
                <div class="value">${totalPRs}</div>
              </div>
            </div>
            
            <div class="metric">
              <h2 style="margin:0 0 16px 0;">Key Metrics Summary</h2>
              <p><strong>Active Repositories:</strong> ${totalRepos}</p>
              <p><strong>Average Commits per Employee:</strong> ${avgCommits}</p>
              <p><strong>Average PRs per Employee:</strong> ${employeeStats.length > 0 ? Math.round(totalPRs / employeeStats.length) : 0}</p>
            </div>
            
            <h2>Top Performers</h2>
            <table>
              <thead>
                <tr>
                  <th>Employee</th>
                  <th>Role</th>
                  <th>Commits</th>
                  <th>Pull Requests</th>
                  <th>Issues</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                ${employeeStats
                  .sort((a, b) => b.score - a.score)
                  .slice(0, 10)
                  .map(
                    (emp) => `
                  <tr>
                    <td>${emp.name}</td>
                    <td>${emp.role}</td>
                    <td>${emp.commits}</td>
                    <td>${emp.prs}</td>
                    <td>${emp.issues}</td>
                    <td><strong>${emp.score}</strong></td>
                  </tr>
                `,
                  )
                  .join("")}
              </tbody>
            </table>
          </div>
        </body>
        </html>
      `

      const blob = new Blob([reportContent], { type: "text/html" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Performance-Report-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Report exported as HTML successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export report")
    }
  }

  const handleExportExcel = () => {
    try {
      let csv = "Employee,Role,Email,Commits,Pull Requests,Issues,Repositories,Score\n"

      employeeStats.forEach((emp) => {
        csv += `"${emp.name}","${emp.role}","${emp.email}",${emp.commits},${emp.prs},${emp.issues},"${emp.github_repos.join("; ")}",${emp.score}\n`
      })

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `Employee-GitHub-Stats-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast.success("Data exported as CSV successfully")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export CSV")
    }
  }

  const handleReportGenerated = (config: any) => {
    toast.success(`Custom report "${config.name}" generated successfully`)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading GitHub data..." />
      </div>
    )
  }

  // Calculate metrics
  const totalCommits = employeeStats.reduce((sum, e) => sum + e.commits, 0)
  const totalPRs = employeeStats.reduce((sum, e) => sum + e.prs, 0)
  const totalIssues = employeeStats.reduce((sum, e) => sum + e.issues, 0)
  const avgCommits = employeeStats.length > 0 ? (totalCommits / employeeStats.length).toFixed(1) : "0"
  const avgPRs = employeeStats.length > 0 ? (totalPRs / employeeStats.length).toFixed(1) : "0"

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Real-time GitHub performance metrics and team analytics</p>
        </div>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition"
        >
          + Build Report
        </button>
      </div>

      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-700">
        <button
          onClick={() => setActiveTab("performance")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "performance"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Performance
        </button>
        <button
          onClick={() => setActiveTab("team")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "team"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Team
        </button>
        <button
          onClick={() => setActiveTab("audit")}
          className={`px-4 py-2 font-medium border-b-2 transition ${
            activeTab === "audit"
              ? "border-blue-600 text-blue-600"
              : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          Audit Logs
        </button>
      </div>

      {activeTab === "performance" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 shadow text-white">
              <h3 className="text-blue-100 text-sm font-medium">Total Commits</h3>
              <p className="text-3xl font-bold mt-2">{totalCommits}</p>
              <p className="text-blue-100 text-xs mt-1">Across all repos</p>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 shadow text-white">
              <h3 className="text-green-100 text-sm font-medium">Pull Requests</h3>
              <p className="text-3xl font-bold mt-2">{totalPRs}</p>
              <p className="text-green-100 text-xs mt-1">Avg: {avgPRs} per employee</p>
            </div>
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 shadow text-white">
              <h3 className="text-purple-100 text-sm font-medium">Issues</h3>
              <p className="text-3xl font-bold mt-2">{totalIssues}</p>
              <p className="text-purple-100 text-xs mt-1">Reported & resolved</p>
            </div>
            <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-lg p-6 shadow text-white">
              <h3 className="text-orange-100 text-sm font-medium">Repositories</h3>
              <p className="text-3xl font-bold mt-2">{totalRepos}</p>
              <p className="text-orange-100 text-xs mt-1">Active projects</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Activity</h2>
              {weeklyData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={weeklyData}>
                    <defs>
                      <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="week" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="commits"
                      stroke="#3b82f6"
                      fillOpacity={1}
                      fill="url(#colorCommits)"
                      name="Commits"
                    />
                    <Area type="monotone" dataKey="prs" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="PRs" />
                    <Area
                      type="monotone"
                      dataKey="issues"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.3}
                      name="Issues"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-8">No activity data available</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Employee Performance</h2>
              {employeeStats.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={employeeStats.slice(0, 8)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#64748b" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#1e293b",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                      }}
                    />
                    <Legend />
                    <Bar dataKey="commits" fill="#3b82f6" name="Commits" />
                    <Bar dataKey="prs" fill="#10b981" name="PRs" />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-8">No employee data available</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skill Distribution</h2>
              {skillData.length > 0 ? (
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={skillData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {skillData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-center text-slate-500 py-8">No skill data available</p>
              )}
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Contributors</h2>
              {employeeStats.length > 0 ? (
                <div className="space-y-3">
                  {employeeStats
                    .sort((a, b) => b.score - a.score)
                    .slice(0, 5)
                    .map((emp, idx) => (
                      <div key={emp.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-700 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            #{idx + 1}
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{emp.name}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400">
                              {emp.commits} commits • {emp.prs} PRs • {emp.issues} issues
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{emp.score}</div>
                          <p className="text-xs text-slate-500">score</p>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <p className="text-center text-slate-500 py-8">No contributors data available</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Team Members</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalEmployees}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Active Repos</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{totalRepos}</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Avg Commits/Employee</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{avgCommits}</p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">All Team Members</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="border-b border-slate-200 dark:border-slate-700">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Name</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Role</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Repositories</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Commits</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">PRs</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Issues</th>
                    <th className="text-left py-3 px-4 font-semibold text-slate-900 dark:text-white">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {employeeStats.map((emp) => (
                    <tr key={emp.id} className="border-b border-slate-200 dark:border-slate-700">
                      <td className="py-3 px-4 text-slate-900 dark:text-white font-medium">{emp.name}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.role}</td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{emp.github_repos.length}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{emp.commits}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{emp.prs}</td>
                      <td className="py-3 px-4 text-slate-900 dark:text-white">{emp.issues}</td>
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-full text-xs font-semibold">
                          {emp.score}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === "audit" && (
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Audit Logs</h2>
          <AuditLog entries={auditLogs} />
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          onClick={handleExportPDF}
          className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
        >
          📄 Export HTML Report
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
        >
          📊 Export CSV Data
        </button>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-6 py-3 rounded-lg font-medium transition shadow-lg hover:shadow-xl"
        >
          ⚙️ Custom Report
        </button>
      </div>

      <ReportBuilder
        isOpen={showReportBuilder}
        onClose={() => setShowReportBuilder(false)}
        onGenerate={handleReportGenerated}
      />
    </div>
  )
}
