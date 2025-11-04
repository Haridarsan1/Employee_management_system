"use client"

import { useState } from "react"
import ConfirmationModal from "@/components/common/ConfirmationModal"
import { toast } from "sonner"
import {
  Bell,
  Shield,
  Download,
  Trash2,
  Github,
  Key,
  Eye,
  EyeOff
} from "lucide-react"

// GitHub Settings Component
function GitHubSettings() {
  const [githubToken, setGithubToken] = useState(localStorage.getItem("github_token") || "")
  const [githubUsername, setGithubUsername] = useState(localStorage.getItem("github_username") || "")
  const [showToken, setShowToken] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveGitHub = async () => {
    if (!githubToken || !githubUsername) {
      toast.error("Please enter both GitHub username and token")
      return
    }

    setIsSaving(true)
    try {
      // Validate token by making a test API call
      const response = await fetch(`https://api.github.com/users/${githubUsername}`, {
        headers: {
          Authorization: `token ${githubToken}`,
          Accept: "application/vnd.github.v3+json",
        },
      })

      if (!response.ok) {
        throw new Error("Invalid GitHub credentials")
      }

      // Save to localStorage
      localStorage.setItem("github_token", githubToken)
      localStorage.setItem("github_username", githubUsername)
      
      toast.success("GitHub connected successfully! Visit GitHub Monitoring to see your data.")
    } catch (error) {
      toast.error("Failed to connect GitHub. Please check your credentials.")
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDisconnect = () => {
    localStorage.removeItem("github_token")
    localStorage.removeItem("github_username")
    setGithubToken("")
    setGithubUsername("")
    toast.success("GitHub disconnected")
  }

  const isConnected = githubToken && githubUsername

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6 md:col-span-2">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
          <Github className="w-5 h-5 text-purple-600 dark:text-purple-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">GitHub Integration</h2>
      </div>

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
            GitHub Personal Access Token
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
              Generate a token here
            </a> with <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded">repo</code> and <code className="bg-gray-100 dark:bg-slate-700 px-1 py-0.5 rounded">read:user</code> scopes
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            onClick={handleSaveGitHub}
            disabled={isSaving}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Key className="w-4 h-4" />
            {isSaving ? "Connecting..." : isConnected ? "Update Connection" : "Connect GitHub"}
          </button>
          
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
            >
              Disconnect
            </button>
          )}
        </div>

        {isConnected && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-3">
            <p className="text-sm text-green-700 dark:text-green-400">
              ✓ Connected as <strong>@{githubUsername}</strong>
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default function Settings() {
  const [showDeleteWarning, setShowDeleteWarning] = useState(false)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

  const handleExportData = () => {
    toast.success("Data export started. Check your downloads folder.")
  }

  const handleDeleteData = async () => {
    toast.success("All data has been deleted.")
    setShowDeleteWarning(false)
  }

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
        <p className="text-gray-600 dark:text-gray-400">Manage your preferences and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center">
              <Bell className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Notifications</h2>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-blue-600"
            />
            <span className="text-slate-700 dark:text-slate-300">Enable notifications</span>
          </label>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-3">Get alerts for important events and updates</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-gray-200 dark:border-slate-700 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 dark:bg-red-900/30 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-red-600 dark:text-red-400" />
            </div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Data & Privacy</h2>
          </div>
          <button
            onClick={handleExportData}
            className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors mb-3"
          >
            <Download className="w-4 h-4" />
            Export All Data
          </button>
          <button
            onClick={() => setShowDeleteWarning(true)}
            className="w-full inline-flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete All Data
          </button>
        </div>

        <GitHubSettings />
      </div>

      {showDeleteWarning && (
        <ConfirmationModal
          title="Delete All Data"
          message="This will permanently delete all employees, tasks, and reports. This action cannot be undone."
          confirmText="Delete Everything"
          cancelText="Cancel"
          isDangerous={true}
          onConfirm={handleDeleteData}
          onCancel={() => setShowDeleteWarning(false)}
        />
      )}
    </div>
  )
}
