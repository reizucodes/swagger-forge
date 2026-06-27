export function parsePathParams(path: string): string[] {
  const seen = new Set<string>()
  const result: string[] = []
  const regex = /\{(\w+)\}/g
  let match: RegExpExecArray | null
  while ((match = regex.exec(path)) !== null) {
    if (!seen.has(match[1])) {
      seen.add(match[1])
      result.push(match[1])
    }
  }
  return result
}
