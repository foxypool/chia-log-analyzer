import {LogLine} from '../types/log-line.js'
import {toChiaLogDate} from '../util/to-chia-log-date.js'

const reOrgRegex = /Updated peak to height (\d+).+forked at (\d+)/

export interface ReOrg {
  forkedAtHeight: number
  peakHeight: number
  depth: number
  rawDate: string
}

export function detectReOrgs(infoLogLines: LogLine[]): ReOrg[] {
  return infoLogLines
    .map((logLine): ReOrg|undefined => {
      if (logLine.file !== 'chia.full_node.full_node') {
        return
      }
      const matches = logLine.message.match(reOrgRegex)
      if (matches === null || matches.length !== 3) {
        return
      }
      const peakHeight = parseInt(matches[1], 10)
      const forkedAtHeight = parseInt(matches[2], 10)
      const depth = peakHeight - forkedAtHeight
      if (depth > 1) {
        return {
          peakHeight,
          forkedAtHeight,
          depth: peakHeight - forkedAtHeight,
          rawDate: toChiaLogDate(logLine.date),
        }
      }
    })
    .filter((reOrg): reOrg is ReOrg => reOrg !== undefined)
}
