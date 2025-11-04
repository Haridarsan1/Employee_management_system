"use client"

import { Link, useLocation } from "react-router-dom"
import { 
  LayoutDashboard,
  Users, 
  CheckCircle2, 
  FolderKanban, 
  ListTodo, 
  Receipt, 
  CalendarCheck, 
  Github, 
  BarChart3, 
  Sparkles, 
  Settings,
  ChevronDown,
  LogOut,
  Building2
} from "lucide-react"
import { useState } from "react"

interface SidebarProps {
  open: boolean
}

const menuItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard", color: "bg-gradient-to-r from-blue-500 to-blue-600" },
  { name: "Employees", icon: Users, path: "/dashboard/employees", color: "bg-gradient-to-r from-green-500 to-green-600" },
  { name: "Approvals", icon: CheckCircle2, path: "/dashboard/approvals", badge: "3", color: "bg-gradient-to-r from-orange-500 to-orange-600" },
  { name: "Projects", icon: FolderKanban, path: "/dashboard/projects", color: "bg-gradient-to-r from-purple-500 to-purple-600" },
  { name: "Tasks", icon: ListTodo, path: "/dashboard/tasks", color: "bg-gradient-to-r from-pink-500 to-pink-600" },
  { name: "Payslips", icon: Receipt, path: "/dashboard/payslips", color: "bg-gradient-to-r from-cyan-500 to-cyan-600" },
  { name: "Attendance", icon: CalendarCheck, path: "/dashboard/attendance", color: "bg-gradient-to-r from-indigo-500 to-indigo-600" },
  { name: "GitHub", icon: Github, path: "/dashboard/github", color: "bg-gradient-to-r from-gray-700 to-gray-800" },
  { name: "Reports", icon: BarChart3, path: "/dashboard/reports", color: "bg-gradient-to-r from-emerald-500 to-emerald-600" },
  { name: "Advanced", icon: Sparkles, path: "/dashboard/advanced", color: "bg-gradient-to-r from-violet-500 to-violet-600" },
  { name: "Settings", icon: Settings, path: "/dashboard/settings", color: "bg-gradient-to-r from-slate-500 to-slate-600" },
]

export default function Sidebar({ open }: SidebarProps) {
  const location = useLocation()
  const [showUserMenu, setShowUserMenu] = useState(false)

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard" || location.pathname === "/dashboard/"
    }
    return location.pathname.startsWith(path)
  }

  return (
    <aside
      className={`bg-white dark:bg-slate-900 h-full transition-all duration-300 ease-in-out ${
        open ? "w-72" : "w-20"
      } flex flex-col border-r border-gray-200 dark:border-slate-800 shadow-xl`}
    >
      {/* Logo Section */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-slate-800 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center gap-3 w-full">
          <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          {open && (
            <div className="flex-1">
              <h1 className="text-base font-bold text-white">Admin Portal</h1>
              <p className="text-xs text-blue-100">Management System</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="space-y-2">
          {menuItems.map((item) => {
            const active = isActive(item.path)
            return (
              <li key={item.path}>
                <Link
                  to={item.path}
                  className={`group flex items-center gap-3 px-3 py-3 rounded-xl transition-all duration-200 relative ${
                    active
                      ? item.color + " text-white shadow-lg"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                  }`}
                  title={!open ? item.name : undefined}
                >
                  {/* Active Indicator */}
                  {active && open && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  
                  <item.icon className={`w-5 h-5 flex-shrink-0 ${active ? "scale-110" : ""} transition-transform`} />
                  
                  {open && (
                    <span className="text-sm font-medium flex-1">{item.name}</span>
                  )}
                  
                  {open && item.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-sm">
                      {item.badge}
                    </span>
                  )}
                  
                  {!open && item.badge && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs flex items-center justify-center rounded-full font-semibold shadow-lg">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* User Profile Section */}
      {open && (
        <div className="p-4 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all duration-200 group"
          >
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md ring-2 ring-white dark:ring-slate-900">
              <span className="text-white text-sm font-bold">AD</span>
            </div>
            <div className="flex-1 text-left">
              <p className="text-sm font-semibold text-gray-900 dark:text-white">Admin User</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Super Administrator</p>
            </div>
            <ChevronDown className={`w-4 h-4 text-gray-500 transition-transform ${showUserMenu ? "rotate-180" : ""}`} />
          </button>
          
          {showUserMenu && (
            <div className="mt-2 space-y-1">
              <Link
                to="/dashboard/settings"
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </Link>
              <button
                onClick={() => {/* Add logout logic */}}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Collapsed User Avatar */}
      {!open && (
        <div className="p-3 border-t border-gray-200 dark:border-slate-800">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-md cursor-pointer hover:scale-110 transition-transform mx-auto">
            <span className="text-white text-sm font-bold">AD</span>
          </div>
        </div>
      )}
    </aside>
  )
}
