import '../extensions/array-extensions.js'

import {LogLine} from '../types/log-line.js'
import {Dayjs} from 'dayjs'

const plotScanRegex = /Found ([0-9]*) proofs. Time: ([0-9.]*) s/

export interface SlowPlotScan {
  date: Dayjs
  durationInSeconds: number
}

export function detectSlowPlotScans(infoLogLines: LogLine[]): SlowPlotScan[] {
  return infoLogLines
    .mapAndFilter((logLine): SlowPlotScan|undefined => {
      const matches = logLine.message.match(plotScanRegex)
      if (matches === null || matches.length !== 3) {
        return
      }
      const durationInSeconds = parseFloat(matches[2])
      if (durationInSeconds < 20) {
        return
      }

      return {
        date: logLine.date,
        durationInSeconds,
      }
    })
}
