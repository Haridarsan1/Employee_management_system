"use client"

import type React from "react"
import { useState } from "react"
import { supabase } from "@/services/supabase"
import { toast } from "sonner"

interface CSVImportModalProps {
  isOpen: boolean
  onClose: () => void
  onImportComplete: () => void
}

interface EmployeeRow {
  name: string
  email: string
  github_username?: string
  role: string
  skills?: string
  hire_date?: string
}

export default function CSVImportModal({ isOpen, onClose, onImportComplete }: CSVImportModalProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const parseCSV = (text: string): EmployeeRow[] => {
    const lines = text.trim().split("\n")
    if (lines.length < 2) throw new Error("CSV file must have headers and at least one row")

    const headers = lines[0].split(",").map((h) => h.trim().toLowerCase())
    const rows: EmployeeRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim())
      const row: EmployeeRow = {
        name: values[headers.indexOf("name")] || "",
        email: values[headers.indexOf("email")] || "",
        role: values[headers.indexOf("role")] || "Mid Full Stack Dev",
      }

      if (headers.includes("github_username")) {
        row.github_username = values[headers.indexOf("github_username")]
      }
      if (headers.includes("skills")) {
        row.skills = values[headers.indexOf("skills")]
      }
      if (headers.includes("hire_date")) {
        row.hire_date = values[headers.indexOf("hire_date")]
      }

      if (row.name && row.email) {
        rows.push(row)
      }
    }

    return rows
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setFileError(null)
    setIsLoading(true)

    try {
      const text = await file.text()
      const employees = parseCSV(text)

      if (employees.length === 0) {
        throw new Error("No valid employees found in CSV")
      }

      const formattedEmployees = employees.map((emp) => ({
        name: emp.name,
        email: emp.email,
        github_username: emp.github_username || null,
        role: emp.role,
        skills: emp.skills ? emp.skills.split(";").map((s) => s.trim()) : [],
        hire_date: emp.hire_date || new Date().toISOString(),
        status: "active",
      }))

      const { error } = await supabase.from("employees").insert(formattedEmployees)

      if (error) throw error

      toast.success(`Successfully imported ${employees.length} employees`)
      onImportComplete()
      onClose()
    } catch (err: any) {
      setFileError(err.message || "Failed to import CSV")
      toast.error(err.message || "Failed to import CSV")
    } finally {
      setIsLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-md w-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white">Import Employees from CSV</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-slate-400">
            Upload a CSV file with the following columns: name, email, role, github_username (optional), skills
            (optional, semicolon-separated), hire_date (optional)
          </p>

          <div className="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-8 text-center">
            <label className="cursor-pointer">
              <input type="file" accept=".csv" onChange={handleFileUpload} disabled={isLoading} className="hidden" />
              <div className="text-4xl mb-2">📁</div>
              <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Click to upload CSV file</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">or drag and drop</p>
            </label>
          </div>

          {fileError && (
            <div className="p-3 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded text-sm">
              {fileError}
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
              disabled={isLoading}
            >
              Cancel
            </button>
            <a
              href="/sample-employees.csv"
              className="flex-1 px-4 py-2 bg-slate-600 hover:bg-slate-700 text-white rounded-lg font-medium transition text-center text-sm"
              download
            >
              Download Sample
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
