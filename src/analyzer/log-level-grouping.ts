import {LogLine} from '../types/log-line.js'
import {distance} from 'fastest-levenshtein'

const messageLengthForGrouping = 64
const maxDistance = messageLengthForGrouping - Math.round(messageLengthForGrouping * 0.8)

export type GroupedLines = Map<string, LogLine[]>

export function groupSimilarLogLines(logLines: LogLine[]): GroupedLines {
  return logLines
    .reduce((logLineGroups, logLine) => {
      const logLineGroup = `${logLine.service}:${logLine.file}:${logLine.message.slice(0, messageLengthForGrouping)}`
      const matchingLogLineGroup = Array.from(logLineGroups.keys())
        .find(currLogLineGroup => distance(currLogLineGroup, logLineGroup) <= maxDistance)
      if (matchingLogLineGroup === undefined) {
        logLineGroups.set(logLineGroup, [logLine])
      } else {
        const logLines = logLineGroups.get(matchingLogLineGroup) as LogLine[]
        logLines.push(logLine)
      }

      return logLineGroups
    }, new Map<string, LogLine[]>())
}
