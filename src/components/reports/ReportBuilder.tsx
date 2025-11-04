"use client"

import { useState } from "react"
import { toast } from "sonner"

interface ReportConfig {
  name: string
  type: "performance" | "productivity" | "team" | "projects"
  metrics: string[]
  dateRange: "week" | "month" | "quarter"
  includeCharts: boolean
  scheduleEmail: boolean
  emailRecipients: string[]
}

interface ReportBuilderProps {
  isOpen: boolean
  onClose: () => void
  onGenerate: (config: ReportConfig) => void
}

const AVAILABLE_METRICS = {
  performance: ["commits", "prs_created", "prs_reviewed", "issues_closed", "code_quality"],
  productivity: ["active_days", "avg_commits_per_day", "pr_review_time", "issue_resolution_time"],
  team: ["team_velocity", "code_review_ratio", "deployment_frequency", "incident_response_time"],
  projects: ["milestone_progress", "burndown_rate", "feature_completion", "bug_resolution_rate"],
}

export default function ReportBuilder({ isOpen, onClose, onGenerate }: ReportBuilderProps) {
  const [config, setConfig] = useState<ReportConfig>({
    name: "Weekly Performance Report",
    type: "performance",
    metrics: ["commits", "prs_created"],
    dateRange: "week",
    includeCharts: true,
    scheduleEmail: false,
    emailRecipients: [],
  })

  const [emailInput, setEmailInput] = useState("")

  const handleAddEmail = () => {
    if (emailInput && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailInput)) {
      setConfig({
        ...config,
        emailRecipients: [...config.emailRecipients, emailInput],
      })
      setEmailInput("")
    }
  }

  const handleRemoveEmail = (email: string) => {
    setConfig({
      ...config,
      emailRecipients: config.emailRecipients.filter((e) => e !== email),
    })
  }

  const handleGenerate = () => {
    if (config.metrics.length === 0) {
      toast.error("Please select at least one metric")
      return
    }
    if (config.scheduleEmail && config.emailRecipients.length === 0) {
      toast.error("Please add at least one email recipient")
      return
    }
    onGenerate(config)
    toast.success("Report generation started")
    onClose()
  }

  if (!isOpen) return null

  const availableMetrics = AVAILABLE_METRICS[config.type]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-xl max-w-2xl w-full my-8">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-white">Build Custom Report</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-2xl">
            ×
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Report Name</label>
            <input
              type="text"
              value={config.name}
              onChange={(e) => setConfig({ ...config, name: e.target.value })}
              className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Report Type</label>
              <select
                value={config.type}
                onChange={(e) => setConfig({ ...config, type: e.target.value as any, metrics: [] })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="performance">Performance</option>
                <option value="productivity">Productivity</option>
                <option value="team">Team Metrics</option>
                <option value="projects">Project Progress</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Date Range</label>
              <select
                value={config.dateRange}
                onChange={(e) => setConfig({ ...config, dateRange: e.target.value as any })}
                className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="quarter">This Quarter</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
              Metrics to Include
            </label>
            <div className="grid grid-cols-2 gap-2">
              {availableMetrics.map((metric) => (
                <label key={metric} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.metrics.includes(metric)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setConfig({ ...config, metrics: [...config.metrics, metric] })
                      } else {
                        setConfig({
                          ...config,
                          metrics: config.metrics.filter((m) => m !== metric),
                        })
                      }
                    }}
                    className="w-4 h-4 rounded border-slate-300 text-blue-600"
                  />
                  <span className="text-sm text-slate-700 dark:text-slate-300 capitalize">
                    {metric.replace(/_/g, " ")}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={config.includeCharts}
              onChange={(e) => setConfig({ ...config, includeCharts: e.target.checked })}
              className="w-4 h-4 rounded border-slate-300 text-blue-600"
            />
            <span className="text-sm text-slate-700 dark:text-slate-300">Include charts and visualizations</span>
          </label>

          <div className="border-t border-slate-200 dark:border-slate-700 pt-6">
            <label className="flex items-center gap-3 cursor-pointer mb-4">
              <input
                type="checkbox"
                checked={config.scheduleEmail}
                onChange={(e) => setConfig({ ...config, scheduleEmail: e.target.checked })}
                className="w-4 h-4 rounded border-slate-300 text-blue-600"
              />
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Schedule email delivery</span>
            </label>

            {config.scheduleEmail && (
              <div className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    placeholder="Add email address"
                    className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleAddEmail}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
                  >
                    Add
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {config.emailRecipients.map((email) => (
                    <div
                      key={email}
                      className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 px-3 py-1 rounded-full text-sm"
                    >
                      {email}
                      <button
                        onClick={() => handleRemoveEmail(email)}
                        className="hover:text-blue-600 dark:hover:text-blue-400 font-bold"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleGenerate}
              className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
            >
              Generate Report
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
