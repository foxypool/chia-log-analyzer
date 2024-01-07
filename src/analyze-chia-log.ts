import {mapLogFileContentsToLogLines} from './log-line-mapper.js'
import {LogLevel} from './types/log-line.js'
import {GroupedLines, groupSimilarLogLines} from './analyzer/log-level-grouping.js'
import {analyzeForSlowBlockValidation, SlowBlockValidationResult} from './analyzer/slow-block-validation.js'
import {CorruptPlot, detectCorruptPlots} from './analyzer/corrupt-plot.js'
import {detectStartupInfo, StartupInfo} from './analyzer/startup-info.js'
import {detectPlotCount} from './analyzer/plot-count.js'
import {detectSlowPlotScans, SlowPlotScan} from './analyzer/slow-plots.js'
import {detectDuplicatePlots, DuplicatePlot} from './analyzer/duplicate-plot.js'
import {detectPlotNfts, PlotNft} from './analyzer/plot-nfts.js'
import {detectReOrgs, ReOrg} from './analyzer/re-org.js'
import {detectSpSpam, SpSpam} from './analyzer/sp-spam.js'

export interface LogAnalyzationResult {
  groupedCriticalLines: GroupedLines
  groupedErrorLines: GroupedLines
  groupedWarningLines: GroupedLines
  slowBlockValidationResult: SlowBlockValidationResult
  corruptPlots: CorruptPlot[]
  startupInfo: StartupInfo
  plotCount?: number
  slowPlotScans: SlowPlotScan[]
  duplicatePlots: DuplicatePlot[]
  plotNfts: PlotNft[]
  reOrgs: ReOrg[]
  spSpams: SpSpam[]
}

export interface AnalyzeOptions {
  ignoreCriticalLogsMatching?: string[]
  ignoreErrorLogsMatching?: string[]
  ignoreWarningLogsMatching?: string[]
}

export function analyzeChiaLog(logFileContent: string, options?: AnalyzeOptions): LogAnalyzationResult {
  const logLines = mapLogFileContentsToLogLines(logFileContent)

  const criticalLogLines = logLines.filter(logLine => logLine.logLevel === LogLevel.critical)
  const errorLogLines = logLines.filter(logLine => logLine.logLevel === LogLevel.error)
  const warningLogLines = logLines.filter(logLine => logLine.logLevel === LogLevel.warning)
  const infoLogLines = logLines.filter(logLine => logLine.logLevel === LogLevel.info)
  const reversedInfoLogLines = infoLogLines
    .slice()
    .reverse()

  const groupedCriticalLines = groupSimilarLogLines(criticalLogLines, options?.ignoreCriticalLogsMatching ?? [])
  const groupedErrorLines = groupSimilarLogLines(errorLogLines, options?.ignoreErrorLogsMatching ?? [])
  const groupedWarningLines = groupSimilarLogLines(warningLogLines, options?.ignoreWarningLogsMatching ?? [])

  return {
    groupedCriticalLines,
    groupedErrorLines,
    groupedWarningLines,
    slowBlockValidationResult: analyzeForSlowBlockValidation(warningLogLines),
    corruptPlots: detectCorruptPlots(errorLogLines),
    startupInfo: detectStartupInfo(infoLogLines, reversedInfoLogLines, errorLogLines),
    plotCount: detectPlotCount(reversedInfoLogLines),
    slowPlotScans: detectSlowPlotScans(infoLogLines),
    duplicatePlots: detectDuplicatePlots(warningLogLines),
    plotNfts: detectPlotNfts(infoLogLines),
    reOrgs: detectReOrgs(infoLogLines),
    spSpams: detectSpSpam(infoLogLines),
  }
}
