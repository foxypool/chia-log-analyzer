import {LogLine} from '../types/log-line.js'
import {convertPuzzleHashToAddress} from '../util/puzzle-hash.js'

const plotNftRegex = /^Added pool: ({(?:.|\s)*})$/

export interface PlotNft {
  launcherId: string
  poolContractAddress: string
  poolUrl?: string
  payoutAddress: string
}

export function detectPlotNfts(infoLogLines: LogLine[]): PlotNft[] {
  const plotNfts = infoLogLines
    .map((logLine): PlotNft|undefined => {
      if (logLine.file !== 'chia.farmer.farmer') {
        return
      }
      const matches = logLine.message.match(plotNftRegex)
      if (matches === null || matches.length !== 2) {
        return
      }
      let plotNft: any
      try {
        plotNft = JSON.parse(matches[1].trim().replaceAll(`'`,'"'))
      } catch (_) {
        return
      }
      let payoutAddress = plotNft.payout_instructions
      try {
        payoutAddress = convertPuzzleHashToAddress(plotNft.payout_instructions)
      } catch (_) { /* pass */ }

      return {
        launcherId: plotNft.launcher_id,
        poolContractAddress: convertPuzzleHashToAddress(plotNft.p2_singleton_puzzle_hash),
        poolUrl: plotNft.pool_url === '' ? undefined : plotNft.pool_url,
        payoutAddress,
      }
    })
    .filter((plotNft): plotNft is PlotNft => plotNft !== undefined)
    .reduce((agg, plotNft) => {
      agg.set(plotNft.launcherId, plotNft)

      return agg
    }, new Map<string, PlotNft>)

  return [...plotNfts.values()]
}
