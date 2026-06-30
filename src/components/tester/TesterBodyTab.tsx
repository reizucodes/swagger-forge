import { useMemo, useRef, useState } from 'react'
import type { HttpMethod } from '@/domain/endpoint/models/enums'
import { JSON_ERROR_DEFS } from '@/domain/endpoint/tester/editor/jsonErrors'
import type { JsonErrorKind } from '@/domain/endpoint/tester/editor/jsonErrors'
import { PAIR_MAP, SMART_ENTER_SET, SKIP_CLOSE_SET, SKIP_QUOTE_SET } from '@/domain/endpoint/tester/editor/editorRules'
import { EDITOR_CONFIG } from '@/domain/endpoint/tester/editor/editorConfig'

interface Props {
  method: HttpMethod
  body: string
  onChange: (body: string) => void
}

const BODY_METHODS: HttpMethod[] = ['post', 'put', 'patch']

function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function findDuplicateRanges(jsonStr: string): { start: number; end: number }[] {
  const keyRegex = /"((?:[^"\\]|\\.)*)"\s*:/g
  const seen = new Map<string, number>()
  const all: { key: string; start: number; keyEnd: number }[] = []
  let m
  while ((m = keyRegex.exec(jsonStr)) !== null) {
    const key = m[1]
    seen.set(key, (seen.get(key) ?? 0) + 1)
    // Include the closing quote of the key, but not the colon
    const keyEnd = m.index + m[0].indexOf(':')
    all.push({ key, start: m.index, keyEnd })
  }
  const dups = new Set([...seen.entries()].filter(([, c]) => c > 1).map(([k]) => k))
  return all.filter(a => dups.has(a.key)).map(a => ({ start: a.start, end: a.keyEnd }))
}

type TokenKind = 'key' | 'string' | 'number' | 'bool' | 'null' | 'punctuation' | 'space' | 'unknown'

function tokenizeJson(str: string): { kind: TokenKind; value: string; start: number }[] {
  const tokens: { kind: TokenKind; value: string; start: number }[] = []
  let i = 0
  while (i < str.length) {
    const ch = str[i]
    if (/\s/.test(ch)) {
      let j = i + 1
      while (j < str.length && /\s/.test(str[j])) j++
      tokens.push({ kind: 'space', value: str.slice(i, j), start: i })
      i = j; continue
    }
    if (ch === '"') {
      let j = i + 1
      while (j < str.length && str[j] !== '"') {
        if (str[j] === '\\') j++
        j++
      }
      if (j < str.length) j++
      let k = j
      while (k < str.length && (str[k] === ' ' || str[k] === '\t')) k++
      const kind: TokenKind = str[k] === ':' ? 'key' : 'string'
      tokens.push({ kind, value: str.slice(i, j), start: i })
      i = j; continue
    }
    if (str.startsWith('true', i)) { tokens.push({ kind: 'bool', value: 'true', start: i }); i += 4; continue }
    if (str.startsWith('false', i)) { tokens.push({ kind: 'bool', value: 'false', start: i }); i += 5; continue }
    if (str.startsWith('null', i)) { tokens.push({ kind: 'null', value: 'null', start: i }); i += 4; continue }
    const numM = str.slice(i).match(/^-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?/)
    if (numM) {
      tokens.push({ kind: 'number', value: numM[0], start: i })
      i += numM[0].length; continue
    }
    if ('{}[],:'.includes(ch)) {
      tokens.push({ kind: 'punctuation', value: ch, start: i })
      i++; continue
    }
    const wordM = str.slice(i).match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)
    if (wordM) {
      tokens.push({ kind: 'unknown', value: wordM[0], start: i })
      i += wordM[0].length; continue
    }
    tokens.push({ kind: 'unknown', value: ch, start: i })
    i++
  }
  return tokens
}

const TOKEN_COLORS: Record<TokenKind, string> = {
  key: '#7dd3fc',
  string: '#fdba74',
  number: '#86efac',
  bool: '#c4b5fd',
  null: '#c4b5fd',
  punctuation: '#94a3b8',
  space: '',
  unknown: '#94a3b8',
}

function findTrailingCommaRanges(str: string): { start: number; end: number }[] {
  const ranges: { start: number; end: number }[] = []
  const re = /,(\s*)[}\]]/g
  let m
  while ((m = re.exec(str)) !== null) {
    ranges.push({ start: m.index, end: m.index + 1 })
  }
  return ranges
}

function buildMirrorHtml(
  text: string,
  dupRanges: { start: number; end: number }[],
  trailingRanges: { start: number; end: number }[],
): string {
  const tokens = tokenizeJson(text)
  const dupStarts = new Set(dupRanges.map(r => r.start))
  const trailingStarts = new Set(trailingRanges.map(r => r.start))
  return tokens.map(({ kind, value, start }) => {
    const escaped = escapeHtml(value)
    const color = TOKEN_COLORS[kind]
    const errorKind: JsonErrorKind | null =
      kind === 'key' && dupStarts.has(start) ? 'duplicateKey' :
      kind === 'punctuation' && value === ',' && trailingStarts.has(start) ? 'trailingComma' :
      kind === 'unknown' ? 'unquotedString' :
      null
    if (errorKind) {
      const { tip, squiggleColor } = JSON_ERROR_DEFS[errorKind]
      const tokenColor = color ? `color:${color};` : ''
      return `<mark data-tip="${tip}" style="background:transparent;${tokenColor}text-decoration:underline wavy ${squiggleColor}">${escaped}</mark>`
    }
    const style = color ? `color:${color}` : ''
    if (!style) return escaped
    return `<span style="${style}">${escaped}</span>`
  }).join('')
}

