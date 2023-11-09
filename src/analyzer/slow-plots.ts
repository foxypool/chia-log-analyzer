import {LogLine} from '../types/log-line.js'
import {Dayjs} from 'dayjs'

const plotScanRegex = /Found ([0-9]*) proofs. Time: ([0-9.]*) s/

export interface SlowPlotScan {
  date: Dayjs
  durationInSeconds: number
}

export function detectSlowPlotScans(infoLogLines: LogLine[]): SlowPlotScan[] {
  return infoLogLines
    .map((logLine): SlowPlotScan|undefined => {
      const matches = logLine.message.match(plotScanRegex)
      if (matches === null || matches.length !== 3) {
        return
      }

      return {
        date: logLine.date,
        durationInSeconds: parseFloat(matches[2]),
      }
    })
    .filter((slowPlotScan): slowPlotScan is SlowPlotScan => slowPlotScan !== undefined && slowPlotScan.durationInSeconds > 20)
}
