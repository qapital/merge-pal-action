import Octokit = require('@octokit/rest')
import { Client, Config } from './types'
import checkIfRebaseInProgress from './checkIfRebaseInProgress'

export default async function removeLabelFromOpenPRs(
    client: Client,
    config: Config,
    owner: string,
    repo: string,
) {
    const stillOpenedPrs = await client.pulls.list({
        owner,
        repo,
        state: 'open',
    })
    stillOpenedPrs.data.map((pr) => {
        if (checkIfRebaseInProgress(pr, config.rebaseInProgressLabel)){
            console.log(`PR #${pr.number} is labeled with ${config.rebaseInProgressLabel}, we are removing it`)
            client.issues.removeLabel({
                owner,
                repo,
                issue_number: pr.number,
                name: config.rebaseInProgressLabel,
            })
        }
    })
}
