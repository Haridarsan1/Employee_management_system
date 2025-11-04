import type React from "react"
import { useState } from "react"
import { X, Mail, User, Briefcase, Building2, DollarSign, Copy, Check } from "lucide-react"
import { inviteEmployee } from "@/services/employee-invitation"
import { toast } from "sonner"

interface InviteEmployeeModalProps {
  onClose: () => void
  onSuccess: () => void
}

export default function InviteEmployeeModal({ onClose, onSuccess }: InviteEmployeeModalProps) {
  const [formData, setFormData] = useState({
    email: "",
    fullName: "",
    position: "",
    department: "",
    salary: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [inviteResult, setInviteResult] = useState<{
    email: string
    temporaryPassword: string
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const result = await inviteEmployee(
        formData.email,
        formData.fullName,
        formData.position,
        formData.department,
        formData.salary ? parseFloat(formData.salary) : undefined
      )

      setInviteResult({
        email: result.email,
        temporaryPassword: result.temporaryPassword,
      })

      toast.success("Employee invited successfully!")
    } catch (error: any) {
      toast.error(error.message || "Failed to invite employee")
    } finally {
      setIsLoading(false)
    }
  }

  const copyToClipboard = () => {
    if (inviteResult) {
      const text = `Email: ${inviteResult.email}\nTemporary Password: ${inviteResult.temporaryPassword}`
      navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success("Credentials copied to clipboard!")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleClose = () => {
    if (inviteResult) {
      onSuccess()
    }
    onClose()
  }

  // Success view after invite
  if (inviteResult) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Employee Invited!</h2>
              <button
                onClick={handleClose}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-green-600 dark:text-green-400" />
              </div>
              <p className="text-center text-slate-600 dark:text-slate-400 mb-6">
                The employee account has been created. Share these credentials with the employee.
              </p>

              <div className="bg-slate-50 dark:bg-slate-900 rounded-lg p-4 space-y-3">
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Email</label>
                  <p className="text-sm font-mono text-slate-900 dark:text-white break-all">{inviteResult.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-slate-500 dark:text-slate-400">Temporary Password</label>
                  <p className="text-sm font-mono text-slate-900 dark:text-white break-all">
                    {inviteResult.temporaryPassword}
                  </p>
                </div>
              </div>

              <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-xs text-yellow-800 dark:text-yellow-200">
                  ⚠️ <strong>Important:</strong> The employee will be required to change this password on their first
                  login.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={copyToClipboard}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition flex items-center justify-center gap-2"
              >
                {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
                {copied ? "Copied!" : "Copy Credentials"}
              </button>
              <button
                onClick={handleClose}
                className="flex-1 bg-slate-600 hover:bg-slate-700 text-white font-semibold py-2 rounded-lg transition"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Invite form
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invite Employee</h2>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              disabled={isLoading}
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          <p className="text-sm text-slate-600 dark:text-slate-400 mb-6">
            Create a new employee account. They will receive temporary credentials and must change their password on
            first login.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="employee@company.com"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="John Doe"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Position <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Briefcase className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Software Engineer"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Department <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Engineering"
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Salary (Optional)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="number"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                  className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="50000"
                  min="0"
                  step="0.01"
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? "Inviting..." : "Send Invitation"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
