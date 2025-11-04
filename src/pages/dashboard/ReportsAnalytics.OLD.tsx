"use client"

import { useState } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
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

const performanceData = [
  { week: "Week 1", commits: 45, prs: 8, issues: 12, avgReviewTime: 4.2 },
  { week: "Week 2", commits: 52, prs: 10, issues: 15, avgReviewTime: 3.8 },
  { week: "Week 3", commits: 48, prs: 9, issues: 10, avgReviewTime: 4.5 },
  { week: "Week 4", commits: 61, prs: 12, issues: 18, avgReviewTime: 3.2 },
]

const employeePerformance = [
  { name: "John Smith", commits: 156, prs: 28, score: 92 },
  { name: "Jane Doe", commits: 142, prs: 25, score: 88 },
  { name: "Bob Johnson", commits: 98, prs: 18, score: 76 },
]

const skillData = [
  { name: "React", value: 35 },
  { name: "Node.js", value: 25 },
  { name: "Python", value: 20 },
  { name: "Other", value: 20 },
]

const teamVelocity = [
  { sprint: "Sprint 1", velocity: 45, target: 50 },
  { sprint: "Sprint 2", velocity: 52, target: 50 },
  { sprint: "Sprint 3", velocity: 48, target: 50 },
  { sprint: "Sprint 4", velocity: 61, target: 55 },
]

const auditLogs = [
  {
    id: "1",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: "admin@example.com",
    action: "Added employee",
    resource: "employees",
    status: "success" as const,
    details: "Added John Smith with role Senior Full Stack Dev",
  },
  {
    id: "2",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    user: "admin@example.com",
    action: "Deleted task",
    resource: "tasks",
    status: "success" as const,
    details: "Deleted task #234: Implement feature X",
  },
  {
    id: "3",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    user: "manager@example.com",
    action: "Exported report",
    resource: "reports",
    status: "success" as const,
    details: "Exported performance report as PDF",
  },
  {
    id: "4",
    timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    user: "admin@example.com",
    action: "Failed login attempt",
    resource: "auth",
    status: "failed" as const,
    details: "Invalid credentials from IP 192.168.1.1",
  },
]

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

const SAMPLE_REPORTS = [
  { title: "Active Employees", value: "142", change: "+12%" },
  { title: "Task Completion", value: "87.5%", change: "+5.2%" },
  { title: "GitHub Commits", value: "1,247", change: "+18%" },
  { title: "Avg Response Time", value: "3.2h", change: "-15%" },
]

export default function ReportsAnalytics() {
  const [showReportBuilder, setShowReportBuilder] = useState(false)
  const [activeTab, setActiveTab] = useState<"performance" | "team" | "audit">("performance")

  const handleExportPDF = () => {
    try {
      // Create a simple HTML content for PDF
      const reportContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Performance Report - ${new Date().toLocaleDateString()}</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 40px; }
            h1 { color: #1e40af; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 12px; text-align: left; }
            th { background-color: #3b82f6; color: white; }
            .metric { margin: 20px 0; padding: 15px; background: #f1f5f9; border-radius: 8px; }
          </style>
        </head>
        <body>
          <h1>Performance Report</h1>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          
          <div class="metric">
            <h3>Key Metrics</h3>
            <p><strong>Total Employees:</strong> ${SAMPLE_REPORTS.find((r) => r.title === "Active Employees")?.value || "N/A"}</p>
            <p><strong>Completion Rate:</strong> ${SAMPLE_REPORTS.find((r) => r.title === "Task Completion")?.value || "N/A"}</p>
            <p><strong>GitHub Commits:</strong> ${SAMPLE_REPORTS.find((r) => r.title === "GitHub Commits")?.value || "N/A"}</p>
          </div>
          
          <table>
            <thead>
              <tr>
                <th>Metric</th>
                <th>Value</th>
                <th>Change</th>
              </tr>
            </thead>
            <tbody>
              ${SAMPLE_REPORTS.map(
                (report) => `
                <tr>
                  <td>${report.title}</td>
                  <td>${report.value}</td>
                  <td>${report.change}</td>
                </tr>
              `,
              ).join("")}
            </tbody>
          </table>
        </body>
        </html>
      `

      // Create blob and download
      const blob = new Blob([reportContent], { type: "text/html" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `performance-report-${new Date().toISOString().split("T")[0]}.html`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("Report downloaded successfully! Open the HTML file in your browser.")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export report")
    }
  }

  const handleExportExcel = () => {
    try {
      // Create CSV content
      const csvContent = [
        ["Metric", "Value", "Change"],
        ...SAMPLE_REPORTS.map((report) => [report.title, report.value, report.change]),
      ]
        .map((row) => row.join(","))
        .join("\n")

      // Create blob and download
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.href = url
      link.download = `performance-report-${new Date().toISOString().split("T")[0]}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast.success("CSV file downloaded successfully!")
    } catch (error) {
      console.error("Export error:", error)
      toast.error("Failed to export CSV")
    }
  }

  const handleReportGenerated = (config: any) => {
    toast.success(`Custom report "${config.name}" generated successfully`)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reports & Analytics</h1>
          <p className="text-slate-600 dark:text-slate-400">Performance metrics, team analytics, and audit logs</p>
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
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Avg Commits/Week</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">51.5</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Avg Review Time</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">3.9h</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">PR Merge Rate</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">94%</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Issue Resolution</h3>
              <p className="text-2xl font-bold text-slate-900 dark:text-white mt-2">88%</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Weekly Activity</h2>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={performanceData}>
                  <defs>
                    <linearGradient id="colorCommits" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="week" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Area type="monotone" dataKey="commits" stroke="#3b82f6" fillOpacity={1} fill="url(#colorCommits)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tech Stack Distribution</h2>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={skillData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={{ fill: "#0f172a" }}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {skillData.map((_entry, index) => (
                      <Cell key={`cell-${index}`} fill={colors[index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Employee Performance</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={employeePerformance}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Bar dataKey="commits" fill="#3b82f6" />
                <Bar dataKey="prs" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {activeTab === "team" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Team Velocity</h2>
            <ResponsiveContainer width="100%" height={350}>
              <LineChart data={teamVelocity}>
                <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                <XAxis dataKey="sprint" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="velocity" stroke="#3b82f6" strokeWidth={2} name="Actual Velocity" />
                <Line
                  type="monotone"
                  dataKey="target"
                  stroke="#94a3b8"
                  strokeWidth={2}
                  strokeDasharray="5 5"
                  name="Target Velocity"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Top Contributors</h2>
              <div className="space-y-3">
                {employeePerformance.map((emp, idx) => (
                  <div key={emp.name} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900 dark:text-white">
                        #{idx + 1} {emp.name}
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-400">
                        {emp.commits} commits • {emp.prs} PRs
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                        {emp.score}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Quick Stats</h2>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Total Team Members</span>
                  <span className="font-semibold text-slate-900 dark:text-white">12</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Active Repos</span>
                  <span className="font-semibold text-slate-900 dark:text-white">5</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Open Issues</span>
                  <span className="font-semibold text-slate-900 dark:text-white">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Avg Dev Cycle</span>
                  <span className="font-semibold text-slate-900 dark:text-white">4.2 days</span>
                </div>
              </div>
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
          className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          📄 Export PDF
        </button>
        <button
          onClick={handleExportExcel}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          📊 Export Excel
        </button>
        <button
          onClick={() => setShowReportBuilder(true)}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-medium transition"
        >
          ⚙️ Schedule Report
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
