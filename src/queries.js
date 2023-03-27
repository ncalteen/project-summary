// Get the authenticated user's login.
const AUTHENTICATED_USER = `
  query {
    viewer {
      login
    }
  }
`

// Get the user's contributions.
const CONTRIBUTIONS = `
  query ($username: String!, $startDate: DateTime!) {
    user(login: $username) {
      contributionsCollection(from: $startDate) {
        totalCommitContributions
        totalRepositoriesWithContributedCommits
        totalIssueContributions
        totalRepositoriesWithContributedIssues
        totalPullRequestContributions
        totalRepositoriesWithContributedPullRequests
        totalPullRequestReviewContributions
        totalRepositoriesWithContributedPullRequestReviews
        issueContributionsByRepository {
          repository {
            nameWithOwner
            url
          }
          contributions(first: 100) {
            totalCount
            nodes {
              issue {
                title
                url
                createdAt
                state
              }
            }
          }
        }
        pullRequestContributionsByRepository {
          repository {
            nameWithOwner
            url
          }
          contributions(first: 100) {
            totalCount
            nodes {
              pullRequest {
                title
                url
                createdAt
                changedFiles
                state
              }
            }
          }
        }
        pullRequestReviewContributionsByRepository {
          repository {
            nameWithOwner
            url
          }
          contributions(first: 100) {
            totalCount
            nodes {
              pullRequest {
                title
                url
                createdAt
                state
              }
            }
          }
        }
      }
    }
  }
`

// Get the global node ID of a project.
const PROJECT_NODE_ID = `
  query ($organization: String!, $projectNumber: Int!) {
    organization(login: $organization) {
      projectV2(number: $projectNumber) {
        id
      }
    }
  }
`

// Get the global node ID of a repository.
const REPOSITORY_NODE_ID = `
  query ($organization: String!, $repository: String!) {
    organization(login: $organization) {
      repository(name: $repository) {
        id
      }
    }
  }
`

module.exports = {
  AUTHENTICATED_USER,
  CONTRIBUTIONS,
  PROJECT_NODE_ID,
  REPOSITORY_NODE_ID
}
