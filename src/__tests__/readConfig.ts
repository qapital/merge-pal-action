import readConfig, { parseConfig } from '../readConfig'
import * as path from 'path'

describe('config', () => {
    describe('config sanity', () => {
        it.each`
            value
            ${undefined}
            ${null}
            ${{}}
        `('returns default values when input is $value', ({ value }) => {
            expect(parseConfig(value)).toEqual({
                whitelist: [],
                blacklist: [],
                method: undefined,
                allowUpdateOfPR: false,
            })
        })
        it('throws when types mismatch', () => {
            expect(() => {
                parseConfig({
                    whitelist: {},
                })
            }).toThrowError()
            expect(() => {
                parseConfig({
                    blacklist: {},
                })
            }).toThrowError()
        })
    })
    it('provides default config when file is absent', () => {
        expect(readConfig(path.join(__dirname, '.mergepal.yml'))).toEqual({
            whitelist: [],
            blacklist: [],
            allowUpdateOfPR: false
        })
    })
    it('it parses whitelist and blacklist', () => {
        expect(
            readConfig(path.join(__dirname, './configs/whiteandblack.yml')),
        ).toEqual({
            whitelist: ['white'],
            blacklist: ['black'],
            allowUpdateOfPR: false
        })
    })
    it('it parses whitelist', () => {
        expect(
            readConfig(path.join(__dirname, './configs/whiteonly.yml')),
        ).toEqual({
            whitelist: ['white'],
            blacklist: [],
            allowUpdateOfPR: false
        })
    })
    it('it parses blacklist', () => {
        expect(
            readConfig(path.join(__dirname, './configs/blackonly.yml')),
        ).toEqual({
            whitelist: [],
            blacklist: ['black'],
            allowUpdateOfPR: false
        })
    })
    it('it parses allowUpdateOfPR', () => {
        expect(
            readConfig(path.join(__dirname, './configs/allowUpdateOfPR.yml')),
        ).toEqual({
            whitelist: [],
            blacklist: [],
            allowUpdateOfPR: true
        })
    })
})
