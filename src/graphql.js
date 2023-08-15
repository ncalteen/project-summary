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
 * @param {string} owner The owner (user) of the project.
 * @param {number} projectNumber The number of the project.
 */
async function getProjectNodeId(octokit, organization, owner, projectNumber) {
  projectNumber = parseInt(projectNumber)

  if (organization !== '') {
    let response = await octokit.graphql({
      query: queries.ORG_PROJECT_NODE_ID,
      organization: organization,
      projectNumber: projectNumber
    })

    return response.organization.projectV2.id
  } else {
    let response = await octokit.graphql({
      query: queries.USER_PROJECT_NODE_ID,
      owner: owner,
      projectNumber: projectNumber
    })
    console.log(JSON.stringify(response, null, 2))

    return response.user.projectV2.id
  }
}

/**
 * Get the global ID of a repository.
 * @param {string} organization The owner of the repository.
 * @param {string} owner The owner (user) of the repository.
 * @param {string} repository The name of the repository.
 */
async function getRepositoryNodeId(octokit, organization, owner, repository) {
  let response = await octokit.graphql({
    query: queries.REPOSITORY_NODE_ID,
    owner: organization !== '' ? organization : owner,
    name: repository
  })
  console.log(JSON.stringify(response, null, 2))
  return response.repository.id
}

module.exports = {
  getAuthenticatedUser,
  getProjectNodeId,
  getUserNodeId,
  getRepositoryNodeId
}
