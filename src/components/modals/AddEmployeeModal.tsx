"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"

interface AddEmployeeModalProps {
  isOpen: boolean
  onClose: () => void
  onEmployeeAdded: () => void
}

const SKILLS = ["React", "Node.js", "TypeScript", "Python", "PostgreSQL", "Docker", "AWS", "Vue.js", "Django", "Java"]
const ROLES = ["Junior Full Stack Dev", "Mid Full Stack Dev", "Senior Full Stack Dev"]

export default function AddEmployeeModal({ isOpen, onClose, onEmployeeAdded }: AddEmployeeModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    github_username: "",
    github_repos: [] as string[],
    role: "Mid Full Stack Dev",
    skills: [] as string[],
    hire_date: new Date().toISOString().split("T")[0],
  })

  const [repoInput, setRepoInput] = useState("")

  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name) newErrors.name = "Name is required"
    if (!formData.email) newErrors.email = "Email is required"
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = "Invalid email"
    if (!formData.role) newErrors.role = "Role is required"

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      console.log("Adding employee with company_id:", user.id)
      console.log("Employee data:", {
        company_id: user.id,
        name: formData.name,
        email: formData.email,
        github_repos: formData.github_repos,
      })

      const { data: insertedData, error } = await supabase.from("employees").insert([
        {
          company_id: user.id,
          name: formData.name,
          email: formData.email,
          github_username: formData.github_username || null,
          github_repos: formData.github_repos.length > 0 ? formData.github_repos : null,
          role: formData.role,
          skills: formData.skills,
          hire_date: formData.hire_date,
          status: "active",
        },
      ]).select()

      if (error) {
        console.error("Insert error:", error)
        throw error
      }

      console.log("Employee inserted successfully:", insertedData)
      toast.success("Employee added successfully")
      onEmployeeAdded()
      onClose()
      setFormData({
        name: "",
        email: "",
        github_username: "",
        github_repos: [],
        role: "Mid Full Stack Dev",
        skills: [],
        hire_date: new Date().toISOString().split("T")[0],
      })
      setRepoInput("")
    } catch (err: any) {
      console.error("Error adding employee:", err)
      toast.error(err.message || "Failed to add employee")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Add New Employee</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.name ? "border-red-500" : "border-slate-300 dark:border-slate-600"
              }`}
              disabled={isLoading}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full px-3 py-2 border rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                errors.email ? "border-red-500" : "border-slate-300 dark:border-slate-600"
              }`}
              disabled={isLoading}
            />
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">GitHub Username</label>
            <input
              type="text"
              value={formData.github_username}
              onChange={(e) => setFormData({ ...formData, github_username: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="@username (optional)"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              GitHub Repositories
              <span className="text-xs text-slate-500 ml-2">(owner/repo format)</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    if (repoInput.trim() && repoInput.includes("/")) {
                      setFormData({
                        ...formData,
                        github_repos: [...formData.github_repos, repoInput.trim()],
                      })
                      setRepoInput("")
                    } else {
                      toast.error("Please enter in format: owner/repository")
                    }
                  }
                }}
                className="flex-1 px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., facebook/react"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => {
                  if (repoInput.trim() && repoInput.includes("/")) {
                    setFormData({
                      ...formData,
                      github_repos: [...formData.github_repos, repoInput.trim()],
                    })
                    setRepoInput("")
                  } else {
                    toast.error("Please enter in format: owner/repository")
                  }
                }}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition disabled:opacity-50"
                disabled={isLoading}
              >
                Add
              </button>
            </div>
            {formData.github_repos.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.github_repos.map((repo, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-1 px-3 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full text-sm"
                  >
                    <span>{repo}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          ...formData,
                          github_repos: formData.github_repos.filter((_, i) => i !== index),
                        })
                      }}
                      className="ml-1 text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-blue-100"
                      disabled={isLoading}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Role</label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Skills</label>
            <div className="grid grid-cols-2 gap-2">
              {SKILLS.map((skill) => (
                <label key={skill} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.skills.includes(skill)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData({ ...formData, skills: [...formData.skills, skill] })
                      } else {
                        setFormData({
                          ...formData,
                          skills: formData.skills.filter((s) => s !== skill),
                        })
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                    disabled={isLoading}
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300">{skill}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Hire Date</label>
            <input
              type="date"
              value={formData.hire_date}
              onChange={(e) => setFormData({ ...formData, hire_date: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading}
            >
              {isLoading ? "Adding..." : "Add Employee"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
