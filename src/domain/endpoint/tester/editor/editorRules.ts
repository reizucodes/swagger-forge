export interface EditorPair {
  open: string
  close: string
  smartEnter?: boolean  // indent-newline-dedent on Enter typed after open
  skipClose?: boolean   // skip cursor over existing close bracket instead of inserting
  skipQuote?: boolean   // skip cursor over matching quote (symmetric pairs)
}

export const EDITOR_PAIRS: EditorPair[] = [
  { open: '{', close: '}', smartEnter: true, skipClose: true },
  { open: '[', close: ']', smartEnter: true, skipClose: true },
  { open: '"', close: '"', skipQuote: true },
  { open: "'", close: "'", skipQuote: true },
]

export const PAIR_MAP: Record<string, string> =
  Object.fromEntries(EDITOR_PAIRS.map(p => [p.open, p.close]))

export const SMART_ENTER_SET = new Set(
  EDITOR_PAIRS.filter(p => p.smartEnter).map(p => p.open),
)

export const SKIP_CLOSE_SET = new Set(
  EDITOR_PAIRS.filter(p => p.skipClose).map(p => p.close),
)

export const SKIP_QUOTE_SET = new Set(
  EDITOR_PAIRS.filter(p => p.skipQuote).map(p => p.open),
)
