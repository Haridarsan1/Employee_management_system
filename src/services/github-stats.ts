import { Octokit } from "@octokit/rest"
import { supabase } from "./supabase"

const octokit = new Octokit({
  auth: (import.meta as any).env?.VITE_GITHUB_TOKEN || "",
})

export interface GitHubStats {
  commits: number
  pullRequests: number
  issues: number
  contributions: number
  repositories: string[]
}

export interface WeeklyActivity {
  week: string
  commits: number
  prs: number
  issues: number
}

export interface EmployeeWithGitHubStats {
  id: string
  name: string
  email: string
  role: string
  github_repos: string[]
  commits: number
  prs: number
  issues: number
  score: number
}

/**
 * Fetch GitHub stats for a single repository
 */
export async function getRepoStats(owner: string, repo: string, username?: string): Promise<Partial<GitHubStats>> {
  try {
    const stats: Partial<GitHubStats> = {
      commits: 0,
      pullRequests: 0,
      issues: 0,
    }

    // Get commits (last 100)
    try {
      const { data: commits } = await octokit.repos.listCommits({
        owner,
        repo,
        per_page: 100,
        author: username,
      })
      stats.commits = commits.length
    } catch (err) {
      console.error(`Error fetching commits for ${owner}/${repo}:`, err)
    }

    // Get pull requests
    try {
      const { data: prs } = await octokit.pulls.list({
        owner,
        repo,
        state: "all",
        per_page: 100,
      })
      // Filter by username if provided
      stats.pullRequests = username
        ? prs.filter((pr) => pr.user?.login === username).length
        : prs.length
    } catch (err) {
      console.error(`Error fetching PRs for ${owner}/${repo}:`, err)
    }

    // Get issues
    try {
      const { data: issues } = await octokit.issues.listForRepo({
        owner,
        repo,
        state: "all",
        per_page: 100,
      })
      // Filter by username if provided and exclude PRs
      stats.issues = username
        ? issues.filter((issue) => issue.user?.login === username && !issue.pull_request).length
        : issues.filter((issue) => !issue.pull_request).length
    } catch (err) {
      console.error(`Error fetching issues for ${owner}/${repo}:`, err)
    }

    return stats
  } catch (error) {
    console.error(`Error fetching repo stats for ${owner}/${repo}:`, error)
    return { commits: 0, pullRequests: 0, issues: 0 }
  }
}

/**
 * Fetch combined GitHub stats for multiple repositories
 */
export async function getMultiRepoStats(repos: string[], username?: string): Promise<GitHubStats> {
  const combinedStats: GitHubStats = {
    commits: 0,
    pullRequests: 0,
    issues: 0,
    contributions: 0,
    repositories: repos,
  }

  for (const repoPath of repos) {
    const [owner, repo] = repoPath.split("/")
    if (!owner || !repo) continue

    const stats = await getRepoStats(owner, repo, username)
    combinedStats.commits += stats.commits || 0
    combinedStats.pullRequests += stats.pullRequests || 0
    combinedStats.issues += stats.issues || 0
  }

  combinedStats.contributions = combinedStats.commits + combinedStats.pullRequests + combinedStats.issues

  return combinedStats
}

/**
 * Fetch GitHub stats for all employees with their repositories
 */
export async function getAllEmployeesGitHubStats(companyId: string): Promise<EmployeeWithGitHubStats[]> {
  try {
    // Fetch employees from Supabase
    const { data: employees, error } = await supabase
      .from("employees")
      .select("id, name, email, role, github_username, github_repos")
      .eq("company_id", companyId)

    if (error) throw error

    const employeesWithStats: EmployeeWithGitHubStats[] = []

    for (const employee of employees || []) {
      const repos = employee.github_repos || []
      const username = employee.github_username

      if (repos.length === 0) {
        // No repos, use zeros
        employeesWithStats.push({
          id: employee.id,
          name: employee.name,
          email: employee.email,
          role: employee.role,
          github_repos: [],
          commits: 0,
          prs: 0,
          issues: 0,
          score: 0,
        })
        continue
      }

      // Fetch stats for all repos
      const stats = await getMultiRepoStats(repos, username)

      // Calculate performance score (weighted)
      const score = Math.round(stats.commits * 0.5 + stats.pullRequests * 2 + stats.issues * 0.3)

      employeesWithStats.push({
        id: employee.id,
        name: employee.name,
        email: employee.email,
        role: employee.role,
        github_repos: repos,
        commits: stats.commits,
        prs: stats.pullRequests,
        issues: stats.issues,
        score,
      })
    }

    return employeesWithStats
  } catch (error) {
    console.error("Error fetching employee GitHub stats:", error)
    return []
  }
}

/**
 * Fetch weekly activity data for charts
 */
export async function getWeeklyActivityData(companyId: string): Promise<WeeklyActivity[]> {
  try {
    const employees = await getAllEmployeesGitHubStats(companyId)

    // For now, return aggregate data
    // In a real implementation, you'd fetch time-series data
    const totalCommits = employees.reduce((sum, emp) => sum + emp.commits, 0)
    const totalPRs = employees.reduce((sum, emp) => sum + emp.prs, 0)
    const totalIssues = employees.reduce((sum, emp) => sum + emp.issues, 0)

    // Generate weekly breakdown (mock distribution for now)
    const weeks = ["Week 1", "Week 2", "Week 3", "Week 4"]
    return weeks.map((week) => ({
      week,
      commits: Math.round(totalCommits / 4 + (Math.random() - 0.5) * 10),
      prs: Math.round(totalPRs / 4 + (Math.random() - 0.5) * 3),
      issues: Math.round(totalIssues / 4 + (Math.random() - 0.5) * 5),
    }))
  } catch (error) {
    console.error("Error fetching weekly activity:", error)
    return []
  }
}

/**
 * Fetch skill distribution from employees
 */
export async function getSkillDistribution(companyId: string): Promise<{ name: string; value: number }[]> {
  try {
    const { data: employees, error } = await supabase
      .from("employees")
      .select("skills")
      .eq("company_id", companyId)

    if (error) throw error

    const skillCounts: Record<string, number> = {}

    for (const employee of employees || []) {
      const skills = employee.skills || []
      for (const skill of skills) {
        skillCounts[skill] = (skillCounts[skill] || 0) + 1
      }
    }

    return Object.entries(skillCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10) // Top 10 skills
  } catch (error) {
    console.error("Error fetching skill distribution:", error)
    return []
  }
}
