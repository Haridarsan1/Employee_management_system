"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
  Github,
  GitCommit,
  GitPullRequest,
  GitMerge,
  Calendar,
  TrendingUp,
  Activity,
  ArrowLeft,
  RefreshCw,
  AlertCircle,
} from "lucide-react"
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import { toast } from "sonner"
import {
  getEmployeeGitHubAccount,
  getEmployeeRepositories,
  getEmployeeActivity,
  getEmployeeStatistics,
  syncEmployeeGitHubData,
} from "@/services/employee-github"
import { supabase } from "@/services/supabase"

export default function EmployeeGitHubDetailPage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()

  const [employee, setEmployee] = useState<any>(null)
  const [githubAccount, setGithubAccount] = useState<any>(null)
  const [repositories, setRepositories] = useState<any[]>([])
  const [activities, setActivities] = useState<any[]>([])
  const [statistics, setStatistics] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  const [selectedPeriod, setSelectedPeriod] = useState<"daily" | "weekly" | "monthly">("weekly")
  const [selectedRepo, setSelectedRepo] = useState<string>("all")

  useEffect(() => {
    if (employeeId) {
      loadEmployeeGitHubData()
    }
  }, [employeeId])

  const loadEmployeeGitHubData = async () => {
    if (!employeeId) return

    setIsLoading(true)
    try {
      // Load employee details
      const { data: empData } = await supabase
        .from("employees")
        .select("*")
        .eq("id", employeeId)
        .single()
      setEmployee(empData)

      // Load GitHub account
      const account = await getEmployeeGitHubAccount(employeeId)
      setGithubAccount(account)

      if (account) {
        // Load repositories
        const repos = await getEmployeeRepositories(employeeId)
        setRepositories(repos)

        // Load activities
        const acts = await getEmployeeActivity(employeeId, { limit: 50 })
        setActivities(acts)

        // Load statistics
        const stats = await getEmployeeStatistics(employeeId, selectedPeriod)
        setStatistics(stats)
      }
    } catch (error) {
      console.error("Error loading employee GitHub data:", error)
      toast.error("Failed to load GitHub data")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSync = async () => {
    if (!employeeId) return
    
    setIsSyncing(true)
    try {
      await syncEmployeeGitHubData(employeeId)
      toast.success("GitHub data synced successfully!")
      await loadEmployeeGitHubData()
    } catch (error) {
      toast.error("Failed to sync GitHub data")
      console.error(error)
    } finally {
      setIsSyncing(false)
    }
  }

  // Aggregate statistics
  const totalStats = statistics.reduce(
    (acc, stat) => ({
      commits: acc.commits + stat.total_commits,
      prsOpened: acc.prsOpened + stat.total_prs_opened,
      prsMerged: acc.prsMerged + stat.total_prs_merged,
      issuesClosed: acc.issuesClosed + stat.total_issues_closed,
      linesAdded: acc.linesAdded + stat.lines_added,
      linesDeleted: acc.linesDeleted + stat.lines_deleted,
    }),
    { commits: 0, prsOpened: 0, prsMerged: 0, issuesClosed: 0, linesAdded: 0, linesDeleted: 0 }
  )

  // Prepare chart data
  const commitChartData = statistics
    .slice(0, 30)
    .reverse()
    .map((stat) => ({
      date: new Date(stat.period_start).toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      commits: stat.total_commits,
      prs: stat.total_prs_opened,
      merged: stat.total_prs_merged,
    }))

  const activityByType = activities.reduce((acc: any, activity) => {
    acc[activity.activity_type] = (acc[activity.activity_type] || 0) + 1
    return acc
  }, {})

  const activityTypeData = Object.entries(activityByType).map(([type, count]) => ({
    type: type.replace("_", " ").toUpperCase(),
    count,
  }))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <LoadingSpinner size="lg" text="Loading GitHub analytics..." />
      </div>
    )
  }

  if (!githubAccount) {
    return (
      <div className="space-y-6">
        <button
          onClick={() => navigate("/dashboard/employees")}
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Employees
        </button>

        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-16 h-16 text-yellow-600 dark:text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-semibold text-yellow-900 dark:text-yellow-200 mb-2">
            GitHub Not Connected
          </h2>
          <p className="text-yellow-700 dark:text-yellow-300 mb-4">
            {employee?.name} hasn't connected their GitHub account yet.
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-400">
            Ask them to connect their GitHub account from their dashboard settings.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate("/dashboard/employees")}
            className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{employee?.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <Github className="w-4 h-4 text-gray-500" />
              <a
                href={`https://github.com/${githubAccount.github_username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                @{githubAccount.github_username}
              </a>
              {githubAccount.last_sync && (
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  • Last synced {new Date(githubAccount.last_sync).toLocaleString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
          {isSyncing ? "Syncing..." : "Sync Data"}
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <GitCommit className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Commits</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.commits}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            +{totalStats.linesAdded} / -{totalStats.linesDeleted} lines
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
              <GitPullRequest className="w-5 h-5 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Pull Requests</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.prsOpened}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Opened</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
              <GitMerge className="w-5 h-5 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">PRs Merged</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{totalStats.prsMerged}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {totalStats.prsOpened > 0
              ? `${Math.round((totalStats.prsMerged / totalStats.prsOpened) * 100)}% merge rate`
              : "No PRs yet"}
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="text-sm font-medium text-gray-600 dark:text-gray-400">Repositories</h3>
          </div>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{repositories.length}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Tracked</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Commit Activity Chart */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Commit Activity</h2>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value as any)}
              className="px-3 py-1.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-sm"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={commitChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="date" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Legend />
              <Area type="monotone" dataKey="commits" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.2} name="Commits" />
              <Area type="monotone" dataKey="prs" stroke="#a855f7" fill="#a855f7" fillOpacity={0.2} name="PRs Opened" />
              <Area
                type="monotone"
                dataKey="merged"
                stroke="#10b981"
                fill="#10b981"
                fillOpacity={0.2}
                name="PRs Merged"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Activity Type Distribution */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={activityTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.1} />
              <XAxis dataKey="type" stroke="#9ca3af" fontSize={12} />
              <YAxis stroke="#9ca3af" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#1f2937",
                  border: "1px solid #374151",
                  borderRadius: "8px",
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Repositories List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Tracked Repositories</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repositories.map((repo) => (
            <a
              key={repo.id}
              href={repo.repo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-500 transition-colors group"
            >
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600">
                  {repo.repo_name.split("/")[1]}
                </h3>
                {repo.language && (
                  <span className="text-xs bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 px-2 py-1 rounded">
                    {repo.language}
                  </span>
                )}
              </div>
              {repo.description && <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{repo.description}</p>}
              <div className="flex items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
                {repo.last_commit_date && (
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(repo.last_commit_date).toLocaleDateString()}
                  </span>
                )}
                {repo.last_sync && <span>Synced {new Date(repo.last_sync).toLocaleTimeString()}</span>}
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Activity Timeline */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {activities.slice(0, 20).map((activity) => (
            <div key={activity.id} className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                  <Activity className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {activity.activity_type.replace("_", " ").toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.activity_data.message ||
                        activity.activity_data.title ||
                        JSON.stringify(activity.activity_data).slice(0, 100)}
                    </p>
                    {activity.employee_repositories && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {activity.employee_repositories.repo_name}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                    {new Date(activity.occurred_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
