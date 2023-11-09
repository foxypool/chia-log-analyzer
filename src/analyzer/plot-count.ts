import {LogLine} from '../types/log-line.js'

const plotCountRegex = /Total ([0-9]*) plots/

export function detectPlotCount(infoLogLines: LogLine[]): number|undefined {
  return infoLogLines
    .map(logLine => {
      const matches = logLine.message.match(plotCountRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return parseInt(matches[1], 10)
    })
    .filter((plotCount): plotCount is number => plotCount !== undefined)
    .at(-1)
}
