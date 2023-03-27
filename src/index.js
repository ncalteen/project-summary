const core = require('@actions/core')
const github = require('@actions/github')
const utils = require('./utils.js')
const graphql = require('./graphql.js')
const mustache = require('mustache')
const fs = require('fs')

async function run() {
  // The GitHub.com token
  const githubToken =
    core.getInput('token') !== ''
      ? core.getInput('token')
      : process.env.GITHUB_TOKEN

  // Token(s) for any EMUs to query
  const emuTokens =
    core.getInput('emuTokens') !== ''
      ? core.getInput('emuTokens').split(',')
      : process.env.EMU_TOKENS.split(',')

  // Number of days back to query
  const numberOfDays = parseInt(core.getInput('numberOfDays'))
    ? core.getInput('numberOfDays') !== ''
    : 14

  // Organization to create the summary issue in
  const organization =
    core.getInput('organization') !== ''
      ? core.getInput('organization')
      : process.env.GITHUB_ORGANIZATION

  // Repository to create the summary issue in
  const repository =
    core.getInput('repository') !== ''
      ? core.getInput('repository')
      : process.env.GITHUB_REPOSITORY

  // Project number to add the summary issue to
  const projectNumber =
    core.getInput('projectNumber') !== ''
      ? core.getInput('projectNumber')
      : process.env.GITHUB_PROJECT_NUMBER

  // Get the ISO 8601 date
  const startDate = new Date(
    new Date().getTime() - numberOfDays * 24 * 60 * 60 * 1000
  )

  // Get all the tokens to use for API calls
  let tokens = [githubToken]

  if (emuTokens.length > 0 && emuTokens[0] !== '') {
    tokens = tokens.concat(emuTokens)
  }

  let totalStats = {
    totalCommitContributions: 0,
    totalRepositoriesWithContributedCommits: 0,
    totalIssueContributions: 0,
    totalRepositoriesWithContributedIssues: 0,
    totalPullRequestContributions: 0,
    totalRepositoriesWithContributedPullRequests: 0,
    totalPullRequestReviewContributions: 0,
    totalRepositoriesWithContributedPullRequestReviews: 0,
    issueContributionsByRepository: [],
    pullRequestContributionsByRepository: [],
    pullRequestReviewContributionsByRepository: []
  }

  // Get the contributions for each token
  let response = await utils.getContributions(tokens, startDate)

  Promise.all(response).then(async values => {
    values.forEach(c => {
      c = c.user.contributionsCollection

      // Merge contributions from this EMU instance
      totalStats.totalCommitContributions += c.totalCommitContributions
      totalStats.totalRepositoriesWithContributedCommits +=
        c.totalRepositoriesWithContributedCommits
      totalStats.totalIssueContributions += c.totalIssueContributions
      totalStats.totalRepositoriesWithContributedIssues +=
        c.totalRepositoriesWithContributedIssues
      totalStats.totalPullRequestContributions +=
        c.totalPullRequestContributions
      totalStats.totalRepositoriesWithContributedPullRequests +=
        c.totalRepositoriesWithContributedPullRequests
      totalStats.totalPullRequestReviewContributions +=
        c.totalPullRequestReviewContributions
      totalStats.totalRepositoriesWithContributedPullRequestReviews +=
        c.totalRepositoriesWithContributedPullRequestReviews
      totalStats.issueContributionsByRepository =
        totalStats.issueContributionsByRepository.concat(
          c.issueContributionsByRepository
        )
      totalStats.pullRequestContributionsByRepository =
        totalStats.pullRequestContributionsByRepository.concat(
          c.pullRequestContributionsByRepository
        )
      totalStats.pullRequestReviewContributionsByRepository =
        totalStats.pullRequestReviewContributionsByRepository.concat(
          c.pullRequestReviewContributionsByRepository
        )
    })

    // Generate markdown from the templates
    let repoSummary = utils.generateRepoSummary(totalStats)
    let repoIssues = utils.generateRepoIssues(totalStats)
    let repoPullRequests = utils.generateRepoPullRequests(totalStats)
    let repoPullRequestReviews =
      utils.generateRepoPullRequestReviews(totalStats)

    // Populate the main template with the generated markdown
    let template = fs.readFileSync('./templates/template.md', 'utf8').toString()

    octokit = github.getOctokit(githubToken)
    username = await graphql.getAuthenticatedUser(octokit)

    let output = mustache.render(template, {
      username: username,
      start_date: startDate.toISOString().substring(0, 10),
      end_date: new Date().toISOString().substring(0, 10),
      commits: totalStats.totalCommitContributions,
      repositories_with_commits:
        totalStats.totalRepositoriesWithContributedCommits,
      issues: totalStats.totalIssueContributions,
      repositories_with_issues:
        totalStats.totalRepositoriesWithContributedIssues,
      pull_requests: totalStats.totalPullRequestContributions,
      repositories_with_pull_requests:
        totalStats.totalRepositoriesWithContributedPullRequests,
      pull_requests_reviewed: totalStats.totalPullRequestReviewContributions,
      repositories_with_pull_requests_reviewed:
        totalStats.totalRepositoriesWithContributedPullRequestReviews,
      repositorySummary: repoSummary,
      repositoryIssues: repoIssues,
      repositoryPullRequests: repoPullRequests,
      repositoryPullRequestReviews: repoPullRequestReviews
    })

    // Write the output to a new issue
    utils.createIssue(
      octokit,
      organization,
      repository,
      username,
      projectNumber,
      output
    )
  })
}

module.exports = {run}
