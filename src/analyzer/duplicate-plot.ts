import '../extensions/array-extensions.js'

import {LogLine} from '../types/log-line.js'

const duplicatePlotRegex = /^Have multiple copies of the plot (.+\.plot) in \[(.*)].*$/

export interface DuplicatePlot {
  plot: string
  plotPaths: string[]
}

export function detectDuplicatePlots(warningLogLines: LogLine[]): DuplicatePlot[] {
  return warningLogLines
    .mapAndFilter((logLine): DuplicatePlot|undefined => {
      if (logLine.file !== 'chia.plotting.manager') {
        return
      }
      const matches = logLine.message.match(duplicatePlotRegex)
      if (matches === null || matches.length !== 3) {
        return
      }

      return {
        plot: matches[1],
        plotPaths: matches[2].split(', ').map(plotPath => plotPath.trim().replaceAll(`'`, '').replaceAll('\\\\', '\\')),
      }
    })
}
