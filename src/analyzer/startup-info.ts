import {LogLine} from '../types/log-line.js'
import {Dayjs} from 'dayjs'
import {mapFind} from '../util/map-find.js'

const chiaVersionRegex = /^chia-blockchain version: ([0-9.]+)$/
const foxyFarmerVersionRegex = /^Foxy-Farmer ([0-9.]+).*$/
const foxyGhFarmerVersionRegex = /^Foxy-GH-Farmer ([0-9.]+).*$/
const startingServiceRegex = /^Starting service (\w+) \.\.\.$/
const databaseInfoRegex = /^using blockchain database (.+), which is version (\d+)$/
const connectedToOgMessageStart = 'Connected to OG pool'
const notOgPoolingMessageStart = 'Not OG pooling as'
const ogPoolInfoTimeoutMessageStart = 'Timed out while retrieving OG pool info'
const ogPoolInfoErrorMessageStart = 'Error connecting to the OG pool'
const daemonStartupMessage = 'Starting Daemon Server'

export interface DatabaseInfo {
  path: string
  version: number
}

export interface StartupInfo {
  lastDaemonStart?: Dayjs
  runningDurationInMs?: number
  startedServices: string[]
  chiaVersion?: string
  isOgRelease: boolean
  isOgPooling: boolean
  foxyFarmerVersion?: string
  foxyGhFarmerVersion?: string
  databaseInfo?: DatabaseInfo
}

export function detectStartupInfo(infoLogLines: LogLine[], reversedInfoLogLines: LogLine[], errorLogLines: LogLine[]): StartupInfo {
  const latestLogLine = reversedInfoLogLines.at(0)
  const lastDaemonStartupLogLineIndex = reversedInfoLogLines.findIndex(logLine => logLine.message.startsWith(daemonStartupMessage))
  const lastDaemonStartupLogLine = lastDaemonStartupLogLineIndex !== -1 ? reversedInfoLogLines[lastDaemonStartupLogLineIndex] : undefined
  let runningDurationInMs: number|undefined
  if (latestLogLine !== undefined && lastDaemonStartupLogLine != undefined) {
    runningDurationInMs = latestLogLine.date.diff(lastDaemonStartupLogLine.date, 'ms')
  }

  const infoLogLinesSinceStartup = lastDaemonStartupLogLineIndex === -1 ? infoLogLines : reversedInfoLogLines.slice(0, lastDaemonStartupLogLineIndex + 3).reverse()

  const isOgRelease = infoLogLinesSinceStartup
    .some(logLine => logLine.message.startsWith(connectedToOgMessageStart) || logLine.message.startsWith(notOgPoolingMessageStart))
    || errorLogLines
      .some(logLine => logLine.message.startsWith(ogPoolInfoTimeoutMessageStart) || logLine.message.startsWith(ogPoolInfoErrorMessageStart))
  const isOgPooling = isOgRelease && infoLogLinesSinceStartup.some(logLine => logLine.message.startsWith(connectedToOgMessageStart))

  const chiaVersion = mapFind(
    infoLogLinesSinceStartup,
    logLine => {
      const matches = logLine.message.match(chiaVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    },
    chiaVersion => chiaVersion !== undefined,
  )

  const foxyFarmerVersion = mapFind(
    infoLogLinesSinceStartup,
    logLine => {
      const matches = logLine.message.match(foxyFarmerVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    },
    foxyFarmerVersion => foxyFarmerVersion !== undefined,
  )

  const foxyGhFarmerVersion = mapFind(
    infoLogLinesSinceStartup,
    logLine => {
      const matches = logLine.message.match(foxyGhFarmerVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    },
    foxyGhFarmerVersion => foxyGhFarmerVersion !== undefined,
  )

  const startedServices = infoLogLines
    .map(logLine => {
      const matches = logLine.message.match(startingServiceRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    })
    .filter((serviceName): serviceName is string => serviceName !== undefined)

  const databaseInfo = mapFind<LogLine, DatabaseInfo|undefined>(
    infoLogLinesSinceStartup,
    logLine => {
      const matches = logLine.message.match(databaseInfoRegex)
      if (matches === null || matches.length !== 3) {
        return
      }

      return {
        path: matches[1],
        version: parseInt(matches[2], 10),
      }
    },
    databaseInfo => databaseInfo !== undefined,
  )

  return {
    lastDaemonStart: lastDaemonStartupLogLine?.date,
    runningDurationInMs,
    startedServices: [...new Set(startedServices)],
    chiaVersion,
    isOgRelease,
    isOgPooling,
    foxyFarmerVersion,
    foxyGhFarmerVersion,
    databaseInfo,
  }
}
