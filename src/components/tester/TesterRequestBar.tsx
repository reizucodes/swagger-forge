import { useState, useRef, useEffect } from 'react'
import type { HttpMethod } from '@/domain/endpoint/models/enums'
import { useTokenInput } from '@/hooks/useTokenInput'
import { TokenDropdown } from './TokenDropdown'

const _measureCanvas = typeof document !== 'undefined' ? document.createElement('canvas') : null

function getCharIndexFromX(input: HTMLInputElement, clientX: number): number {
  if (!_measureCanvas) return 0
  const ctx = _measureCanvas.getContext('2d')
  if (!ctx) return 0
  const cs = window.getComputedStyle(input)
  ctx.font = `${cs.fontSize} ${cs.fontFamily}`
  const rect = input.getBoundingClientRect()
  const paddingLeft = parseFloat(cs.paddingLeft)
  const targetX = clientX - rect.left - paddingLeft + input.scrollLeft
  const text = input.value
  let lo = 0, hi = text.length
  while (lo < hi) {
    const mid = (lo + hi) >> 1
    if (ctx.measureText(text.slice(0, mid + 1)).width <= targetX) lo = mid + 1
    else hi = mid
  }
  return lo
}

function findTokenAtIndex(url: string, idx: number): { name: string; tokenStart: number } | null {
  const re = /\{\{([^}]*)\}\}/g
  let m: RegExpExecArray | null
  while ((m = re.exec(url)) !== null) {
    if (idx >= m.index && idx < m.index + m[0].length) {
      return { name: m[1].trim(), tokenStart: m.index }
    }
  }
  return null
}

function getTokenAnchorX(input: HTMLInputElement, tokenStart: number): number {
  if (!_measureCanvas) return 0
  const ctx = _measureCanvas.getContext('2d')
  if (!ctx) return 0
  const cs = window.getComputedStyle(input)
  ctx.font = `${cs.fontSize} ${cs.fontFamily}`
  const rect = input.getBoundingClientRect()
  const paddingLeft = parseFloat(cs.paddingLeft)
  const textBefore = input.value.slice(0, tokenStart)
  return rect.left + paddingLeft + ctx.measureText(textBefore).width - input.scrollLeft
}

interface Props {
  method: HttpMethod
  url: string
  isSending: boolean
  onMethodChange: (m: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
  envNames?: string[]
  envMap?: Record<string, string>
  onUpdateEnvValue?: (name: string, value: string) => void
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  get:    'text-blue-400',
  post:   'text-green-400',
  put:    'text-yellow-400',
  patch:  'text-orange-400',
  delete: 'text-red-400',
}

const METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete']

function renderHighlightedUrl(url: string, envMap: Record<string, string> = {}) {
  const parts = url.split(/({{[^}]*}})/g)
  return parts.map((part, i) => {
    const m = part.match(/^{{(.*)}}$/)
    if (m) {
      const name = m[1].trim()
      const isDefined = Object.prototype.hasOwnProperty.call(envMap, name)
      return (
        <span key={i} className={isDefined
          ? 'text-green-400 bg-green-400/15 rounded-sm'
          : 'text-orange-400 bg-orange-400/15 rounded-sm'
        }>{part}</span>
      )
    }
    return <span key={i}>{part}</span>
  })
}


type PopoverState = {
  name: string
  value: string
  anchorX: number
  anchorY: number
  isDefined: boolean
}

