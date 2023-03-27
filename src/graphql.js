/**
 * Get the currently authenticated user.
 */
async function getAuthenticatedUser(octokit) {
  let response = await octokit.graphql({
    query: `
      query {
        viewer {
          login
        }
      }
    `
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
    query: `
          query ($organization: String!, $projectNumber: Int!) {
            organization(login: $organization) {
              projectV2(number: $projectNumber) {
                id
              }
            }
          }
        `,
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
    query: `
      query ($organization: String!, $repository: String!) {
        organization(login: $organization) {
          repository(name: $repository) {
            id
          }
        }
      }
    `,
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
