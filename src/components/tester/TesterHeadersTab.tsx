import { useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { createPortal } from 'react-dom'
import { useTokenInput } from '@/hooks/useTokenInput'
import { TokenDropdown } from './TokenDropdown'

interface Header {
  id: string
  key: string
  value: string
}

interface Props {
  headers: Header[]
  onUpdate: (id: string, field: 'key' | 'value', value: string) => void
  onRemove: (id: string) => void
  onCleanup: () => void
  envNames: string[]
}

interface HeaderRowProps {
  header: Header
  onUpdate: (id: string, field: 'key' | 'value', value: string) => void
  onRemove: (id: string) => void
  onCleanup: () => void
  envNames: string[]
}

const COMMON_HEADERS = [
  { key: 'Content-Type', value: 'application/json' },
  { key: 'Accept', value: 'application/json' },
  { key: 'Authorization', value: 'Bearer {{token}}' },
  { key: 'Cache-Control', value: 'no-cache' },
  { key: 'User-Agent', value: 'MyApp/1.0' },
]

function HeaderSuggestions({ suggestions, selectedIndex, onSelect, anchorRef }: {
  suggestions: string[]
  selectedIndex: number
  onSelect: (suggestion: string) => void
  anchorRef: RefObject<HTMLInputElement | null>
}) {
  const [position, setPosition] = useState<{ left: number; top: number; width: number } | null>(null)

  useLayoutEffect(() => {
    if (suggestions.length === 0 || !anchorRef.current) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      const rect = anchorRef.current?.getBoundingClientRect()
      if (rect) setPosition({ left: rect.left, top: rect.bottom + 4, width: rect.width })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)
    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [anchorRef, suggestions.length])

  if (suggestions.length === 0 || !position) return null

  return createPortal(
    <div
      style={{ left: position.left, top: position.top, width: position.width }}
      className="fixed z-[60] bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded shadow-lg overflow-hidden"
    >
      <ul role="listbox" className="max-h-32 overflow-y-auto overscroll-contain text-xs">
        {suggestions.map((suggestion, index) => (
          <li key={suggestion} role="option" aria-selected={index === selectedIndex}>
            <button
              type="button"
              onMouseDown={event => { event.preventDefault(); onSelect(suggestion) }}
              className={`w-full text-left px-2.5 py-1.5 text-[var(--gh-text-primary)] transition ${index === selectedIndex ? 'bg-[var(--gh-accent)]/15' : 'hover:bg-[var(--gh-accent)]/10'}`}
            >
              {suggestion}
            </button>
          </li>
        ))}
      </ul>
    </div>,
    document.body,
  )
}

function HeaderRow({ header, onUpdate, onRemove, onCleanup, envNames }: HeaderRowProps) {
  const keyInputRef = useRef<HTMLInputElement>(null)
  const [keyFocused, setKeyFocused] = useState(false)
  const [keyDismissed, setKeyDismissed] = useState(false)
  const [keySuggestionIndex, setKeySuggestionIndex] = useState(0)
  const [valueFocused, setValueFocused] = useState(false)
  const [valueDismissed, setValueDismissed] = useState(false)
  const [valueSuggestionIndex, setValueSuggestionIndex] = useState(0)
  const { inputRef, syncCaret, showDropdown, filteredNames, dropdownIndex, handleKeyDown, pickName } =
    useTokenInput(header.value, v => onUpdate(header.id, 'value', v), envNames)
  const matchingHeaders = COMMON_HEADERS.filter(item =>
    item.key.toLowerCase().startsWith(header.key.trim().toLowerCase()),
  )
  const keySuggestions = keyFocused && !keyDismissed ? matchingHeaders.map(item => item.key) : []
  const valueSuggestions = valueFocused && !valueDismissed
    ? COMMON_HEADERS.filter(item => item.key.toLowerCase() === header.key.trim().toLowerCase()).map(item => item.value)
    : []

  function selectKey(key: string) {
    const suggestion = COMMON_HEADERS.find(item => item.key === key)
    onUpdate(header.id, 'key', key)
    if (suggestion) onUpdate(header.id, 'value', suggestion.value)
    setKeyDismissed(true)
    setKeyFocused(false)
  }

  function selectValue(value: string) {
    onUpdate(header.id, 'value', value)
    setValueDismissed(true)
    setValueFocused(false)
  }

  function handleKeySuggestionKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setKeyDismissed(true)
    } else if (event.key === 'ArrowDown' && keySuggestions.length > 0) {
      event.preventDefault()
      setKeySuggestionIndex(index => (index + 1) % keySuggestions.length)
    } else if (event.key === 'ArrowUp' && keySuggestions.length > 0) {
      event.preventDefault()
      setKeySuggestionIndex(index => (index - 1 + keySuggestions.length) % keySuggestions.length)
    } else if (event.key === 'Enter' && keySuggestions.length > 0) {
      event.preventDefault()
      selectKey(keySuggestions[keySuggestionIndex] ?? keySuggestions[0])
    }
  }

  function handleValueSuggestionKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') {
      event.preventDefault()
      setValueDismissed(true)
    } else if (event.key === 'ArrowDown' && valueSuggestions.length > 0) {
      event.preventDefault()
      setValueSuggestionIndex(index => (index + 1) % valueSuggestions.length)
    } else if (event.key === 'ArrowUp' && valueSuggestions.length > 0) {
      event.preventDefault()
      setValueSuggestionIndex(index => (index - 1 + valueSuggestions.length) % valueSuggestions.length)
    } else if (event.key === 'Enter' && valueSuggestions.length > 0) {
      event.preventDefault()
      selectValue(valueSuggestions[valueSuggestionIndex] ?? valueSuggestions[0])
    }
  }

  function handleValueKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === 'Escape') setValueDismissed(true)
    handleKeyDown(event)
    if (!event.defaultPrevented) handleValueSuggestionKeyDown(event)
  }

  return (
    <tr
      className="border-t border-[var(--gh-border)] align-top"
      onBlur={event => {
        const nextFocusedElement = event.relatedTarget
        if (!nextFocusedElement || !event.currentTarget.contains(nextFocusedElement)) {
          onCleanup()
        }
      }}
    >
      <td className="p-2">
        <div className="relative">
          <input
            ref={keyInputRef}
            type="text"
            value={header.key}
            onChange={e => {
              onUpdate(header.id, 'key', e.target.value)
              setKeyDismissed(false)
              setKeySuggestionIndex(0)
            }}
            onFocus={() => { setKeyFocused(true); setKeyDismissed(false) }}
            onBlur={() => setKeyFocused(false)}
            onKeyDown={handleKeySuggestionKeyDown}
            aria-label="Header key"
            aria-autocomplete="list"
            className="w-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
          />
          <HeaderSuggestions suggestions={keySuggestions} selectedIndex={keySuggestionIndex} onSelect={selectKey} anchorRef={keyInputRef} />
        </div>
      </td>
      <td className="p-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={header.value}
            onChange={e => { onUpdate(header.id, 'value', e.target.value); syncCaret() }}
            onKeyDown={handleValueKeyDown}
            onSelect={syncCaret}
            onFocus={() => { syncCaret(); setValueFocused(true); setValueDismissed(false) }}
            onBlur={() => setValueFocused(false)}
            aria-label="Header value"
            aria-autocomplete="list"
            className="w-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1 text-xs text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
          />
          <HeaderSuggestions suggestions={valueSuggestions} selectedIndex={valueSuggestionIndex} onSelect={selectValue} anchorRef={inputRef} />
          {showDropdown && (
            <TokenDropdown names={filteredNames} selectedIndex={dropdownIndex} onPick={pickName} />
          )}
        </div>
      </td>
      <td className="w-12 p-2 text-center">
        <button
          type="button"
          onClick={() => onRemove(header.id)}
          aria-label="Remove header"
          className="p-1 text-[var(--gh-text-secondary)] hover:text-[var(--gh-danger)] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)] rounded"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </td>
    </tr>
  )
}