export function TesterRequestBar({ method, url, isSending, onMethodChange, onUrlChange, onSend, envNames = [], envMap, onUpdateEnvValue }: Props) {
  const { inputRef, syncCaret, showDropdown, filteredNames, dropdownIndex, handleKeyDown, pickName } =
    useTokenInput(url, onUrlChange, envNames)
  const [popover, setPopover] = useState<PopoverState | null>(null)
  const hideTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const rafRef = useRef<number | null>(null)

  useEffect(() => {
    if (popover && envMap) {
      const fresh = envMap[popover.name]
      if (fresh !== undefined && fresh !== popover.value) {
        setPopover(prev => prev ? { ...prev, value: fresh } : null)
      }
    }
  }, [envMap])

  function scheduleHide() {
    hideTimerRef.current = setTimeout(() => setPopover(null), 200)
  }

  return (
    <div className="border-b border-[var(--gh-border)]">
    <div className="flex flex-wrap gap-2 p-3">
      <select
        value={method}
        onChange={e => onMethodChange(e.target.value as HttpMethod)}
        className={`bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm font-mono font-semibold focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] ${METHOD_COLORS[method]}`}
      >
        {METHODS.map(m => (
          <option key={m} value={m} className={METHOD_COLORS[m]}>
            {m.toUpperCase()}
          </option>
        ))}
      </select>
      <div className="flex-1 min-w-0 relative bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded focus-within:ring-1 focus-within:ring-[var(--gh-accent)] focus-within:border-[var(--gh-accent)]/50">
        <div
          aria-hidden="true"
          className="absolute inset-0 flex items-center px-2 py-1.5 text-sm pointer-events-none overflow-hidden whitespace-pre text-[var(--gh-text-primary)]"
        >
          {renderHighlightedUrl(url, envMap ?? {})}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={url}
          onChange={e => { onUrlChange(e.target.value); syncCaret() }}
          onKeyDown={handleKeyDown}
          onSelect={syncCaret}
          onFocus={syncCaret}
          onMouseMove={e => {
            if (rafRef.current !== null) return
            const clientX = e.clientX
            rafRef.current = requestAnimationFrame(() => {
              rafRef.current = null
              const input = inputRef.current
              if (!input) return
              const idx = getCharIndexFromX(input, clientX)
              const token = findTokenAtIndex(url, idx)
              if (token) {
                if (hideTimerRef.current) clearTimeout(hideTimerRef.current)
                const rect = input.getBoundingClientRect()
                const anchorX = getTokenAnchorX(input, token.tokenStart)
                const anchorY = rect.bottom
                const isDefined = Object.prototype.hasOwnProperty.call(envMap ?? {}, token.name)
                const currentValue = isDefined ? (envMap ?? {})[token.name] : ''
                setPopover(prev =>
                  prev?.name === token.name ? prev : { name: token.name, value: currentValue, anchorX, anchorY, isDefined }
                )
              } else {
                scheduleHide()
              }
            })
          }}
          onMouseLeave={() => scheduleHide()}
          placeholder="https://api.example.com/users/1"
          style={{ caretColor: 'var(--gh-text-primary)', color: 'transparent' }}
          className="relative w-full bg-transparent border-0 px-2 py-1.5 text-sm placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-0"
        />
        {popover && (
          <div
            style={{ position: 'fixed', left: popover.anchorX, top: popover.anchorY + 6, zIndex: 9999, minWidth: '220px', maxWidth: '320px' }}
            onMouseEnter={() => { if (hideTimerRef.current) clearTimeout(hideTimerRef.current) }}
            onMouseLeave={() => setPopover(null)}
            className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg shadow-xl p-3 flex flex-col gap-2"
          >
            {popover.isDefined ? (
              <input
                type="text"
                value={popover.value}
                onChange={e => {
                  const v = e.target.value
                  setPopover(prev => prev ? { ...prev, value: v } : null)
                  onUpdateEnvValue?.(popover.name, v)
                }}
                onKeyDown={e => { if (e.key === 'Enter') setPopover(null) }}
                className="w-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
              />
            ) : (
              <p className="text-xs text-[var(--gh-text-secondary)]">Variable not defined in Environment.</p>
            )}
            <div className="flex items-center gap-1.5 text-xs text-[var(--gh-text-secondary)]">
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-sm bg-green-600 text-white text-[9px] font-bold shrink-0">E</span>
              <span>Environment</span>
            </div>
          </div>
        )}
        {showDropdown && (
          <TokenDropdown names={filteredNames} selectedIndex={dropdownIndex} onPick={pickName} />
        )}
      </div>
      <button
        onClick={onSend}
        disabled={isSending || !url.trim()}
        className="px-4 py-1.5 rounded bg-[var(--gh-accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
    </div>
  )
}
