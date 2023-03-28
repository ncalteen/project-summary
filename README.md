# Project Summary Action

This action helps track personal tasks in GitHub. It's designed to generate a
file that contains a summary of completed issues in a certain time period.

## Inputs

### `token`

**Required** (String) The GitHub.com token used for authentication.

_Example:_ `${{ secrets.GITHUB_TOKEN }}`

### `emuTokens`

**Required** (String) A comma-separated list of GitHub EMU tokens for
authentication. This allows you to use different tokens for different EMU
instances.

_Example:_ `${{ secrets.EMU_TOKEN_1 }},${{ secrets.EMU_TOKEN_2 }}`

### `numberOfDays`

**Required** (Number) The number of days in the past to search. Default is `14`.

_Example:_ `14`

### `organization`

**Required** (String) The organization to create the summary issue in
(owner/name format).

_Example:_ `ncalteen-github`

### `repository`

**Required** (String) The repository to create the summary issue in (owner/name
format).

_Example:_ `todo`

### `projectNumber`

**Required** (Number) The project to add the summary issue to.

_Example:_ `1`

## Outputs

None

## Example usage

```yaml
name: Report on @ncalteen's activity

# Run every 2 weeks
# Or run manually
on:
  schedule:
    - cron: '0 0 1,15 * *'
  workflow_dispatch:

jobs:
  # Assign the issue to @ncalteen
  report:
    runs-on: ubuntu-latest
    steps:
      - name: Build report for @ncalteen
        uses: ncalteen/project-summary@v0.1
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          emuTokens: '${{ secrets.TOKEN_1 }},${{ secrets.TOKEN_2 }}'
          numberOfDays: '14'
          organization: ncalteen-github
          repository: todo
          projectNumber: '1'
```
