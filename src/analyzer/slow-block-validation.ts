import '../extensions/array-extensions.js'

import {LogLine} from '../types/log-line.js'
import {Dayjs} from 'dayjs'

interface ValidationResult {
  min: {
    timeInSeconds: number
    date: Dayjs
  }
  max: {
    timeInSeconds: number
    date: Dayjs
  }
  averageTimeInSeconds: number
}

interface IsSlowBlockValidationResult {
  isSlow: true
  validation: ValidationResult
  preValidation: ValidationResult
}

interface IsNotSlowBlockValidationResult {
  isSlow: false
}

export type SlowBlockValidationResult = IsSlowBlockValidationResult | IsNotSlowBlockValidationResult

const slowBlockValidationRegex = /^Block validation time: ([0-9]+\.[0-9]+) seconds, pre_validation time: ([0-9]+\.[0-9]+) seconds, cost: (?:([0-9]+)|None)(?:, percent full: ([0-9]+\.[0-9]+)%)?.*$/

export function analyzeForSlowBlockValidation(warningLogLines: LogLine[]): SlowBlockValidationResult {
  const blockValidationWarnings = warningLogLines
    .mapAndFilter((logLine): BlockValidationWarning|undefined => {
      const matches = logLine.message.match(slowBlockValidationRegex)
      if (matches === null || (matches.length !== 5 && matches.length !== 3)) {
        return
      }

      return {
        date: logLine.date,
        blockValidationTimeInSeconds: parseFloat(matches[1]),
        preValidationTimeInSeconds: parseFloat(matches[2]),
        cost: matches.length === 5 ? parseInt(matches[3], 10) : undefined,
        percentFull: matches.length === 5 ? parseFloat(matches[4]) : undefined,
      }
    })

  const slowBlockValidationWarnings = blockValidationWarnings.filter(warning => warning.blockValidationTimeInSeconds >= 4)
  if (slowBlockValidationWarnings.length === 0) {
    return { isSlow: false }
  }

  const minimumValidationTime = blockValidationWarnings.reduce((min: BlockValidationWarning|undefined, curr) => {
    if (min === undefined) {
      return curr
    }

    return min.blockValidationTimeInSeconds < curr.blockValidationTimeInSeconds ? min : curr
  }, undefined) as BlockValidationWarning
  const maximumValidationTime = blockValidationWarnings.reduce((max: BlockValidationWarning|undefined, curr) => {
    if (max === undefined) {
      return curr
    }

    return max.blockValidationTimeInSeconds > curr.blockValidationTimeInSeconds ? max : curr
  }, undefined) as BlockValidationWarning
  const averageValidationTimeInSeconds = blockValidationWarnings.reduce((sum, curr) => sum + curr.blockValidationTimeInSeconds, 0) / blockValidationWarnings.length
  const minimumPreValidationTime = blockValidationWarnings.reduce((min: BlockValidationWarning|undefined, curr) => {
    if (min === undefined) {
      return curr
    }

    return min.preValidationTimeInSeconds < curr.preValidationTimeInSeconds ? min : curr
  }, undefined) as BlockValidationWarning
  const maximumPreValidationTime = blockValidationWarnings.reduce((max: BlockValidationWarning|undefined, curr) => {
    if (max === undefined) {
      return curr
    }

    return max.preValidationTimeInSeconds > curr.preValidationTimeInSeconds ? max : curr
  }, undefined) as BlockValidationWarning
  const averagePreValidationTimeInSeconds = blockValidationWarnings.reduce((sum, curr) => sum + curr.preValidationTimeInSeconds, 0) / blockValidationWarnings.length


  return {
    isSlow: true,
    validation: {
      min: {
        timeInSeconds: minimumValidationTime.blockValidationTimeInSeconds,
        date: minimumValidationTime.date,
      },
      max: {
        timeInSeconds: maximumValidationTime.blockValidationTimeInSeconds,
        date: maximumValidationTime.date,
      },
      averageTimeInSeconds: averageValidationTimeInSeconds,
    },
    preValidation: {
      min: {
        timeInSeconds: minimumPreValidationTime.blockValidationTimeInSeconds,
        date: minimumPreValidationTime.date,
      },
      max: {
        timeInSeconds: maximumPreValidationTime.blockValidationTimeInSeconds,
        date: maximumPreValidationTime.date,
      },
      averageTimeInSeconds: averagePreValidationTimeInSeconds,
    },
  }
}

interface BlockValidationWarning {
  date: Dayjs
  blockValidationTimeInSeconds: number
  preValidationTimeInSeconds: number
  cost?: number
  percentFull?: number
}
