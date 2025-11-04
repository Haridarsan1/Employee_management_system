"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import {
  Github,
  Key,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  RefreshCw,
  CheckCircle2,
  XCircle,
  GitBranch,
  Star,
  GitFork,
  AlertCircle,
} from "lucide-react"
import LoadingSpinner from "@/components/common/LoadingSpinner"
import {
  connectEmployeeGitHub,
  disconnectEmployeeGitHub,
  getEmployeeGitHubAccount,
  fetchEmployeeRepositories,
  saveTrackedRepository,
  getEmployeeRepositories,
  toggleRepositoryTracking,
  deleteEmployeeRepository,
  syncEmployeeGitHubData,
} from "@/services/employee-github"

interface EmployeeGitHubSettingsProps {
  employeeId: string
}

export default function EmployeeGitHubSettings({ employeeId }: EmployeeGitHubSettingsProps) {
  const [githubToken, setGithubToken] = useState("")
  const [githubUsername, setGithubUsername] = useState("")
  const [showToken, setShowToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isConnected, setIsConnected] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [isSyncing, setIsSyncing] = useState(false)
  
  const [availableRepos, setAvailableRepos] = useState<any[]>([])
  const [trackedRepos, setTrackedRepos] = useState<any[]>([])
  const [showRepoSelector, setShowRepoSelector] = useState(false)
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [accountInfo, setAccountInfo] = useState<any>(null)

  useEffect(() => {
    loadGitHubConnection()
  }, [employeeId])

  const loadGitHubConnection = async () => {
    try {
      const account = await getEmployeeGitHubAccount(employeeId)
      if (account) {
        setIsConnected(true)
        setGithubUsername(account.github_username)
        setAccountInfo(account)
        await loadTrackedRepositories()
      }
    } catch (error) {
      console.error("Error loading GitHub connection:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadTrackedRepositories = async () => {
    try {
      const repos = await getEmployeeRepositories(employeeId)
      setTrackedRepos(repos)
    } catch (error) {
      console.error("Error loading repositories:", error)
    }
  }

  const handleConnect = async () => {
    if (!githubToken || !githubUsername) {
      toast.error("Please enter both GitHub username and token")
      return
    }

    setIsSaving(true)
    try {
      await connectEmployeeGitHub(employeeId, githubUsername, githubToken)
      setIsConnected(true)
      toast.success("GitHub connected successfully!")
      await loadGitHubConnection()
    } catch (error) {
      toast.error("Failed to connect GitHub. Please check your credentials.")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnectEmployeeGitHub(employeeId)
      setIsConnected(false)
      setGithubToken("")
      setGithubUsername("")
      setTrackedRepos([])
      toast.success("GitHub disconnected")
    } catch (error) {
      toast.error("Failed to disconnect")
      console.error(error)
    }
  }

  const handleFetchRepositories = async () => {
    setIsSaving(true)
    try {
      const repos = await fetchEmployeeRepositories(employeeId, githubToken)
      setAvailableRepos(repos)
      setShowRepoSelector(true)
    } catch (error) {
      toast.error("Failed to fetch repositories")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleSaveSelectedRepos = async () => {
    setIsSaving(true)
    try {
      for (const repoName of selectedRepos) {
        const repo = availableRepos.find((r) => r.name === repoName)
        if (repo && accountInfo) {
          await saveTrackedRepository(employeeId, accountInfo.id, {
            repo_name: repo.name,
            repo_url: repo.url,
            description: repo.description,
            language: repo.language,
            is_private: repo.is_private,
          })
        }
      }
      toast.success(`${selectedRepos.size} repositories added for tracking`)
      setSelectedRepos(new Set())
      setShowRepoSelector(false)
      await loadTrackedRepositories()
    } catch (error) {
      toast.error("Failed to save repositories")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleToggleTracking = async (repoId: string, currentStatus: boolean) => {
    try {
      await toggleRepositoryTracking(repoId, !currentStatus)
      toast.success(`Repository ${!currentStatus ? "enabled" : "disabled"}`)
      await loadTrackedRepositories()
    } catch (error) {
      toast.error("Failed to update repository")
      console.error(error)
    }
  }

  const handleDeleteRepo = async (repoId: string) => {
    try {
      await deleteEmployeeRepository(repoId)
      toast.success("Repository removed")
      await loadTrackedRepositories()
    } catch (error) {
      toast.error("Failed to delete repository")
      console.error(error)
    }
  }

  const handleSyncData = async () => {
    setIsSyncing(true)
    try {
      const result = await syncEmployeeGitHubData(employeeId)
      toast.success(`Synced ${result.repositories} repositories successfully!`)
      await loadTrackedRepositories()
    } catch (error) {
      toast.error("Failed to sync GitHub data")
      console.error(error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading GitHub settings..." />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Connection Card */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
            <Github className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">GitHub Connection</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Connect your GitHub account to track your repositories
            </p>
          </div>
        </div>

        {!isConnected ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                GitHub Username
              </label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => setGithubUsername(e.target.value)}
                placeholder="your-github-username"
                className="w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Personal Access Token
              </label>
              <div className="relative">
                <input
                  type={showToken ? "text" : "password"}
                  value={githubToken}
                  onChange={(e) => setGithubToken(e.target.value)}
                  placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                  className="w-full px-4 py-2.5 pr-12 bg-gray-50 dark:bg-slate-900 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowToken(!showToken)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  {showToken ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                <a
                  href="https://github.com/settings/tokens/new?scopes=repo,read:user"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 underline"
                >
                  Generate token
                </a>{" "}
                with <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded">repo</code> scope
              </p>
            </div>

            <button
              onClick={handleConnect}
              disabled={isSaving}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg font-medium transition-all disabled:opacity-50"
            >
              <Key className="w-5 h-5" />
              {isSaving ? "Connecting..." : "Connect GitHub"}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-green-900 dark:text-green-200">
                    Connected as <strong>@{githubUsername}</strong>
                  </p>
                  {accountInfo?.last_sync && (
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Last synced: {new Date(accountInfo.last_sync).toLocaleString()}
                    </p>
                  )}
                </div>
                <button
                  onClick={handleSyncData}
                  disabled={isSyncing}
                  className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} />
                  {isSyncing ? "Syncing..." : "Sync Now"}
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleFetchRepositories}
                disabled={isSaving}
                className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all"
              >
                <Plus className="w-4 h-4" />
                Add Repositories
              </button>
              <button
                onClick={handleDisconnect}
                className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
              >
                Disconnect
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Repository Selector Modal */}
      {showRepoSelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-3xl w-full max-h-[80vh] overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-200 dark:border-slate-700">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Select Repositories to Track
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Choose repositories you want to monitor
              </p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-2">
              {availableRepos.map((repo) => (
                <label
                  key={repo.name}
                  className="flex items-start gap-3 p-4 border border-gray-200 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700/50 cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedRepos.has(repo.name)}
                    onChange={(e) => {
                      const newSelected = new Set(selectedRepos)
                      if (e.target.checked) {
                        newSelected.add(repo.name)
                      } else {
                        newSelected.delete(repo.name)
                      }
                      setSelectedRepos(newSelected)
                    }}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 dark:text-white">{repo.name}</span>
                      {repo.is_private && (
                        <span className="text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-2 py-0.5 rounded">
                          Private
                        </span>
                      )}
                    </div>
                    {repo.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{repo.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {repo.language && (
                        <span className="flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {repo.language}
                        </span>
                      )}
                      <span className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {repo.stars}
                      </span>
                      <span className="flex items-center gap-1">
                        <GitFork className="w-3 h-3" />
                        {repo.forks}
                      </span>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-slate-700 flex gap-3">
              <button
                onClick={() => setShowRepoSelector(false)}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveSelectedRepos}
                disabled={selectedRepos.size === 0 || isSaving}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-lg font-medium transition-all disabled:opacity-50"
              >
                Add {selectedRepos.size} {selectedRepos.size === 1 ? "Repository" : "Repositories"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tracked Repositories */}
      {isConnected && trackedRepos.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Tracked Repositories ({trackedRepos.length})
          </h3>
          <div className="space-y-3">
            {trackedRepos.map((repo) => (
              <div
                key={repo.id}
                className="flex items-center gap-4 p-4 border border-gray-200 dark:border-slate-700 rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <a
                      href={repo.repo_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:text-blue-700"
                    >
                      {repo.repo_name}
                    </a>
                    {repo.is_tracked ? (
                      <CheckCircle2 className="w-4 h-4 text-green-500" />
                    ) : (
                      <XCircle className="w-4 h-4 text-gray-400" />
                    )}
                  </div>
                  {repo.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{repo.description}</p>
                  )}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    {repo.language && <span>{repo.language}</span>}
                    {repo.last_commit_date && (
                      <span>Last commit: {new Date(repo.last_commit_date).toLocaleDateString()}</span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleTracking(repo.id, repo.is_tracked)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      repo.is_tracked
                        ? "bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 hover:bg-yellow-200"
                        : "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 hover:bg-green-200"
                    }`}
                  >
                    {repo.is_tracked ? "Disable" : "Enable"}
                  </button>
                  <button
                    onClick={() => handleDeleteRepo(repo.id)}
                    className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {isConnected && trackedRepos.length === 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
          <AlertCircle className="w-12 h-12 text-blue-600 dark:text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-200 mb-2">
            No Repositories Tracked
          </h3>
          <p className="text-blue-700 dark:text-blue-300 mb-4">
            Add repositories to start tracking your GitHub activity
          </p>
          <button
            onClick={handleFetchRepositories}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Repositories
          </button>
        </div>
      )}
    </div>
  )
}
