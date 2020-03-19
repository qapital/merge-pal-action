import Octokit = require('@octokit/rest')
import { Client, Config } from './types'

export default async function labelAndCommentPR(
    client: Client,
    config: Config,
    owner: string,
    repo: string,
    number: number,
) {
    console.log(`Adding label '${config.rebaseInProgressLabel}' to PR #${ number }`)
    const labels: string[] = [config.rebaseInProgressLabel];
    await client.issues.addLabels({
        owner,
        repo,
        issue_number: number,
        labels
    })
    console.log(`Adding comment '${ config.rebaseCommentCommand }' to PR #${ number }`)
    await client.issues.createComment({
        owner,
        repo,
        issue_number: number,
        body: config.rebaseCommentCommand
    })
    console.log(`Done`)
}
