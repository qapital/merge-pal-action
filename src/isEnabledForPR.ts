import Octokit = require('@octokit/rest')
export default function isEnabledForPR(
    pr: Octokit.PullsGetResponse | Octokit.PullsListResponseItem,
    whitelist: string[],
    blacklist: string[],
) {
    if (whitelist.length === 0 && blacklist.length === 0) {
        return true
    }
    const labels = pr.labels.map((label) => label.name)
    const matchedBlack = labels.filter((label) => blacklist.includes(label))
    const matchedWhite = labels.filter((label) => whitelist.includes(label))
    if (blacklist.length > 0 && matchedBlack.length > 0) {
        console.log(`PR #${ pr.number }: matched a blacklisted label, we are ignoring`)
        return false
    }
    if (whitelist.length > 0 && matchedWhite.length === 0) {
        console.log(`PR #${ pr.number }: has not matched a whitelisted label, we are ignoring`)
        return false
    }
    return true
}
