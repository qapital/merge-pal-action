import Octokit = require('@octokit/rest')
export default function checkIfHasRebaseInProgressLabel(
    pr: Octokit.PullsGetResponse | Octokit.PullsListResponseItem,
    rebaseInProgressLabel: string,
) {
    const labels = pr.labels.map((label) => label.name)
    console.log(`PR #${ pr.number }: labels ${ labels }`)
    const foundRebaseInProgress = labels.filter((label) => rebaseInProgressLabel == label)
    if (foundRebaseInProgress.length > 0){
        console.log(`PR #${ pr.number }: is flagged with label for rebase in progress`)
        return true
    }else{
        return false
    }
}
