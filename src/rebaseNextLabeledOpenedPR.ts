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
    var autoMergePrs: Octokit.PullsListResponseItem[] = [];
    client.pulls.list({
        repo,
        owner: owner,
        state: 'open',
        sort: 'created',
    }).then (openedPrs => {
        openedPrs.data.map((pr) => {
            if (!isEnabledForPR(pr, config.whitelist, config.blacklist)) {
                return
            }
            client.pulls.get({
                owner,
                repo,
                pull_number: pr.number,
            }).then(current_pr=> {
                if ( current_pr.data.mergeable_state !== 'behind'){
                    console.log(`PR #${pr.number}, mergeable_state=${current_pr.data.mergeable_state}, no need to rebase`)
                    return
                }
            })
            areRebasesInProgress = areRebasesInProgress || checkIfHasRebaseInProgressLabel(pr, config.rebaseInProgressLabel)
            console.log(`checking PR #${pr.number}, areRebasesInProgress=${areRebasesInProgress}`)
            autoMergePrs.push(pr)
        })
    })
    if (areRebasesInProgress == false && autoMergePrs.length > 0){
        await labelAndCommentPR(client, config, owner, repo, autoMergePrs[0].number)
    }
}