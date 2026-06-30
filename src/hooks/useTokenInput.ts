import { useState, useRef, useEffect } from 'react'

function getActiveToken(value: string, caretPos: number): { partial: string; tokenStart: number } | null {
  const before = value.slice(0, caretPos)
  const after = value.slice(caretPos)
  const openIdx = before.lastIndexOf('{{')
  if (openIdx === -1) return null
  const between = before.slice(openIdx + 2)
  if (between.includes('}}')) return null
  // cursor is inside a complete {{...}} token — no suggestion needed
  const closeAhead = after.indexOf('}}')
  const openAhead = after.indexOf('{{')
  if (closeAhead > 0 && (openAhead === -1 || closeAhead < openAhead)) return null
  return { partial: between, tokenStart: openIdx }
}

export function useTokenInput(value: string, onChange: (v: string) => void, envNames: string[]) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [caretPos, setCaretPos] = useState<number>(0)
  const [dropdownIndex, setDropdownIndex] = useState<number>(0)
  const [dismissed, setDismissed] = useState<boolean>(false)
  const prevTokenRef = useRef<string | null>(null)

  const activeToken = getActiveToken(value, caretPos)
  const filteredNames = activeToken !== null
    ? envNames.filter(n => n.toLowerCase().startsWith(activeToken.partial.toLowerCase()))
    : []
  const isResolved = activeToken !== null && envNames.includes(activeToken.partial)
  const showDropdown = !dismissed && activeToken !== null && activeToken.partial.length > 0 && filteredNames.length > 0 && !isResolved

  useEffect(() => {
    const token = activeToken?.partial ?? null
    if (token !== prevTokenRef.current) {
      prevTokenRef.current = token
      setDismissed(false)
      setDropdownIndex(0)
    }
  }, [activeToken?.partial])

  function syncCaret() {
    const input = inputRef.current
    if (input) setCaretPos(input.selectionStart ?? 0)
  }

  function pickName(name: string) {
    if (!activeToken) return
    const { tokenStart } = activeToken
    const after = value.slice(caretPos)
    const suffix = after.startsWith('}}') ? after.slice(2) : after
    const newVal = value.slice(0, tokenStart) + '{{' + name + '}}' + suffix
    const newCaret = tokenStart + 2 + name.length + 2
    onChange(newVal)
    requestAnimationFrame(() => {
      inputRef.current?.setSelectionRange(newCaret, newCaret)
      setCaretPos(newCaret)
    })
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === '{') {
      const input = e.currentTarget
      const start = input.selectionStart ?? 0
      const end = input.selectionEnd ?? 0
      const before = value.slice(0, start)
      if (before.endsWith('{')) {
        e.preventDefault()
        const after = value.slice(end)
        const nextTwo = after.slice(0, 2)
        const newVal = before + '{' + (nextTwo === '}}' ? '' : '}}') + after
        const newCaret = start + 1
        onChange(newVal)
        requestAnimationFrame(() => {
          inputRef.current?.setSelectionRange(newCaret, newCaret)
          setCaretPos(newCaret)
        })
      }
      return
    }

    if (!showDropdown) return

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setDropdownIndex(i => (i + 1) % filteredNames.length)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setDropdownIndex(i => (i - 1 + filteredNames.length) % filteredNames.length)
    } else if (e.key === 'Enter') {
      e.preventDefault()
      pickName(filteredNames[dropdownIndex] ?? filteredNames[0])
    } else if (e.key === 'Escape') {
      e.preventDefault()
      setDismissed(true)
    }
  }

  return { inputRef, syncCaret, showDropdown, filteredNames, dropdownIndex, handleKeyDown, pickName }
}
