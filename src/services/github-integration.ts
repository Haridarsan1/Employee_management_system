import type { RealtimeChannel } from "@supabase/supabase-js"
import { supabase } from "./supabase"

export interface GitHubActivity {
  id: string
  employee_id: string
  type: "push" | "pull_request" | "issue" | "review"
  action: string
  repository: string
  url: string
  timestamp: string
  details?: Record<string, any>
}

export interface RepositoryMetrics {
  id: string
  name: string
  url: string
  commits_week: number
  prs_open: number
  prs_merged_week: number
  issues_closed_week: number
  contributors: number
  last_updated: string
}

// Simulated GitHub data fetching (replace with real Octokit calls)
export const mockGitHubActivities: GitHubActivity[] = [
  {
    id: "1",
    employee_id: "emp1",
    type: "push",
    action: "Pushed 5 commits to feature/auth-redesign",
    repository: "frontend-app",
    url: "https://github.com/example/frontend-app",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    details: { commits: 5, branch: "feature/auth-redesign" },
  },
  {
    id: "2",
    employee_id: "emp2",
    type: "pull_request",
    action: "Opened PR #234: Implement API rate limiting",
    repository: "backend-api",
    url: "https://github.com/example/backend-api/pull/234",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    details: { pr_number: 234, title: "Implement API rate limiting" },
  },
  {
    id: "3",
    employee_id: "emp3",
    type: "review",
    action: "Approved PR #233: Fix memory leak",
    repository: "backend-api",
    url: "https://github.com/example/backend-api/pull/233",
    timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    details: { pr_number: 233, title: "Fix memory leak" },
  },
  {
    id: "4",
    employee_id: "emp1",
    type: "issue",
    action: "Closed issue #567: User profile page not loading",
    repository: "frontend-app",
    url: "https://github.com/example/frontend-app/issues/567",
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    details: { issue_number: 567, title: "User profile page not loading" },
  },
]

export const mockRepositories: RepositoryMetrics[] = [
  {
    id: "1",
    name: "frontend-app",
    url: "https://github.com/example/frontend-app",
    commits_week: 45,
    prs_open: 3,
    prs_merged_week: 8,
    issues_closed_week: 12,
    contributors: 5,
    last_updated: new Date().toISOString(),
  },
  {
    id: "2",
    name: "backend-api",
    url: "https://github.com/example/backend-api",
    commits_week: 52,
    prs_open: 7,
    prs_merged_week: 10,
    issues_closed_week: 15,
    contributors: 4,
    last_updated: new Date().toISOString(),
  },
  {
    id: "3",
    name: "devops-infra",
    url: "https://github.com/example/devops-infra",
    commits_week: 18,
    prs_open: 1,
    prs_merged_week: 3,
    issues_closed_week: 5,
    contributors: 2,
    last_updated: new Date().toISOString(),
  },
]

export const subscribeToGitHubActivities = (callback: (activities: GitHubActivity[]) => void): RealtimeChannel => {
  // In production, set up real-time subscription via Supabase
  return supabase
    .channel("github_activities")
    .on("broadcast", { event: "update" }, (payload) => {
      callback(payload.payload.activities)
    })
    .subscribe()
}

export const fetchActivityStats = async () => {
  const totalCommits = mockGitHubActivities.filter((a) => a.type === "push").length
  const openPRs = mockRepositories.reduce((sum, repo) => sum + repo.prs_open, 0)
  const mergedThisWeek = mockRepositories.reduce((sum, repo) => sum + repo.prs_merged_week, 0)
  const issuesClosed = mockRepositories.reduce((sum, repo) => sum + repo.issues_closed_week, 0)

  return {
    totalCommits,
    openPRs,
    mergedThisWeek,
    issuesClosed,
  }
}
