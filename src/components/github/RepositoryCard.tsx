"use client"

import type { RepositoryMetrics } from "@/services/github-integration"

interface RepositoryCardProps {
  repo: RepositoryMetrics
  onAccessManagement?: () => void
}

export default function RepositoryCard({ repo, onAccessManagement }: RepositoryCardProps) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-lg transition">
      <div className="flex justify-between items-start mb-4">
        <div>
          <a
            href={repo.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-lg font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
          >
            {repo.name}
          </a>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
            Updated {new Date(repo.last_updated).toLocaleDateString()}
          </p>
        </div>
        <button onClick={onAccessManagement} className="text-sm text-blue-600 hover:text-blue-700 font-medium">
          Access
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Commits/Week</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{repo.commits_week}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Open PRs</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{repo.prs_open}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Merged/Week</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{repo.prs_merged_week}</p>
        </div>
        <div className="bg-slate-50 dark:bg-slate-700 rounded p-3">
          <p className="text-xs text-slate-600 dark:text-slate-400 font-medium">Contributors</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{repo.contributors}</p>
        </div>
      </div>
    </div>
  )
}
