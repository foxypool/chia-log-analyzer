import {Dayjs} from 'dayjs'

export enum LogLevel {
  debug = 'DEBUG',
  info = 'INFO',
  warning = 'WARNING',
  error = 'ERROR',
  critical = 'CRITICAL',
}

export interface LogLine {
  date: Dayjs,
  service: string,
  file: string,
  logLevel: LogLevel,
  message: string,
}
