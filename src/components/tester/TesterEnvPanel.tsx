import { useState } from 'react'
import type { EnvVariable } from '@/domain/endpoint/tester/envVariables'

interface Props {
  variables: EnvVariable[]
  onAdd: () => void
  onUpdate: (id: string, field: 'name' | 'value', value: string) => void
  onRemove: (id: string) => void
}

const inputBase =
  'flex-1 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50'

export function TesterEnvPanel({ variables, onAdd, onUpdate, onRemove }: Props) {
  const [open, setOpen] = useState(false)

  return (
    <div className="border-b border-[var(--gh-border)]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="w-full flex items-center gap-2 px-3 py-2 cursor-pointer hover:bg-[var(--gh-canvas-subtle)] text-sm text-[var(--gh-text-secondary)] transition"
      >
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`shrink-0 transition-transform ${open ? 'rotate-90' : ''}`}
        >
          <polyline points="9 18 15 12 9 6" />
        </svg>
        <span className="font-medium">Environment</span>
        {!open && variables.length > 0 && (
          <span className="text-xs text-[var(--gh-text-secondary)]">
            ({variables.length} {variables.length === 1 ? 'variable' : 'variables'})
          </span>
        )}
      </button>

      {open && (
        <div className="p-3 space-y-2">
          {variables.map(v => (
            <div key={v.id} className="flex gap-2 items-center">
              <input
                type="text"
                value={v.name}
                onChange={e => onUpdate(v.id, 'name', e.target.value)}
                placeholder="Name"
                aria-label="Variable name"
                className={inputBase}
              />
              <input
                type="text"
                value={v.value}
                onChange={e => onUpdate(v.id, 'value', e.target.value)}
                placeholder="Value"
                aria-label="Variable value"
                className={inputBase}
              />
              <button
                type="button"
                onClick={() => onRemove(v.id)}
                aria-label="Remove variable"
                className="p-1.5 text-[var(--gh-text-secondary)] hover:text-[var(--gh-danger)] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={onAdd}
            className="text-sm text-[var(--gh-accent)] underline hover:opacity-80 transition"
          >
            Add variable
          </button>
        </div>
      )}
    </div>
  )
}
