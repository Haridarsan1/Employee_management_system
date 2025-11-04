"use client"

import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"

interface SkillGap {
  skill: string
  currentCoverage: number
  targetCoverage: number
  gap: number
  recommendedTraining: string
}

const skillGapData: SkillGap[] = [
  {
    skill: "TypeScript",
    currentCoverage: 85,
    targetCoverage: 95,
    gap: 10,
    recommendedTraining: "Advanced TS Patterns",
  },
  { skill: "React", currentCoverage: 90, targetCoverage: 95, gap: 5, recommendedTraining: "React Performance" },
  { skill: "DevOps", currentCoverage: 45, targetCoverage: 70, gap: 25, recommendedTraining: "Kubernetes Basics" },
  { skill: "Python", currentCoverage: 60, targetCoverage: 75, gap: 15, recommendedTraining: "Python Data Science" },
]

const techStackData = [
  { name: "JavaScript", value: 35, people: 8 },
  { name: "Python", value: 20, people: 5 },
  { name: "Go", value: 15, people: 3 },
  { name: "Rust", value: 18, people: 4 },
  { name: "Other", value: 12, people: 3 },
]

const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6"]

export default function SkillGapAnalyzer() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skill Coverage vs Target</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={skillGapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
              <XAxis dataKey="skill" stroke="#94a3b8" angle={-45} textAnchor="end" height={80} />
              <YAxis stroke="#94a3b8" />
              <Tooltip />
              <Legend />
              <Bar dataKey="currentCoverage" fill="#3b82f6" name="Current" />
              <Bar dataKey="targetCoverage" fill="#10b981" name="Target" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Tech Stack Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={techStackData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={{ fill: "#0f172a" }}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {techStackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={colors[index]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value}%`} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recommended Training Programs</h2>
        <div className="space-y-3">
          {skillGapData
            .sort((a, b) => b.gap - a.gap)
            .map((item) => (
              <div key={item.skill} className="p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">
                      {item.skill} <span className="text-red-600">gap: {item.gap}%</span>
                    </p>
                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{item.recommendedTraining}</p>
                  </div>
                  <button className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-sm font-medium transition">
                    Enroll
                  </button>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-600 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${item.gap > 20 ? "bg-red-500" : "bg-yellow-500"}`}
                    style={{ width: `${item.currentCoverage}%` }}
                  ></div>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                  {item.currentCoverage}% / {item.targetCoverage}% coverage
                </p>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}
