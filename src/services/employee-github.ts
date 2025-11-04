import { supabase } from "./supabase"

export interface EmployeeGitHubAccount {
  id: string
  employee_id: string
  github_username: string
  is_active: boolean
  last_sync: string | null
  created_at: string
}

export interface EmployeeRepository {
  id: string
  employee_id: string
  github_account_id: string
  repo_name: string
  repo_url: string
  description: string | null
  language: string | null
  is_private: boolean
  is_tracked: boolean
  last_commit_date: string | null
  last_sync: string | null
}

export interface GitHubActivity {
  id: string
  employee_id: string
  repository_id: string | null
  activity_type: "commit" | "pull_request" | "issue" | "review" | "release"
  activity_data: any
  occurred_at: string
}

export interface GitHubStatistics {
  employee_id: string
  repository_id: string | null
  period_type: "daily" | "weekly" | "monthly"
  period_start: string
  period_end: string
  total_commits: number
  total_prs_opened: number
  total_prs_merged: number
  total_prs_reviewed: number
  total_issues_opened: number
  total_issues_closed: number
  lines_added: number
  lines_deleted: number
  active_days: number
}

// ============= Employee GitHub Account Management =============

export const connectEmployeeGitHub = async (
  employeeId: string,
  githubUsername: string,
  githubToken: string
) => {
  // First, validate the token
  const isValid = await validateGitHubToken(githubUsername, githubToken)
  if (!isValid) {
    throw new Error("Invalid GitHub credentials")
  }

  // Store the connection (in production, encrypt the token)
  const { data, error } = await supabase
    .from("employee_github_accounts")
    .upsert({
      employee_id: employeeId,
      github_username: githubUsername,
      github_token_encrypted: btoa(githubToken), // Simple encoding - use proper encryption in production
      is_active: true,
      last_sync: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const disconnectEmployeeGitHub = async (employeeId: string) => {
  const { error } = await supabase
    .from("employee_github_accounts")
    .update({ is_active: false })
    .eq("employee_id", employeeId)

  if (error) throw error
}

export const getEmployeeGitHubAccount = async (employeeId: string) => {
  const { data, error } = await supabase
    .from("employee_github_accounts")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("is_active", true)
    .single()

  if (error && error.code !== "PGRST116") throw error
  return data
}

// ============= Repository Management =============

export const fetchEmployeeRepositories = async (employeeId: string, githubToken: string) => {
  const account = await getEmployeeGitHubAccount(employeeId)
  if (!account) throw new Error("GitHub account not connected")

  const token = atob(account.github_token_encrypted || githubToken)
  
  const response = await fetch(
    `https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner,collaborator`,
    {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )

  if (!response.ok) throw new Error("Failed to fetch repositories")
  
  const repos = await response.json()
  return repos.map((repo: any) => ({
    name: repo.full_name,
    url: repo.html_url,
    description: repo.description,
    language: repo.language,
    is_private: repo.private,
    stars: repo.stargazers_count,
    forks: repo.forks_count,
    open_issues: repo.open_issues_count,
    updated_at: repo.updated_at,
  }))
}

export const saveTrackedRepository = async (
  employeeId: string,
  githubAccountId: string,
  repoData: {
    repo_name: string
    repo_url: string
    description: string | null
    language: string | null
    is_private: boolean
  }
) => {
  const { data, error } = await supabase
    .from("employee_repositories")
    .upsert({
      employee_id: employeeId,
      github_account_id: githubAccountId,
      ...repoData,
      is_tracked: true,
      last_sync: new Date().toISOString(),
    })
    .select()
    .single()

  if (error) throw error
  return data
}

export const getEmployeeRepositories = async (employeeId: string) => {
  const { data, error } = await supabase
    .from("employee_repositories")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("is_tracked", true)
    .order("last_commit_date", { ascending: false, nullsFirst: false })

  if (error) throw error
  return data
}

export const toggleRepositoryTracking = async (repositoryId: string, isTracked: boolean) => {
  const { error } = await supabase
    .from("employee_repositories")
    .update({ is_tracked: isTracked })
    .eq("id", repositoryId)

  if (error) throw error
}

export const deleteEmployeeRepository = async (repositoryId: string) => {
  const { error } = await supabase
    .from("employee_repositories")
    .delete()
    .eq("id", repositoryId)

  if (error) throw error
}

// ============= GitHub Activity Fetching =============

export const fetchRepositoryCommits = async (
  repoFullName: string,
  githubToken: string,
  since?: string
) => {
  const sinceParam = since ? `&since=${since}` : ""
  const response = await fetch(
    `https://api.github.com/repos/${repoFullName}/commits?per_page=100${sinceParam}`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )

  if (!response.ok) throw new Error("Failed to fetch commits")
  return response.json()
}

export const fetchRepositoryPullRequests = async (
  repoFullName: string,
  githubToken: string,
  state: "open" | "closed" | "all" = "all"
) => {
  const response = await fetch(
    `https://api.github.com/repos/${repoFullName}/pulls?state=${state}&per_page=100`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )

  if (!response.ok) throw new Error("Failed to fetch pull requests")
  return response.json()
}

export const fetchRepositoryIssues = async (
  repoFullName: string,
  githubToken: string,
  state: "open" | "closed" | "all" = "all"
) => {
  const response = await fetch(
    `https://api.github.com/repos/${repoFullName}/issues?state=${state}&per_page=100`,
    {
      headers: {
        Authorization: `token ${githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    }
  )

  if (!response.ok) throw new Error("Failed to fetch issues")
  return response.json()
}

// ============= Activity Log Management =============

export const saveGitHubActivity = async (
  employeeId: string,
  repositoryId: string | null,
  activityType: string,
  activityData: any,
  githubId: string,
  occurredAt: string
) => {
  const { data, error } = await supabase
    .from("github_activity_log")
    .upsert({
      employee_id: employeeId,
      repository_id: repositoryId,
      activity_type: activityType,
      activity_data: activityData,
      github_id: githubId,
      occurred_at: occurredAt,
    })
    .select()
    .single()

  if (error && error.code !== "23505") throw error // Ignore duplicate key errors
  return data
}

export const getEmployeeActivity = async (
  employeeId: string,
  options?: {
    activityType?: string
    repositoryId?: string
    limit?: number
    offset?: number
  }
) => {
  let query = supabase
    .from("github_activity_log")
    .select("*, employee_repositories(repo_name)")
    .eq("employee_id", employeeId)
    .order("occurred_at", { ascending: false })

  if (options?.activityType) {
    query = query.eq("activity_type", options.activityType)
  }

  if (options?.repositoryId) {
    query = query.eq("repository_id", options.repositoryId)
  }

  if (options?.limit) {
    query = query.limit(options.limit)
  }

  if (options?.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

// ============= Statistics Management =============

export const getEmployeeStatistics = async (
  employeeId: string,
  periodType: "daily" | "weekly" | "monthly",
  startDate?: string,
  endDate?: string
) => {
  let query = supabase
    .from("github_statistics")
    .select("*")
    .eq("employee_id", employeeId)
    .eq("period_type", periodType)
    .order("period_start", { ascending: false })

  if (startDate) {
    query = query.gte("period_start", startDate)
  }

  if (endDate) {
    query = query.lte("period_end", endDate)
  }

  const { data, error } = await query
  if (error) throw error
  return data
}

export const calculateAndSaveStatistics = async (
  employeeId: string,
  repositoryId: string | null,
  periodType: "daily" | "weekly" | "monthly",
  periodStart: string,
  periodEnd: string,
  stats: Partial<GitHubStatistics>
) => {
  const { data, error } = await supabase
    .from("github_statistics")
    .upsert({
      employee_id: employeeId,
      repository_id: repositoryId,
      period_type: periodType,
      period_start: periodStart,
      period_end: periodEnd,
      ...stats,
    })
    .select()
    .single()

  if (error) throw error
  return data
}

// ============= Utility Functions =============

export const validateGitHubToken = async (username: string, token: string): Promise<boolean> => {
  try {
    const response = await fetch(`https://api.github.com/users/${username}`, {
      headers: {
        Authorization: `token ${token}`,
        Accept: "application/vnd.github.v3+json",
      },
    })
    return response.ok
  } catch {
    return false
  }
}

export const syncEmployeeGitHubData = async (employeeId: string) => {
  // Get employee's GitHub account
  const account = await getEmployeeGitHubAccount(employeeId)
  if (!account || !account.github_token_encrypted) {
    throw new Error("GitHub account not connected")
  }

  const token = atob(account.github_token_encrypted)
  
  // Get all tracked repositories
  const repositories = await getEmployeeRepositories(employeeId)
  
  // Sync data for each repository
  for (const repo of repositories) {
    try {
      // Fetch commits from last 30 days
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      
      const commits = await fetchRepositoryCommits(
        repo.repo_name,
        token,
        thirtyDaysAgo.toISOString()
      )

      // Save commit activities
      for (const commit of commits) {
        await saveGitHubActivity(
          employeeId,
          repo.id,
          "commit",
          {
            sha: commit.sha,
            message: commit.commit.message,
            author: commit.commit.author.name,
            url: commit.html_url,
          },
          commit.sha,
          commit.commit.author.date
        )
      }

      // Fetch and save pull requests
      const prs = await fetchRepositoryPullRequests(repo.repo_name, token, "all")
      for (const pr of prs.slice(0, 50)) {
        await saveGitHubActivity(
          employeeId,
          repo.id,
          "pull_request",
          {
            number: pr.number,
            title: pr.title,
            state: pr.state,
            url: pr.html_url,
            merged: pr.merged_at !== null,
          },
          `pr-${pr.id}`,
          pr.created_at
        )
      }

      // Update repository last_sync
      await supabase
        .from("employee_repositories")
        .update({ 
          last_sync: new Date().toISOString(),
          last_commit_date: commits[0]?.commit?.author?.date || null
        })
        .eq("id", repo.id)

    } catch (error) {
      console.error(`Error syncing repository ${repo.repo_name}:`, error)
    }
  }

  // Update account last_sync
  await supabase
    .from("employee_github_accounts")
    .update({ last_sync: new Date().toISOString() })
    .eq("id", account.id)

  return { success: true, repositories: repositories.length }
}
