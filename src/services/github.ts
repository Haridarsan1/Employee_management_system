import { Octokit } from "@octokit/rest"

let octokitInstance: Octokit | null = null

export const initializeOctokit = (token: string) => {
  octokitInstance = new Octokit({ auth: token })
  return octokitInstance
}

export const getOctokit = () => {
  if (!octokitInstance) {
    throw new Error("Octokit not initialized. Call initializeOctokit first.")
  }
  return octokitInstance
}

export const fetchUserActivity = async (username: string) => {
  try {
    const octokit = getOctokit()
    const { data } = await octokit.users.getByUsername({ username })
    return data
  } catch (error) {
    console.error("Error fetching GitHub user:", error)
    throw error
  }
}

export const fetchUserRepos = async (username: string) => {
  try {
    const octokit = getOctokit()
    const { data } = await octokit.repos.listForUser({
      username,
      type: "all",
      sort: "updated",
    })
    return data
  } catch (error) {
    console.error("Error fetching GitHub repos:", error)
    throw error
  }
}

export const fetchRepositoryCommits = async (owner: string, repo: string, per_page = 30) => {
  try {
    const octokit = getOctokit()
    const { data } = await octokit.repos.listCommits({
      owner,
      repo,
      per_page,
    })
    return data
  } catch (error) {
    console.error("Error fetching commits:", error)
    throw error
  }
}

export const fetchPullRequests = async (owner: string, repo: string) => {
  try {
    const octokit = getOctokit()
    const { data } = await octokit.pulls.list({
      owner,
      repo,
      state: "all",
      sort: "updated",
    })
    return data
  } catch (error) {
    console.error("Error fetching PRs:", error)
    throw error
  }
}
