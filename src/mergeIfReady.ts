import { Client, Config } from './types'
import canMerge from './canMerge'
import checkIfRebaseInProgress from './checkIfRebaseInProgress'
import isEnabledForPR from './isEnabledForPR'

export default async function mergeIfReady(
    client: Client,
    owner: string,
    repo: string,
    number: number,
    sha: string,
    config: Config,
) {
    const current_pr = await client.pulls.get({
        owner,
        repo,
        pull_number: number,
    })
    if (!isEnabledForPR(current_pr.data, config.whitelist, config.blacklist)) {
        return
    }
    console.log('current_pr', current_pr)
    console.log(`PR #${ current_pr.data.number }, mergeable=${ current_pr.data.mergeable}, mergeable_state=${ current_pr.data.mergeable_state}`)
    if (canMerge(current_pr.data, config.whitelist, config.blacklist)) {
        await client.pulls.merge({
            owner,
            repo,
            pull_number: number
        })
        // if we merged a pr without 'rebase-in-progress' label, lets than remove it from those that have it
        if (!checkIfRebaseInProgress(current_pr.data, config.rebaseInProgressLabel)){
            const stillOpenedPrs = await client.pulls.list({
                repo,
                owner: owner,
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
    } else {
        if ( current_pr.data.mergeable_state === 'behind'){
            var areRebasesInProgress = false
            const openedPrs = await client.pulls.list({
                repo,
                owner: owner,
                state: 'open',
            })
            openedPrs.data.map((pr) => {
                console.log(`checking PR #${pr.number}, areRebasesInProgress=${areRebasesInProgress}`)
                areRebasesInProgress = areRebasesInProgress || checkIfRebaseInProgress(pr, config.rebaseInProgressLabel)
                console.log(`checking PR #${pr.number} done, areRebasesInProgress=${areRebasesInProgress}`)
            })
            if (!areRebasesInProgress){
                console.log(`Adding label '${config.rebaseInProgressLabel}' to PR #${ current_pr.data.number }`)
                const labels: string[] = [config.rebaseInProgressLabel];
                await client.issues.addLabels({
                    owner,
                    repo,
                    issue_number: number,
                    labels
                })
                console.log(`Adding comment '${ config.rebaseCommentCommand }' to PR #${ current_pr.data.number }`)
                await client.issues.createComment({
                    owner,
                    repo,
                    issue_number: number,
                    body: config.rebaseCommentCommand
                })
                console.log(`Done`)
            }
        }
    }
}
