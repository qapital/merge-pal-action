import { Client, Config } from './types'
import canMerge from './canMerge'
import checkIfHasRebaseInProgressLabel from './checkIfHasRebaseInProgressLabel'
import isEnabledForPR from './isEnabledForPR'
import Octokit = require('@octokit/rest')
import labelAndCommentPR from './labelAndCommentPR'

export default async function rebaseNextLabeledOpenedPR(
    client: Client,
    config: Config,
    owner: string,
    repo: string,
) {
    console.log(`Checking if there are still open PRs with auto-merge label that can be rebased`)
    var areRebasesInProgress = false
    const openedPrs = await client.pulls.list({
        repo,
        owner: owner,
        state: 'open',
        sort: 'created',
    })
    var autoMergePrs: Octokit.PullsListResponseItem[] = [];
    openedPrs.data.map((pr) => {
        if (!isEnabledForPR(pr, config.whitelist, config.blacklist)) {
            return
        }
        areRebasesInProgress = areRebasesInProgress || checkIfHasRebaseInProgressLabel(pr, config.rebaseInProgressLabel)
        console.log(`checking PR #${pr.number}, areRebasesInProgress=${areRebasesInProgress}`)
        autoMergePrs.push(pr)
    })
    if (areRebasesInProgress == false && autoMergePrs.length > 0){
        await labelAndCommentPR(client, config, owner, repo, autoMergePrs[0].number)
    }
}