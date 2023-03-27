// Add an issue to a project.
const ADD_ISSUE_TO_PROJECT = `
  mutation ($projectId: ID!, $issueId: ID!) {
    addProjectV2ItemById(input: {projectId: $projectId, contentId: $issueId}) {
      item {
        id
      }
    }
  }
`

// Create a new issue.
const CREATE_ISSUE = `
  mutation ($userId: ID!, $repositoryId: ID!, $body: String!, $title: String!) {
    createIssue(input: {
      assigneeIds: [$userId],
      body: $body,
      repositoryId: $repositoryId,
      title: $title
    }) {
      issue {
        id
      }
    }
  }
`

module.exports = {
  ADD_ISSUE_TO_PROJECT,
  CREATE_ISSUE
}
