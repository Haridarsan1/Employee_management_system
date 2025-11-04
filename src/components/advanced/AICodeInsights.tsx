"use client"

import { useState } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CodeQuality {
  employee: string
  score: number
  duplicateCode: number
  vulnerabilities: number
  maintainability: number
}

const codeQualityData: CodeQuality[] = [
  { employee: "John Smith", score: 92, duplicateCode: 2, vulnerabilities: 0, maintainability: 95 },
  { employee: "Jane Doe", score: 88, duplicateCode: 5, vulnerabilities: 1, maintainability: 90 },
  { employee: "Bob Johnson", score: 76, duplicateCode: 8, vulnerabilities: 2, maintainability: 78 },
]

const securityTrendData = [
  { week: "Week 1", vulnerabilities: 5, resolved: 3, critical: 1 },
  { week: "Week 2", vulnerabilities: 3, resolved: 4, critical: 0 },
  { week: "Week 3", vulnerabilities: 4, resolved: 2, critical: 1 },
  { week: "Week 4", vulnerabilities: 2, resolved: 3, critical: 0 },
]

export default function AICodeInsights() {
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null)

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Code Quality Dashboard</h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {codeQualityData.map((emp) => (
            <div
              key={emp.employee}
              onClick={() => setSelectedEmployee(emp.employee)}
              className={`p-4 rounded-lg cursor-pointer transition ${
                selectedEmployee === emp.employee
                  ? "bg-blue-100 dark:bg-blue-900 border-2 border-blue-600"
                  : "bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:border-blue-400"
              }`}
            >
              <p className="font-medium text-slate-900 dark:text-white">{emp.employee}</p>
              <div className="mt-3 space-y-1 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Quality Score</span>
                  <span className="font-semibold text-slate-900 dark:text-white">{emp.score}/100</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full" style={{ width: `${emp.score}%` }}></div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {selectedEmployee && (
          <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-lg">
            {codeQualityData.map((emp) => {
              if (emp.employee !== selectedEmployee) return null
              return (
                <div key={emp.employee} className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Duplicate Code</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{emp.duplicateCode}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Vulnerabilities</p>
                    <p className="text-2xl font-bold text-red-600 mt-1">{emp.vulnerabilities}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-600 dark:text-slate-400">Maintainability</p>
                    <p className="text-2xl font-bold text-green-600 mt-1">{emp.maintainability}%</p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Security Vulnerabilities Trend</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={securityTrendData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="week" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="vulnerabilities" stroke="#ef4444" strokeWidth={2} name="Found" />
            <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
