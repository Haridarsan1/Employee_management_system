"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface TimeEntry {
  date: string
  employee: string
  hoursLogged: number
  billableHours: number
  commitCount: number
}

const timeData = [
  { day: "Mon", billable: 8.5, breaks: 1.5, dev: 7 },
  { day: "Tue", billable: 8.0, breaks: 2, dev: 6.5 },
  { day: "Wed", billable: 9.0, breaks: 1, dev: 8 },
  { day: "Thu", billable: 7.5, breaks: 2.5, dev: 5.5 },
  { day: "Fri", billable: 6.5, breaks: 3.5, dev: 4 },
]

export default function TimeTracking() {
  const [selectedWeek, setSelectedWeek] = useState("current")

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Billable Hours</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">39.5h</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">This week</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Auto-logged</p>
          <p className="text-3xl font-bold text-green-600 mt-2">31.5h</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">From commits</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Manual Entry</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">8h</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Added</p>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-lg p-4 shadow">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Utilization</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">78%</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Team average</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Weekly Time Breakdown</h2>
          <select
            value={selectedWeek}
            onChange={(e) => setSelectedWeek(e.target.value)}
            className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
          >
            <option value="current">This Week</option>
            <option value="last">Last Week</option>
            <option value="month">This Month</option>
          </select>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={timeData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
            <XAxis dataKey="day" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip />
            <Legend />
            <Bar dataKey="billable" fill="#3b82f6" name="Billable Hours" />
            <Bar dataKey="dev" fill="#10b981" name="Development" />
            <Bar dataKey="breaks" fill="#f59e0b" name="Breaks" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Time Entries</h2>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {[
            { date: "Today", hours: 8.5, billable: true, source: "GitHub commits" },
            { date: "Yesterday", hours: 8.0, billable: true, source: "GitHub commits" },
            { date: "2 days ago", hours: 2.5, billable: true, source: "Manual entry" },
            { date: "3 days ago", hours: 7.5, billable: true, source: "GitHub commits" },
          ].map((entry, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-3 border border-slate-200 dark:border-slate-700 rounded"
            >
              <div>
                <p className="font-medium text-slate-900 dark:text-white">{entry.date}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{entry.source}</p>
              </div>
              <div className="text-right">
                <p className="font-semibold text-slate-900 dark:text-white">{entry.hours}h</p>
                {entry.billable && <p className="text-xs text-green-600">Billable</p>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
