export function stripHexPrefix(str: string): string {
  return str.startsWith('0x') ? str.slice(2) : str
}
