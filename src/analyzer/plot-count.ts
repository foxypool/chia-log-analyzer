import {LogLine} from '../types/log-line.js'
import {mapFind} from '../util/map-find.js'

const plotCountRegex = /Total ([0-9]*) plots/

export function detectPlotCount(reversedInfoLogLines: LogLine[]): number|undefined {
  return mapFind(
    reversedInfoLogLines,
    logLine => {
      const matches = logLine.message.match(plotCountRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return parseInt(matches[1], 10)
    },
    plotCount => plotCount !== undefined
  )
}