function getLineIndent(text: string, pos: number): string {
  const lineStart = text.lastIndexOf('\n', pos - 1) + 1
  const line = text.slice(lineStart, pos)
  const spaces = line.match(/^(\s*)/)?.[1] ?? ''
  return spaces
}

export function TesterBodyTab({ method, body, onChange }: Props) {
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const mirrorRef = useRef<HTMLPreElement>(null)
  const [tooltip, setTooltip] = useState<{ x: number; y: number; text: string } | null>(null)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const mirror = mirrorRef.current
    const textarea = textareaRef.current
    if (!mirror || !textarea) return
    textarea.style.pointerEvents = 'none'
    mirror.style.pointerEvents = 'auto'
    const el = document.elementFromPoint(e.clientX, e.clientY)
    textarea.style.pointerEvents = ''
    mirror.style.pointerEvents = 'none'
    const tip = el?.tagName === 'MARK' && el.closest('pre') === mirror
      ? (el as HTMLElement).getAttribute('data-tip')
      : null
    setTooltip(tip ? { x: e.clientX, y: e.clientY, text: tip } : null)
  }

  const dupRanges = useMemo(() => {
    if (!body.trim()) return []
    return findDuplicateRanges(body)
  }, [body])

  const trailingRanges = useMemo(() => {
    if (!body.trim()) return []
    return findTrailingCommaRanges(body)
  }, [body])

  if (!BODY_METHODS.includes(method)) {
    return (
      <div className="p-3">
        <p className="text-sm text-[var(--gh-text-secondary)]">
          Request body is not applicable for {method.toUpperCase()} requests.
        </p>
      </div>
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current
    if (!textarea) return

    const { selectionStart: start, selectionEnd: end } = textarea
    const value = textarea.value

    if (e.key === 'Tab') {
      e.preventDefault()
      const tab = EDITOR_CONFIG.indentChar.repeat(EDITOR_CONFIG.tabSize)
      const newValue = value.slice(0, start) + tab + value.slice(end)
      onChange(newValue)
      const caretPos = start + tab.length
      requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
      return
    }

    if (e.key === 'Enter') {
      e.preventDefault()
      const charBefore = value[start - 1]
      const indent = getLineIndent(value, start)
      const tab = EDITOR_CONFIG.indentChar.repeat(EDITOR_CONFIG.tabSize)
      if (SMART_ENTER_SET.has(charBefore)) {
        const insertion = '\n' + indent + tab + '\n' + indent
        const newValue = value.slice(0, start) + insertion + value.slice(end)
        onChange(newValue)
        const caretPos = start + 1 + indent.length + tab.length
        requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
      } else {
        const insertion = '\n' + indent
        const newValue = value.slice(0, start) + insertion + value.slice(end)
        onChange(newValue)
        const caretPos = start + 1 + indent.length
        requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
      }
      return
    }

    if (e.key === 'Backspace' && start === end && start > 0) {
      const charBefore = value[start - 1]
      const charAfter = value[start]
      if (PAIR_MAP[charBefore] === charAfter) {
        e.preventDefault()
        const newValue = value.slice(0, start - 1) + value.slice(start + 1)
        onChange(newValue)
        const caretPos = start - 1
        requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
      }
      return
    }

    const closing = PAIR_MAP[e.key]
    if (closing !== undefined) {
      e.preventDefault()
      if (SKIP_QUOTE_SET.has(e.key) && value[start] === e.key) {
        const caretPos = start + 1
        requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
        return
      }
      const newValue = value.slice(0, start) + e.key + closing + value.slice(end)
      onChange(newValue)
      const caretPos = start + 1
      requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
      return
    }

    if (SKIP_CLOSE_SET.has(e.key) && value[start] === e.key) {
      e.preventDefault()
      const caretPos = start + 1
      requestAnimationFrame(() => textarea.setSelectionRange(caretPos, caretPos))
    }
  }

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(body)
      onChange(JSON.stringify(parsed, null, 2))
    } catch {
    }
  }

  return (
    <div className="p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-[var(--gh-text-secondary)]">Raw JSON</span>
        <button
          onClick={handlePrettify}
          className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80 transition"
        >
          Prettify
        </button>
      </div>
      <div
        className="relative w-full min-h-[8rem] h-40 bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded resize-y overflow-hidden"
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setTooltip(null)}
      >
        <pre
          ref={mirrorRef}
          aria-hidden
          className="absolute inset-0 overflow-hidden pointer-events-none select-none p-2 text-sm font-mono whitespace-pre-wrap break-all m-0"
          dangerouslySetInnerHTML={{ __html: buildMirrorHtml(body, dupRanges, trailingRanges) }}
        />
        <textarea
          ref={textareaRef}
          value={body}
          onChange={e => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onScroll={e => { if (mirrorRef.current) mirrorRef.current.scrollTop = (e.target as HTMLTextAreaElement).scrollTop }}
          placeholder='{"key": "value"}'
          className="relative w-full h-full min-h-[8rem] bg-transparent p-2 text-sm font-mono focus:outline-none resize-none"
          style={{ color: 'transparent', caretColor: '#e2e8f0' }}
        />
      </div>
      {tooltip && (
        <div
          className="fixed z-50 rounded px-2 py-1 text-xs font-mono pointer-events-none shadow-md"
          style={{
            left: tooltip.x + 14,
            top: tooltip.y - 10,
            background: '#1f2937',
            border: '1px solid var(--gh-border)',
            color: 'var(--gh-text)',
          }}
        >
          {tooltip?.text}
        </div>
      )}
      <p className="text-xs text-[var(--gh-text-secondary)]">
        Only JSON body is supported. <span className="opacity-70">Multipart/form-data is not supported in this version.</span>
      </p>
    </div>
  )
}
