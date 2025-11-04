"use client"

import { useState } from "react"
import { Routes, Route } from "react-router-dom"
import Sidebar from "@/components/layout/Sidebar"
import TopNav from "@/components/layout/TopNav"
import EmployeeDashboard from "@/pages/dashboard/EmployeeDashboard"
import Approvals from "@/pages/dashboard/Approvals"
import Projects from "@/pages/dashboard/Projects"
import Tasks from "@/pages/dashboard/Tasks"
import Payslips from "@/pages/dashboard/Payslips"
import Attendance from "@/pages/dashboard/Attendance"
import GitHubMonitoring from "@/pages/dashboard/GitHubMonitoring"
import ReportsAnalytics from "@/pages/dashboard/ReportsAnalytics"
import AdvancedFeatures from "@/pages/dashboard/AdvancedFeatures"
import Settings from "@/pages/dashboard/Settings"
import EmployeeGitHubDetail from "@/pages/dashboard/EmployeeGitHubDetail"

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar open={sidebarOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <TopNav onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />

        <main className="flex-1 overflow-auto">
          <div className="p-4 md:p-6">
            <Routes>
              <Route path="/" element={<EmployeeDashboard />} />
              <Route path="/employees" element={<EmployeeDashboard />} />
              <Route path="/employees/:employeeId/github" element={<EmployeeGitHubDetail />} />
              <Route path="/approvals" element={<Approvals />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/payslips" element={<Payslips />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/github" element={<GitHubMonitoring />} />
              <Route path="/reports" element={<ReportsAnalytics />} />
              <Route path="/advanced" element={<AdvancedFeatures />} />
              <Route path="/settings" element={<Settings />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}
