import * as fs from 'fs'
import jsyaml from 'js-yaml'
import { Config } from './types'

export function parseConfig(rawConfig: any) {
    const result: Config = { 
        whitelist: [], 
        blacklist: [], 
        allowUpdateOfPR: false, 
        rebaseInProgressLabel: 'rebase-in-progress',
        rebaseCommentCommand: '/rebase'
    }
    if (rawConfig && rawConfig.whitelist) {
        if (Array.isArray(rawConfig.whitelist)) {
            result.whitelist = rawConfig.whitelist
        } else {
            throw new Error('`whitelist` should be an array')
        }
    }
    if (rawConfig && rawConfig.blacklist) {
        if (Array.isArray(rawConfig.blacklist)) {
            result.blacklist = rawConfig.blacklist
        } else {
            throw new Error('`blacklist` should be an array')
        }
    }
    if (rawConfig && rawConfig.allowUpdateOfPR) {
        if (
            typeof rawConfig.allowUpdateOfPR !== 'boolean'
        ) {
            throw new Error(
                `'allowUpdateOfPR' should be either false or true, got ${rawConfig.allowUpdateOfPR}`,
            )
        }
        result.allowUpdateOfPR = rawConfig.allowUpdateOfPR
    }
    if (rawConfig && rawConfig.rebaseInProgressLabel) {
        if (
            typeof rawConfig.rebaseInProgressLabel !== 'string'
        ) {
            throw new Error(
                `'rebaseInProgressLabel' should be either false or true, got ${rawConfig.rebaseInProgressLabel}`,
            )
        }
        result.rebaseInProgressLabel = rawConfig.rebaseInProgressLabel
    }
    if (rawConfig && rawConfig.rebaseCommentCommand) {
        if (
            typeof rawConfig.rebaseCommentCommand !== 'string'
        ) {
            throw new Error(
                `'rebaseCommentCommand' should be either false or true, got ${rawConfig.rebaseCommentCommand}`,
            )
        }
        result.rebaseCommentCommand = rawConfig.rebaseCommentCommand
    }
    return result
}

function getFileData(filename: string) {
    try {
        return fs.readFileSync(filename).toString()
    } catch (error) {
        console.log(`Did not find config ${filename}`)
        return ''
    }
}

export default function readConfig(filename: string) {
    const cwd = process.cwd()
    console.log('cwd', cwd)
    const data = getFileData(filename)
    const yaml = jsyaml.safeLoad(data)
    return parseConfig(yaml)
}
