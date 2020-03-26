import { Client, Config } from './types'
import canMerge from './canMerge'
import checkIfHasRebaseInProgressLabel from './checkIfHasRebaseInProgressLabel'
import isEnabledForPR from './isEnabledForPR'
import removeLabelFromOpenPRs from './removeLabelFromOpenPRs'
import rebaseNextLabeledOpenedPR from './rebaseNextLabeledOpenedPR'
import * as github from '@actions/github'

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
    console.log(`PR #${ current_pr.data.number }, data= ${ JSON.stringify(current_pr) }`)
    console.log(`PR #${ current_pr.data.number }, mergeable=${ current_pr.data.mergeable}, mergeable_state=${ current_pr.data.mergeable_state}`)
    
    if (canMerge(current_pr.data, config.whitelist, config.blacklist)) {
        const userToken = process.env[current_pr.data.user.login.toUpperCase() + '_TOKEN']
        if (userToken !== undefined) {
            console.log(`merging using userToken`)
            const user_client = new github.GitHub(userToken)
            await user_client.pulls.merge({
                owner,
                repo,
                pull_number: number
            })
        } else {
            await client.pulls.merge({
                owner,
                repo,
                pull_number: number
            })
        }
        console.log(`PR #${ current_pr.data.number } merged`)
        // if we merged a pr without 'rebase-in-progress' label, lets than remove it from those that have it
        if (!checkIfHasRebaseInProgressLabel(current_pr.data, config.rebaseInProgressLabel)){
            console.log(`We merged a pr without '${config.rebaseInProgressLabel}'. In order to being able to rebase others, we need to remove it from the one that has it.`)
            await removeLabelFromOpenPRs(client, config, owner, repo)
            await rebaseNextLabeledOpenedPR(client, config, owner, repo)
        } else {
            await rebaseNextLabeledOpenedPR(client, config, owner, repo)
        }
    } else {
        // the pr wasn't up to date with master, so we rebase the next one
        if ( current_pr.data.mergeable_state === 'behind'){
            await rebaseNextLabeledOpenedPR(client, config, owner, repo)
        }
    }
}
