import {LogLine} from '../types/log-line.js'
import {Dayjs} from 'dayjs'

const chiaVersionRegex = /^chia-blockchain version: ([0-9.]+)$/
const foxyFarmerVersionRegex = /^Foxy-Farmer ([0-9.]+).*$/
const foxyGhFarmerVersionRegex = /^Foxy-GH-Farmer ([0-9.]+).*$/
const connectedToOgMessageStart = 'Connected to OG pool'
const notOgPoolingMessageStart = 'Not OG pooling as'
const ogPoolInfoTimeoutMessageStart = 'Timed out while retrieving OG pool info'
const ogPoolInfoErrorMessageStart = 'Error connecting to the OG pool'
const daemonStartupMessage = 'Starting Daemon Server'

export interface StartupInfo {
  lastDaemonStart?: Dayjs
  chiaVersion?: string
  isOgRelease: boolean
  isOgPooling: boolean
  foxyFarmerVersion?: string
  foxyGhFarmerVersion?: string
}

export function detectStartupInfo(infoLogLines: LogLine[], errorLogLines: LogLine[]): StartupInfo {
  const reversedInfoLogLines = infoLogLines
    .slice()
    .reverse()
  const lastDaemonStartupLogLine = reversedInfoLogLines.find(logLine => logLine.message === daemonStartupMessage)

  const isOgRelease = reversedInfoLogLines
    .some(logLine => logLine.message.startsWith(connectedToOgMessageStart) || logLine.message.startsWith(notOgPoolingMessageStart))
    || errorLogLines
      .some(logLine => logLine.message.startsWith(ogPoolInfoTimeoutMessageStart) || logLine.message.startsWith(ogPoolInfoErrorMessageStart))
  const isOgPooling = isOgRelease && reversedInfoLogLines.some(logLine => logLine.message.startsWith(connectedToOgMessageStart))

  const chiaVersion = reversedInfoLogLines
    .map(logLine => {
      const matches = logLine.message.match(chiaVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    })
    .find(chiaVersion => chiaVersion !== undefined)

  const foxyFarmerVersion = reversedInfoLogLines
    .map(logLine => {
      const matches = logLine.message.match(foxyFarmerVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    })
    .find(foxyFarmerVersion => foxyFarmerVersion !== undefined)

  const foxyGhFarmerVersion = reversedInfoLogLines
    .map(logLine => {
      const matches = logLine.message.match(foxyGhFarmerVersionRegex)
      if (matches === null || matches.length !== 2) {
        return
      }

      return matches[1]
    })
    .find(foxyGhFarmerVersion => foxyGhFarmerVersion !== undefined)

  return {
    lastDaemonStart: lastDaemonStartupLogLine?.date,
    chiaVersion,
    isOgRelease,
    isOgPooling,
    foxyFarmerVersion,
    foxyGhFarmerVersion,
  }
}
