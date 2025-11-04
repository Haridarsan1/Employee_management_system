import type React from "react"
import { useState } from "react"
import { X, Lock, Eye, EyeOff, CheckCircle, AlertCircle } from "lucide-react"
import { changeEmployeePassword } from "@/services/employee-invitation"
import { toast } from "sonner"

interface ChangePasswordModalProps {
  employeeEmail: string
  isFirstLogin: boolean
  onSuccess: () => void
}

export default function ChangePasswordModal({
  employeeEmail,
  isFirstLogin,
  onSuccess,
}: ChangePasswordModalProps) {
  const [formData, setFormData] = useState({
    newPassword: "",
    confirmPassword: "",
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validatePassword = (password: string) => {
    const errors: string[] = []
    if (password.length < 8) errors.push("at least 8 characters")
    if (!/[A-Z]/.test(password)) errors.push("one uppercase letter")
    if (!/[a-z]/.test(password)) errors.push("one lowercase letter")
    if (!/[0-9]/.test(password)) errors.push("one number")
    if (!/[!@#$%^&*]/.test(password)) errors.push("one special character (!@#$%^&*)")
    return errors
  }

  const passwordErrors = formData.newPassword ? validatePassword(formData.newPassword) : []
  const passwordStrength =
    formData.newPassword.length >= 8 && passwordErrors.length === 0
      ? "strong"
      : formData.newPassword.length >= 6
        ? "medium"
        : "weak"

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors: Record<string, string> = {}

    if (passwordErrors.length > 0) {
      newErrors.newPassword = `Password must contain ${passwordErrors.join(", ")}`
    }

    if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)
    try {
      await changeEmployeePassword(formData.newPassword, employeeEmail)
      toast.success("Password changed successfully!")
      onSuccess()
    } catch (error: any) {
      toast.error(error.message || "Failed to change password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {isFirstLogin ? "Set Your Password" : "Change Password"}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                {isFirstLogin
                  ? "Please set a new secure password for your account"
                  : "Update your password to keep your account secure"}
              </p>
            </div>
            {!isFirstLogin && (
              <button
                onClick={() => !isLoading && onSuccess()}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                disabled={isLoading}
              >
                <X className="w-6 h-6" />
              </button>
            )}
          </div>

          {isFirstLogin && (
            <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-200">
                    Security Requirement
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                    For security reasons, you must change your temporary password before accessing your dashboard.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* New Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={formData.newPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, newPassword: e.target.value })
                    setErrors({ ...errors, newPassword: "" })
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.newPassword ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                  }`}
                  placeholder="Enter new password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>

              {/* Password strength indicator */}
              {formData.newPassword && (
                <div className="mt-2">
                  <div className="flex gap-1 mb-2">
                    <div
                      className={`h-1 flex-1 rounded ${
                        formData.newPassword.length > 0
                          ? passwordStrength === "weak"
                            ? "bg-red-500"
                            : passwordStrength === "medium"
                              ? "bg-yellow-500"
                              : "bg-green-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${
                        passwordStrength === "medium" || passwordStrength === "strong"
                          ? passwordStrength === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                          : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                    <div
                      className={`h-1 flex-1 rounded ${
                        passwordStrength === "strong" ? "bg-green-500" : "bg-slate-200 dark:bg-slate-700"
                      }`}
                    />
                  </div>
                  <p
                    className={`text-xs ${
                      passwordStrength === "weak"
                        ? "text-red-600 dark:text-red-400"
                        : passwordStrength === "medium"
                          ? "text-yellow-600 dark:text-yellow-400"
                          : "text-green-600 dark:text-green-400"
                    }`}
                  >
                    Password strength: {passwordStrength}
                  </p>
                </div>
              )}

              {/* Password requirements */}
              <div className="mt-3 space-y-1">
                {[
                  { label: "At least 8 characters", test: formData.newPassword.length >= 8 },
                  { label: "One uppercase letter", test: /[A-Z]/.test(formData.newPassword) },
                  { label: "One lowercase letter", test: /[a-z]/.test(formData.newPassword) },
                  { label: "One number", test: /[0-9]/.test(formData.newPassword) },
                  { label: "One special character (!@#$%^&*)", test: /[!@#$%^&*]/.test(formData.newPassword) },
                ].map((req, index) => (
                  <div key={index} className="flex items-center gap-2">
                    {req.test ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <div className="w-4 h-4 border-2 border-slate-300 dark:border-slate-600 rounded-full" />
                    )}
                    <span
                      className={`text-xs ${req.test ? "text-green-600 dark:text-green-400" : "text-slate-500 dark:text-slate-400"}`}
                    >
                      {req.label}
                    </span>
                  </div>
                ))}
              </div>

              {errors.newPassword && <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.newPassword}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) => {
                    setFormData({ ...formData, confirmPassword: e.target.value })
                    setErrors({ ...errors, confirmPassword: "" })
                  }}
                  className={`w-full pl-10 pr-10 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.confirmPassword ? "border-red-500" : "border-slate-300 dark:border-slate-600"
                  }`}
                  placeholder="Confirm new password"
                  required
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5 text-slate-400" />
                  ) : (
                    <Eye className="w-5 h-5 text-slate-400" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-sm text-red-600 dark:text-red-400 mt-2">{errors.confirmPassword}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || passwordErrors.length > 0}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 animate-spin">
                    <svg fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </div>
                  Updating...
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5" />
                  {isFirstLogin ? "Set Password & Continue" : "Update Password"}
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
