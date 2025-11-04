"use client"

import { useState } from "react"

interface AuditEntry {
  id: string
  timestamp: string
  user: string
  action: string
  resource: string
  status: "success" | "failed"
  details: string
}

interface AuditLogProps {
  entries: AuditEntry[]
  isLoading?: boolean
}

const getStatusColor = (status: string) => {
  switch (status) {
    case "success":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
    case "failed":
      return "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
    default:
      return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-300"
  }
}

export default function AuditLog({ entries, isLoading = false }: AuditLogProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEntries = entries.filter(
    (entry) =>
      entry.user.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.resource.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  if (isLoading) {
    return <div className="text-center py-8 text-slate-500">Loading audit logs...</div>
  }

  return (
    <div className="space-y-4">
      <div>
        <input
          type="text"
          placeholder="Search audit logs..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {filteredEntries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 dark:text-slate-400">No audit logs found</div>
        ) : (
          filteredEntries.map((entry) => (
            <div key={entry.id} className="border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden">
              <button
                onClick={() => setExpandedId(expandedId === entry.id ? null : entry.id)}
                className="w-full p-4 hover:bg-slate-50 dark:hover:bg-slate-700 transition flex justify-between items-start"
              >
                <div className="text-left flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-slate-900 dark:text-white">{entry.action}</span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(entry.status)}`}>
                      {entry.status}
                    </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                    {entry.user} • {entry.resource} • {new Date(entry.timestamp).toLocaleString()}
                  </p>
                </div>
                <span className="text-slate-400">{expandedId === entry.id ? "▼" : "▶"}</span>
              </button>

              {expandedId === entry.id && (
                <div className="p-4 bg-slate-50 dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700">
                  <p className="text-sm text-slate-600 dark:text-slate-400 font-mono">{entry.details}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
