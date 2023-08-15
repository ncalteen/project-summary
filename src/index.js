const core = require('@actions/core')
const github = require('@actions/github')
const mustache = require('mustache')

const graphql = require('./graphql.js')
const utils = require('./utils.js')
const templates = require('./templates.js')

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
  const numberOfDays =
    core.getInput('numberOfDays') !== ''
      ? parseInt(core.getInput('numberOfDays'))
      : 14

  // Organization to create the summary issue in
  let organization = core.getInput('organization')
  if (organization === undefined) organization = ''

  // Owner to create the summary issue in
  let owner = core.getInput('owner')
  if (owner === undefined) owner = ''

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

  core.info('Running with the following configuration:')
  core.info(`numberOfDays: ${numberOfDays}`)
  core.info(`organization: ${organization}`)
  core.info(`owner: ${owner}`)
  core.info(`repository: ${repository}`)
  core.info(`projectNumber: ${projectNumber}`)
  core.info(`startDate: ${startDate}`)

  if (owner !== '' && organization !== '') {
    core.setFailed(
      'You cannot specify both an organization and an owner. Please specify only one.'
    )
    return
  }

  // Set up the base stats object
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
  // This is an array of promises
  let responses = await utils.getContributions(tokens, startDate)

  core.info('------------------------------------')

  Promise.all(responses).then(async values => {
    values.forEach(c => {
      c = c.user.contributionsCollection

      core.info('Outputting contributions for token:')
      core.info(JSON.stringify(c))
      core.info('------------------------------------')

      // Merge contributions from this GitHub tenant
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

    core.info('Generated markdown for the summary issue')

    // Get the GitHub.com tenant client and username
    // This is for creating the summary issue
    let octokit = github.getOctokit(githubToken)
    let username = await graphql.getAuthenticatedUser(octokit)

    // Render the final markdown file
    let output = mustache.render(templates.base, {
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

    core.info(`Creating summary issue for ${username}`)

    // Write the output to a new issue and assign to the project
    let createIssueResponse = await utils.createIssue(
      octokit,
      organization,
      owner,
      repository,
      username,
      projectNumber,
      output
    )

    core.info(createIssueResponse)
  })
}

run()
