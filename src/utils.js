const fs = require('fs')
const graphql = require('./graphql.js')
const github = require('@actions/github')
const mustache = require('mustache')
const mutations = require('./mutations.js')
const queries = require('./queries.js')

/**
 * Get the contributions for the user.
 *
 * @param {*} tokens A list of GitHub tokens.
 * @param {*} startDate ISO 8601 date.
 * @returns Object with the total contribution stats.
 */
async function getContributions(tokens, startDate) {
  let promises = tokens.map(async token => {
    // Create the Octokit client
    let octokit = github.getOctokit(token)

    // Get the authenticated user
    let username = await graphql.getAuthenticatedUser(octokit)

    // Get contributions for this user
    let c = await octokit.graphql({
      query: queries.CONTRIBUTIONS,
      username,
      startDate
    })

    return c
  })

  return promises
}

/**
 * Generate the summary of contributions per repository.
 * @param {*} c The contributions from getContributions().
 * @returns Populated markdown rows for each repository. Each row looks like the following:
 *
 * '| [`{{nameWithOwner}}`]({{url}}) | {{issuesCreated}} | {{pullRequestsCreated}} | {{pullRequestsReviewed}} |'
 */
function generateRepoSummary(c) {
  let repoSummary = {}

  // First, create a row for each repo
  if (c.issueContributionsByRepository !== undefined) {
    c.issueContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner] = {
        url: element.repository.url,
        issues: 0,
        pullRequests: 0,
        pullRequestReviews: 0
      }
    })
  }
  if (c.pullRequestContributionsByRepository !== undefined) {
    c.pullRequestContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner] = {
        url: element.repository.url,
        issues: 0,
        pullRequests: 0,
        pullRequestReviews: 0
      }
    })
  }
  if (c.pullRequestReviewContributionsByRepository !== undefined) {
    c.pullRequestReviewContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner] = {
        url: element.repository.url,
        issues: 0,
        pullRequests: 0,
        pullRequestReviews: 0
      }
    })
  }

  // Next, populate the rows with the data
  if (c.issueContributionsByRepository !== undefined) {
    c.issueContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner].issues =
        element.contributions.totalCount
    })
  }
  if (c.pullRequestContributionsByRepository !== undefined) {
    c.pullRequestContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner].pullRequests =
        element.contributions.totalCount
    })
  }
  if (c.pullRequestReviewContributionsByRepository !== undefined) {
    c.pullRequestReviewContributionsByRepository.forEach(element => {
      repoSummary[element.repository.nameWithOwner].pullRequestReviews =
        element.contributions.totalCount
    })
  }

  let rowTemplate = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositorySummaryRows.md`,
      'utf8'
    )
    .toString()

  let rows = []
  let key
  let value
  for ([key, value] of Object.entries(repoSummary)) {
    rows.push(
      mustache.render(rowTemplate, {
        nameWithOwner: key,
        url: value.url,
        issuesCreated: value.issues,
        pullRequestsCreated: value.pullRequests,
        pullRequestsReviewed: value.pullRequestReviews
      })
    )
  }

  let template = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositorySummary.md`,
      'utf8'
    )
    .toString()

  return mustache.render(template, {
    repositorySummaryRows: rows.join('\n')
  })
}

/**
 * Generate the detailed list of issues.
 * @param {*} c The contributions from getContributions().
 * @returns Populated markdown rows for each issue. Each row looks like the following:
 *
 * '| [`{{nameWithOwner}}`]({{repoUrl}}) | {{createdAt}} | [{{title}}]({{url}}) | {{state}} |'
 */
function generateRepoIssues(c) {
  if (c.issueContributionsByRepository === undefined) {
    // There are no issues
    return ''
  }

  let rowTemplate = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryIssuesRows.md`,
      'utf8'
    )
    .toString()

  // Populate the rows with the data
  let rows = []
  c.issueContributionsByRepository.forEach(element => {
    element.contributions.nodes.forEach(node => {
      rows.push(
        mustache.render(rowTemplate, {
          nameWithOwner: element.repository.nameWithOwner,
          repoUrl: element.repository.url,
          createdAt: node.issue.createdAt.substring(0, 10),
          title: node.issue.title,
          url: node.issue.url,
          state: node.issue.state
        })
      )
    })
  })

  let template = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryIssues.md`,
      'utf8'
    )
    .toString()

  return mustache.render(template, {
    repositoryIssuesRows: rows.join('\n')
  })
}

