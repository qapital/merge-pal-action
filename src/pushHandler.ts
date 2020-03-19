import { Client, Context, Config, PushPayload } from './types'
import Octokit = require('@octokit/rest')
import isEnabledForPR from './isEnabledForPR'
import checkIfRebaseInProgress from './checkIfRebaseInProgress'

export default async function pushHandler(
    client: Client,
    context: Context,
    config: Config,
) {
    const payload = context.payload as PushPayload
    const components = payload.ref.split('/')
    const branchName = components[components.length - 1]
    const openedPrs = await client.pulls.list({
        ...context.repo,
        state: 'open',
        base: branchName,
    })
    console.log(`openedPrs= ${ openedPrs }`)
    var autoMergePrs: Octokit.PullsListResponseItem[] = [];
    await Promise.all(
        openedPrs.data.map((pr) => {
            if (!isEnabledForPR(pr, config.whitelist, config.blacklist)) {
                return
            }
            console.log(`allowUpdateOfPR is ${ config.allowUpdateOfPR }`)
            if (config.allowUpdateOfPR){
                return client.pulls.updateBranch({
                    ...context.repo,
                    pull_number: pr.number,
                    expected_head_sha: pr.head.sha,
                })
            }
            autoMergePrs.push(pr)
        }),
    )
    if (!config.allowUpdateOfPR && autoMergePrs.length > 0){
        console.log(`autoMergePrs= ${ autoMergePrs }`)
        var areRebasesInProgress = false
        autoMergePrs.map((pr) => {
            console.log(`checking PR #${pr.number}, areRebasesInProgress=${areRebasesInProgress}`)
            areRebasesInProgress = areRebasesInProgress || checkIfRebaseInProgress(pr, config.rebaseInProgressLabel)
            console.log(`checking PR #${pr.number} done, areRebasesInProgress=${areRebasesInProgress}`)
        })
        if (!areRebasesInProgress){
            const currentPr = autoMergePrs[0]
            console.log(`Adding label '${config.rebaseInProgressLabel}' to PR #${ currentPr.number }`)
            const labels: string[] = [config.rebaseInProgressLabel];
            await client.issues.addLabels({
                ...context.repo,
                issue_number: currentPr.number,
                labels
            })
            console.log(`Adding comment '/rabase' to PR #${ currentPr.number }`)
            await client.issues.createComment({
                ...context.repo,
                issue_number: currentPr.number,
                body: '/rebase'
            })
            console.log(`Done`)
        }
    }
}
