"use client"

import { useState } from "react"
import AICodeInsights from "@/components/advanced/AICodeInsights"
import SkillGapAnalyzer from "@/components/advanced/SkillGapAnalyzer"
import TimeTracking from "@/components/advanced/TimeTracking"

export default function AdvancedFeatures() {
  const [activeFeature, setActiveFeature] = useState<"ai" | "skills" | "time" | "onboarding">("ai")

  const features = [
    {
      id: "ai",
      name: "AI Code Insights",
      icon: "🤖",
      description: "Code quality analysis and vulnerability detection",
      enabled: true,
    },
    {
      id: "skills",
      name: "Skill Gap Analyzer",
      icon: "📚",
      description: "Identify skill gaps and training needs",
      enabled: true,
    },
    {
      id: "time",
      name: "Time Tracking",
      icon: "⏱️",
      description: "Auto-log time from commits, manual entry support",
      enabled: true,
    },
    {
      id: "onboarding",
      name: "Onboarding Templates",
      icon: "🧑‍💻",
      description: "Pre-built templates for new hires",
      enabled: false,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Advanced Features</h1>
        <p className="text-slate-600 dark:text-slate-400">AI insights, analytics, and automation tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature) => (
          <button
            key={feature.id}
            onClick={() => feature.enabled && setActiveFeature(feature.id as any)}
            className={`p-6 rounded-lg border-2 transition text-left ${
              activeFeature === feature.id
                ? "bg-blue-50 dark:bg-blue-900 border-blue-600"
                : feature.enabled
                  ? "bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-blue-400"
                  : "bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-50 cursor-not-allowed"
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-2xl mb-2">{feature.icon}</p>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{feature.name}</h3>
                <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{feature.description}</p>
              </div>
              {!feature.enabled && (
                <span className="px-2 py-1 bg-slate-300 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded text-xs font-medium">
                  Soon
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
        {activeFeature === "ai" && <AICodeInsights />}
        {activeFeature === "skills" && <SkillGapAnalyzer />}
        {activeFeature === "time" && <TimeTracking />}
        {activeFeature === "onboarding" && (
          <div className="text-center py-12">
            <p className="text-slate-600 dark:text-slate-400">Coming soon...</p>
          </div>
        )}
      </div>
    </div>
  )
}
