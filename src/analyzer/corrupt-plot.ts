import '../extensions/array-extensions.js'

import {LogLine} from '../types/log-line.js'

const plotRegex = /^File: (.+\.plot) Plot ID.*$/

export interface CorruptPlot {
  path: string
  errorCount: number
}

export function detectCorruptPlots(errorLogLines: LogLine[]): CorruptPlot[] {
  const plotsWithErrors = errorLogLines
    .mapAndFilter(logLine => {
      const matches = logLine.message.match(plotRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    })

  const numberOfErrorsByPlotPath = plotsWithErrors.reduce((agg, plotPath) => {
    const errorCount = agg.get(plotPath) ?? 0
    agg.set(plotPath, errorCount + 1)

    return agg
  }, new Map<string, number>())

  return [...numberOfErrorsByPlotPath.entries()]
    .map(([plotPath, numberOfErrors]) => ({
      path: plotPath,
      errorCount: numberOfErrors,
    }))
    .filter(corruptPlot => corruptPlot.errorCount > 3)
}
