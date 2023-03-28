const base = `# Contributions - @{{{username}}}

| Start Date     | End Date     |
| -------------- | ------------ |
| {{{start_date}}} | {{{end_date}}} |

## Summary

| Metric                 | Total                      | Repositories                                 |
| ---------------------- | -------------------------- | -------------------------------------------- |
| Commits Created        | {{{commits}}}                | {{{repositories_with_commits}}}                |
| Issues Created         | {{{issues}}}                 | {{{repositories_with_issues}}}                 |
| Pull Requests Created  | {{{pull_requests}}}          | {{{repositories_with_pull_requests}}}          |
| Pull Requests Reviewed | {{{pull_requests_reviewed}}} | {{{repositories_with_pull_requests_reviewed}}} |

## Repository Summary

{{{repositorySummary}}}

## Detailed Activity

{{{repositoryIssues}}}

{{{repositoryPullRequests}}}

{{{repositoryPullRequestReviews}}}`

const repositorySummary = `| Repository Name | Issues Created | Pull Requests Created | Pull Requests Reviewed |
| --------------- | -------------- | --------------------- | ---------------------- |
{{{repositorySummaryRows}}}`

const repositorySummaryRows = `| [{{{nameWithOwner}}}]({{{url}}}) | {{{issuesCreated}}} | {{{pullRequestsCreated}}} | {{{pullRequestsReviewed}}} |`

const repositoryIssues = `### Issues

| Repository Name | Created Date | Issue | Status |
| --------------- | ------------ | ----- | ------ |
{{{repositoryIssuesRows}}}`

const repositoryIssuesRows = `| [{{{nameWithOwner}}}]({{{repoUrl}}}) | {{{createdAt}}} | [{{{title}}}]({{{url}}}) | {{{state}}} |`

const repositoryPullRequests = `### Pull Requests

| Repository Name | Created Date | Pull Request | Changed Files | Status |
| --------------- | ------------ | ------------ | ------------- | ------ |
{{{repositoryPullRequestsRows}}}`

const repositoryPullRequestsRows = `| [{{{nameWithOwner}}}]({{{repoUrl}}}) | {{{createdAt}}} | [{{{title}}}]({{{url}}}) | {{{changedFiles}}} | {{{state}}} |`

const repositoryPullRequestReviews = `### Pull Request Reviews

| Repository Name | Created Date | Pull Request | Status |
| --------------- | ------------ | ------------ | ------ |
{{{repositoryPullRequestReviewsRows}}}`

const repositoryPullRequestReviewsRows = `| [{{{nameWithOwner}}}]({{{repoUrl}}}) | {{{createdAt}}} | [{{{title}}}]({{{url}}}) | {{{state}}} |`

module.exports = {
  base,
  repositorySummary,
  repositorySummaryRows,
  repositoryIssues,
  repositoryIssuesRows,
  repositoryPullRequests,
  repositoryPullRequestsRows,
  repositoryPullRequestReviews,
  repositoryPullRequestReviewsRows
}
