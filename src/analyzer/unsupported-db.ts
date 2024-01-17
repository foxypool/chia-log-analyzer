import {LogLine} from '../types/log-line.js'
import {mapFind} from '../util/map-find.js'

const unsupportedDbRegex = /BlockStore does not support database schema v(\d+)/

export function detectUnsupportedDb(errorLogLines: LogLine[]): number|undefined {
  return mapFind(
    errorLogLines,
    logLine => {
      const matches = logLine.message.match(unsupportedDbRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return parseFloat(matches[1])
    },
    dbVersion => dbVersion !== undefined,
  )
}
