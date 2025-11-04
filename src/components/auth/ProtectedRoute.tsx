import type React from "react"
import { Navigate } from "react-router-dom"
import { useAuthStore } from "@/services/auth"

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: "admin" | "employee"
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, userRole } = useAuthStore()

  // Show loading while auth is loading OR role is being fetched
  if (isLoading || (isAuthenticated && userRole === null)) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin mx-auto mb-4">
            <svg className="w-12 h-12 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Check role-based access (only after role is loaded and not null)
  if (requiredRole && userRole && userRole !== requiredRole) {
    // Redirect to appropriate dashboard based on user's actual role
    if (userRole === "admin") {
      return <Navigate to="/dashboard" replace />
    } else if (userRole === "employee") {
      return <Navigate to="/employee" replace />
    }
  }

  return <>{children}</>
}
