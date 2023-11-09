import {bech32m} from 'bech32'
import {stripHexPrefix} from './hex.js'

export function convertPuzzleHashToAddress(puzzleHash: string): string {
  const words = bech32m.toWords(Buffer.from(stripHexPrefix(puzzleHash), 'hex'))

  return bech32m.encode('xch', words)
}
