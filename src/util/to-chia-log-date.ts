import {Dayjs} from 'dayjs'

export function toChiaLogDate(date: Dayjs): string {
  return date.format('YYYY-MM-DDTHH:mm:ss.SSS')
}
