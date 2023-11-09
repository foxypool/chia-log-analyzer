import dayjs from 'dayjs'
import {LogLevel, LogLine} from './types/log-line.js'

const logLineTimestampRegex = /^([0-9-]+T[0-9:.]+)/
export function mapLogFileContentsToLogLines(logFileContents: string): LogLine[] {
   const lines = logFileContents
    .trim()
    .split('\n')

  const logLines: string[] = []
  for (const line of lines) {
    if (line.match(logLineTimestampRegex) === null) {
      if (logLines.length >= 0) {
        logLines[logLines.length -1] = `${logLines[logLines.length - 1]}\n${line}`

        continue
      }
    }
    logLines.push(line)
  }

  return logLines
    .map(mapToLogLine)
    .filter((logLine): logLine is LogLine => logLine !== undefined)
}


const logLineRegex = /^([0-9-]+T[0-9:.]+) ([a-z._]+) ([a-z._]+)\s*: ([A-Z]+) \s*((?:.|\s)*)$/
function mapToLogLine(line: string): LogLine|undefined {
  const matches = line.trim().match(logLineRegex)
  if (matches === null || matches.length !== 6) {
    return
  }

  return {
    date: dayjs(matches[1]),
    service: matches[2],
    file: matches[3],
    logLevel: matches[4] as LogLevel,
    message: matches[5],
  }
}
