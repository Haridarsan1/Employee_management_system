"use client"

import { useState, useEffect } from "react"
import type { GitHubActivity } from "@/services/github-integration"
import { mockGitHubActivities } from "@/services/github-integration"

interface ActivityFeedProps {
  filter?: "all" | "push" | "pull_request" | "issue" | "review"
  maxItems?: number
}

const getActivityIcon = (type: string) => {
  switch (type) {
    case "push":
      return "📤"
    case "pull_request":
      return "🔀"
    case "issue":
      return "⚠️"
    case "review":
      return "👀"
    default:
      return "🔔"
  }
}

const getActivityColor = (type: string) => {
  switch (type) {
    case "push":
      return "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200"
    case "pull_request":
      return "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200"
    case "issue":
      return "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200"
    case "review":
      return "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200"
    default:
      return "bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200"
  }
}

const formatTimeAgo = (timestamp: string) => {
  const diff = Date.now() - new Date(timestamp).getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)

  if (hours === 0) return "Just now"
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return "Yesterday"
  return `${days}d ago`
}

export default function ActivityFeed({ filter = "all", maxItems = 10 }: ActivityFeedProps) {
  const [activities, setActivities] = useState<GitHubActivity[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading activities
    setTimeout(() => {
      let filtered = mockGitHubActivities
      if (filter !== "all") {
        filtered = filtered.filter((a) => a.type === filter)
      }
      setActivities(filtered.slice(0, maxItems))
      setIsLoading(false)
    }, 500)
  }, [filter, maxItems])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-slate-400">Loading activities...</div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {activities.length === 0 ? (
        <div className="text-center py-8 text-slate-500 dark:text-slate-400">No activities found</div>
      ) : (
        activities.map((activity) => (
          <a
            key={activity.id}
            href={activity.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition group"
          >
            <div className="flex items-start gap-3">
              <span className="text-xl flex-shrink-0">{getActivityIcon(activity.type)}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition truncate">
                  {activity.action}
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  <span className="font-mono">{activity.repository}</span> • {formatTimeAgo(activity.timestamp)}
                </p>
              </div>
              <span
                className={`px-2 py-1 rounded text-xs font-medium flex-shrink-0 ${getActivityColor(activity.type)}`}
              >
                {activity.type.replace("_", " ")}
              </span>
            </div>
          </a>
        ))
      )}
    </div>
  )
}
