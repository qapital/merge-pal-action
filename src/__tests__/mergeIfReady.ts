import mergeIfReady from '../mergeIfReady'
import { Client } from '../types'
const merge = jest.fn()
const get = jest.fn()

const client = {
    pulls: {
        merge,
        get,
    },
}

describe('mergeIfReady', () => {
    beforeEach(() => {
        merge.mockClear()
        get.mockClear()
    })
    it('merges pr if it is mergeable and merging allowed', async () => {
        const prNumber = 42
        const repo = 'repo'
        const owner = 'owner'
        const sha = 'abcdef'
        get.mockReturnValue({
            data: {
                number: prNumber,
                mergeable: true,
                mergeable_state: 'clean',
            },
        })
        await mergeIfReady(
            (client as unknown) as Client,
            owner,
            repo,
            prNumber,
            sha,
        )
        expect(get).toHaveBeenCalledTimes(1)
        expect(get).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: prNumber,
        })
        expect(merge).toHaveBeenCalledTimes(1)
        expect(merge).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: prNumber,
            sha,
        })
    })
    it('does not merge pr if it is not mergeable', async () => {
        const prNumber = 42
        const repo = 'repo'
        const owner = 'owner'
        const sha = 'abcdef'
        get.mockReturnValueOnce({
            data: {
                number: prNumber,
                mergeable: false,
                mergeable_state: 'clean',
            },
        })
        await mergeIfReady(
            (client as unknown) as Client,
            owner,
            repo,
            prNumber,
            sha,
        )
        expect(get).toHaveBeenCalledTimes(1)
        expect(get).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: prNumber,
        })
        expect(merge).toHaveBeenCalledTimes(0)
    })
    it('does not merge pr if it is not clean', async () => {
        const prNumber = 42
        const repo = 'repo'
        const owner = 'owner'
        const sha = 'abcdef'
        get.mockReturnValueOnce({
            data: {
                number: prNumber,
                mergeable: true,
                mergeable_state: 'dirty',
            },
        })
        await mergeIfReady(
            (client as unknown) as Client,
            owner,
            repo,
            prNumber,
            sha,
        )
        expect(get).toHaveBeenCalledTimes(1)
        expect(get).toHaveBeenCalledWith({
            owner,
            repo,
            pull_number: prNumber,
        })
        expect(merge).toHaveBeenCalledTimes(0)
    })
})
