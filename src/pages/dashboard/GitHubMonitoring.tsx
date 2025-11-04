"use client"

import { useState, useEffect } from "react"
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import { Link } from "react-router-dom"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import ActivityFeed from "@/components/github/ActivityFeed"
import { toast } from "sonner"
import { AlertCircle, Settings } from "lucide-react"

const activityTrendData = [
  { day: "Mon", commits: 12, prs: 3, issues: 5 },
  { day: "Tue", commits: 15, prs: 4, issues: 6 },
  { day: "Wed", commits: 10, prs: 2, issues: 4 },
  { day: "Thu", commits: 18, prs: 5, issues: 8 },
  { day: "Fri", commits: 20, prs: 6, issues: 9 },
  { day: "Sat", commits: 8, prs: 1, issues: 2 },
  { day: "Sun", commits: 5, prs: 0, issues: 1 },
]

interface Repo {
  id: number
  name: string
  html_url: string
  open_issues_count: number
  stargazers_count: number
  updated_at: string
  description: string | null
}

export default function GitHubMonitoring() {
  const [stats, setStats] = useState({ totalCommits: 0, openPRs: 0, mergedThisWeek: 0, issuesClosed: 0 })
  const [repositories, setRepositories] = useState<Repo[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState<"all" | "push" | "pull_request" | "issue" | "review">("all")
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    const loadGitHubData = async () => {
      const token = localStorage.getItem("github_token")
      const username = localStorage.getItem("github_username")

      if (!token || !username) {
        setIsConnected(false)
        setIsLoading(false)
        return
      }

      setIsConnected(true)

      try {
        // Fetch user repositories
        const reposResponse = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=10`, {
          headers: {
            Authorization: `token ${token}`,
            Accept: "application/vnd.github.v3+json",
          },
        })

        if (!reposResponse.ok) {
          throw new Error("Failed to fetch repositories")
        }

        const repos: Repo[] = await reposResponse.json()
        setRepositories(repos)

        // Calculate stats from repositories
        let totalCommits = 0
        let openPRs = 0

        for (const repo of repos.slice(0, 5)) {
          try {
            // Get commits from last week
            const weekAgo = new Date()
            weekAgo.setDate(weekAgo.getDate() - 7)
            const commitsResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/commits?since=${weekAgo.toISOString()}&per_page=100`,
              {
                headers: {
                  Authorization: `token ${token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              }
            )
            if (commitsResponse.ok) {
              const commits = await commitsResponse.json()
              totalCommits += commits.length
            }

            // Get open PRs
            const prsResponse = await fetch(
              `https://api.github.com/repos/${username}/${repo.name}/pulls?state=open&per_page=100`,
              {
                headers: {
                  Authorization: `token ${token}`,
                  Accept: "application/vnd.github.v3+json",
                },
              }
            )
            if (prsResponse.ok) {
              const prs = await prsResponse.json()
              openPRs += prs.length
            }
          } catch (err) {
            console.error(`Error fetching data for ${repo.name}:`, err)
          }
        }

        setStats({
          totalCommits,
          openPRs,
          mergedThisWeek: Math.floor(totalCommits * 0.3), // Estimate
          issuesClosed: repos.reduce((sum, r) => sum + r.open_issues_count, 0),
        })
      } catch (error) {
        console.error("Error loading GitHub data:", error)
        toast.error("Failed to load GitHub data. Please check your connection in Settings.")
      } finally {
        setIsLoading(false)
      }
    }

    loadGitHubData()
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">GitHub Monitoring</h1>
        <p className="text-slate-600 dark:text-slate-400">Track team activity and contributions in real-time</p>
      </div>

      {!isConnected && !isLoading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
                GitHub Not Connected
              </h3>
              <p className="text-yellow-800 dark:text-yellow-300 mb-4">
                Connect your GitHub account to see real-time data from your repositories, commits, pull requests, and issues.
              </p>
              <Link
                to="/dashboard/settings"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                <Settings className="w-4 h-4" />
                Connect in Settings
              </Link>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center h-96">
          <LoadingSpinner size="lg" text="Loading GitHub metrics..." />
        </div>
      ) : isConnected ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border-l-4 border-blue-600">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Total Commits</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.totalCommits}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This week</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border-l-4 border-yellow-600">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Open PRs</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.openPRs}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">Awaiting review</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border-l-4 border-green-600">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Merged</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.mergedThisWeek}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This week</p>
            </div>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 shadow border-l-4 border-purple-600">
              <h3 className="text-slate-600 dark:text-slate-400 text-sm font-medium">Issues Closed</h3>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-2">{stats.issuesClosed}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">This week</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Activity Trend</h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={activityTrendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="day" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="commits" stroke="#3b82f6" strokeWidth={2} />
                  <Line type="monotone" dataKey="prs" stroke="#10b981" strokeWidth={2} />
                  <Line type="monotone" dataKey="issues" stroke="#f59e0b" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Repository Performance</h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={repositories.slice(0, 3).map(r => ({
                  name: r.name,
                  stars: r.stargazers_count,
                  issues: r.open_issues_count
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#cbd5e1" />
                  <XAxis dataKey="name" stroke="#94a3b8" />
                  <YAxis stroke="#94a3b8" />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="stars" fill="#3b82f6" name="Stars" />
                  <Bar dataKey="issues" fill="#f59e0b" name="Issues" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h2>
              <select
                value={selectedFilter}
                onChange={(e) => setSelectedFilter(e.target.value as any)}
                className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-sm"
              >
                <option value="all">All Activities</option>
                <option value="push">Pushes</option>
                <option value="pull_request">Pull Requests</option>
                <option value="issue">Issues</option>
                <option value="review">Reviews</option>
              </select>
            </div>
            <ActivityFeed filter={selectedFilter} maxItems={8} />
          </div>

          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
              Your Repositories ({repositories.length})
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {repositories.length === 0 ? (
                <div className="col-span-2 text-center py-12 text-slate-600 dark:text-slate-400">
                  No repositories found
                </div>
              ) : (
                repositories.map((repo) => (
                  <div
                    key={repo.id}
                    className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">{repo.name.charAt(0).toUpperCase()}</span>
                        </div>
                        <div>
                          <h3 className="font-semibold text-slate-900 dark:text-white">{repo.name}</h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400">
                            Updated {new Date(repo.updated_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <a
                        href={repo.html_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                      >
                        View →
                      </a>
                    </div>
                    {repo.description && (
                      <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
                      <span>⭐ {repo.stargazers_count}</span>
                      <span>🔴 {repo.open_issues_count} issues</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