/**
 * Generate the detailed list of pull requests.
 * @param {*} c The contributions from getContributions().
 * @returns Populated markdown rows for each PR. Each row looks like the following:
 *
 * '| [`{{nameWithOwner}}`]({{repoUrl}}) | {{createdAt}} | [{{title}}]({{url}}) | {{changedFiles}} | {{state}} |'
 */
function generateRepoPullRequests(c) {
  if (c.pullRequestContributionsByRepository === undefined) {
    // There are no pull requests
    return ''
  }

  // Get the template file
  let rowTemplate = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryPullRequestsRows.md`,
      'utf8'
    )
    .toString()

  // Populate the rows with the data
  let rows = []
  c.pullRequestContributionsByRepository.forEach(element => {
    element.contributions.nodes.forEach(node => {
      rows.push(
        mustache.render(rowTemplate, {
          nameWithOwner: element.repository.nameWithOwner,
          repoUrl: element.repository.url,
          createdAt: node.pullRequest.createdAt.substring(0, 10),
          title: node.pullRequest.title,
          url: node.pullRequest.url,
          changedFiles: node.pullRequest.changedFiles,
          state: node.pullRequest.state
        })
      )
    })
  })

  let template = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryPullRequests.md`,
      'utf8'
    )
    .toString()

  return mustache.render(template, {
    repositoryPullRequestsRows: rows.join('\n')
  })
}

/**
 * Generate the detailed list of pull request reviews.
 * @param {*} c The contributions from getContributions().
 * @returns Populated markdown rows for each PR review. Each row looks like the following:
 *
 * '| [`{{nameWithOwner}}`]({{repoUrl}}) | {{createdAt}} | [{{title}}]({{url}}) | {{state}} |'
 */
function generateRepoPullRequestReviews(c) {
  if (c.pullRequestReviewContributionsByRepository === undefined) {
    // There are no pull request reviews
    return ''
  }

  let rowTemplate = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryPullRequestReviewsRows.md`,
      'utf8'
    )
    .toString()

  // Populate the rows with the data
  let rows = []
  c.pullRequestReviewContributionsByRepository.forEach(element => {
    element.contributions.nodes.forEach(node => {
      rows.push(
        mustache.render(rowTemplate, {
          nameWithOwner: element.repository.nameWithOwner,
          repoUrl: element.repository.url,
          createdAt: node.pullRequest.createdAt.substring(0, 10),
          title: node.pullRequest.title,
          url: node.pullRequest.url,
          state: node.pullRequest.state
        })
      )
    })
  })

  let template = fs
    .readFileSync(
      `${process.env.GITHUB_WORKSPACE}/templates/repositoryPullRequestReviews.md`,
      'utf8'
    )
    .toString()

  return mustache.render(template, {
    repositoryPullRequestReviewsRows: rows.join('\n')
  })
}

/**
 * Create a GitHub issue in the specified repository.
 * @param {*} octokit The authenticated Octokit instance.
 * @param {*} repo The repository name (owner/name format).
 * @param {*} body The generated issue body.
 * @param {*} username The GitHub username to assign the issue to.
 * @param {*} projectNumber The project to add the issue to.
 */
async function createIssue(
  octokit,
  organization,
  repository,
  username,
  projectNumber,
  body
) {
  let date = new Date().toISOString().substring(0, 10)
  let title = `Weekly GitHub Contributions (${date})`

  let userId
  let projectId
  let repositoryId

  Promise.all([
    graphql.getUserNodeId(octokit, username),
    graphql.getProjectNodeId(octokit, organization, projectNumber),
    graphql.getRepositoryNodeId(octokit, organization, repository)
  ]).then(async values => {
    userId = values[0]
    projectId = values[1]
    repositoryId = values[2]

    let response = await octokit.graphql({
      query: mutations.CREATE_ISSUE,
      userId,
      repositoryId,
      body,
      title
    })

    octokit.graphql({
      query: mutations.ADD_ISSUE_TO_PROJECT,
      projectId,
      issueId: response.createIssue.issue.id
    })
  })
}

module.exports = {
  getContributions,
  generateRepoSummary,
  generateRepoIssues,
  generateRepoPullRequests,
  generateRepoPullRequestReviews,
  createIssue
}
