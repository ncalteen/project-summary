const queries = require('./queries.js')

/**
 * Get the currently authenticated user.
 */
async function getAuthenticatedUser(octokit) {
  let response = await octokit.graphql({
    query: queries.AUTHENTICATED_USER
  })

  return response.viewer.login
}

/**
 * Get the global ID of a user.
 * @param {string} username The user to get the ID for.
 */
async function getUserNodeId(octokit, username) {
  let response = await octokit.request('GET /users/:username', {
    username
  })

  return response.data.node_id
}

/**
 * Get the global ID of a project.
 * @param {string} organization The owner of the project.
 * @param {number} projectNumber The number of the project.
 */
async function getProjectNodeId(octokit, organization, projectNumber) {
  let response

  projectNumber = parseInt(projectNumber)

  response = await octokit.graphql({
    query: queries.PROJECT_NODE_ID,
    organization,
    projectNumber
  })

  return response.organization.projectV2.id
}

/**
 * Get the global ID of a repository.
 * @param {string} organization The owner of the repository.
 * @param {string} repository The name of the repository.
 */
async function getRepositoryNodeId(octokit, organization, repository) {
  let response

  response = await octokit.graphql({
    query: queries.REPOSITORY_NODE_ID,
    organization,
    repository
  })

  return response.organization.repository.id
}

module.exports = {
  getAuthenticatedUser,
  getProjectNodeId,
  getUserNodeId,
  getRepositoryNodeId
}
