import {LogLine} from '../types/log-line.js'
import {toChiaLogDate} from '../util/to-chia-log-date.js'

const spFinishedLogLineMatcher = 'Finished signage point'

export interface SpSpam {
  durationInMs: number
  spCount: number
  minimumDurationInMsBetweenSps: number
  maximumDurationInMsBetweenSps: number
  fromRawDate: string
  toRawDate: string
}

export function detectSpSpam(infoLogLines: LogLine[]): SpSpam[] {
  const spFinishedLogLines = infoLogLines
    .filter(logLine => logLine.file === 'chia.full_node.full_node' && logLine.message.indexOf(spFinishedLogLineMatcher) !== -1)
  const spSpams: SpSpam[] = []
  let currentSpam: LogLine[] = []

  const addCurrentSpamToResult = () => {
    if (currentSpam.length < 4) {
      currentSpam = []

      return
    }
    const minimumDurationInMsBetweenSps = currentSpam.reduce((minimumDuration, logLine, index) => {
      const nextLogLine = currentSpam.at(index + 1)
      if (nextLogLine === undefined) {
        return minimumDuration
      }
      const diff = nextLogLine.date.diff(logLine.date, 'ms')
      if (minimumDuration === undefined) {
        return diff
      }

      return minimumDuration < diff ? minimumDuration : diff
    }, undefined) as number
    const maximumDurationInMsBetweenSps = currentSpam.reduce((maximumDuration, logLine, index) => {
      const nextLogLine = currentSpam.at(index + 1)
      if (nextLogLine === undefined) {
        return maximumDuration
      }
      const diff = nextLogLine.date.diff(logLine.date, 'ms')
      if (maximumDuration === undefined) {
        return diff
      }

      return maximumDuration > diff ? maximumDuration : diff
    }, undefined) as number
    const lastEntry = currentSpam.at(-1) as LogLine
    spSpams.push({
      durationInMs: lastEntry.date.diff(currentSpam[0].date, 'ms'),
      spCount: currentSpam.length,
      minimumDurationInMsBetweenSps,
      maximumDurationInMsBetweenSps,
      fromRawDate: toChiaLogDate(currentSpam[0].date),
      toRawDate: toChiaLogDate(lastEntry.date),
    })
    currentSpam = []
  }

  spFinishedLogLines.forEach((logLine, index) => {
    const nextSpLogLine = spFinishedLogLines.at(index + 1)
    if (nextSpLogLine === undefined) {
      addCurrentSpamToResult()

      return
    }
    const isTooClose = nextSpLogLine.date.diff(logLine.date, 'ms') < 3000
    if (!isTooClose) {
      addCurrentSpamToResult()

      return
    }
    if (currentSpam.length === 0) {
      currentSpam.push(logLine)
    }
    currentSpam.push(nextSpLogLine)
  })

  return spSpams
}