export function TesterHeadersTab({ headers, onUpdate, onRemove, onCleanup, envNames }: Props) {
  return (
    <div className="p-3 space-y-3">
      {headers.length === 0 && (
        <p className="text-sm text-[var(--gh-text-secondary)]">No headers added.</p>
      )}
      {headers.length > 0 && (
        <div className="overflow-x-auto rounded border border-[var(--gh-border)]">
          <table className="w-full min-w-[32rem] border-collapse text-left">
            <caption className="sr-only">Request headers</caption>
            <colgroup>
              <col className="w-[34%]" />
              <col />
              <col className="w-12" />
            </colgroup>
            <thead className="bg-[var(--gh-canvas-subtle)]">
              <tr>
                <th scope="col" className="border-b border-[var(--gh-border)] px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--gh-text-secondary)]">Key</th>
                <th scope="col" className="border-b border-[var(--gh-border)] px-2 py-1 text-[11px] font-medium uppercase tracking-wide text-[var(--gh-text-secondary)]">Value</th>
                <th scope="col" className="border-b border-[var(--gh-border)] px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide text-[var(--gh-text-secondary)]">Actions</th>
              </tr>
            </thead>
            <tbody>
              {headers.map(h => (
                <HeaderRow key={h.id} header={h} onUpdate={onUpdate} onRemove={onRemove} onCleanup={onCleanup} envNames={envNames} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
