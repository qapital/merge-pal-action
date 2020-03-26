import Octokit = require('@octokit/rest')
import { Client, Config } from './types'
import checkIfHasRebaseInProgressLabel from './checkIfHasRebaseInProgressLabel'

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
    await Promise.all(
        stillOpenedPrs.data.map((pr) => {
            if (checkIfHasRebaseInProgressLabel(pr, config.rebaseInProgressLabel)){
                console.log(`PR #${pr.number} is labeled with ${config.rebaseInProgressLabel}, we are removing it`)
                client.issues.removeLabel({
                    owner,
                    repo,
                    issue_number: pr.number,
                    name: config.rebaseInProgressLabel,
                })
            }
        })
    )
}
