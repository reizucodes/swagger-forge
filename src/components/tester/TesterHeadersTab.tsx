interface Header {
  id: string
  key: string
  value: string
}

interface Props {
  headers: Header[]
  onAdd: () => void
  onUpdate: (id: string, field: 'key' | 'value', value: string) => void
  onRemove: (id: string) => void
}

export function TesterHeadersTab({ headers, onAdd, onUpdate, onRemove }: Props) {
  return (
    <div className="p-3 space-y-2">
      {headers.length === 0 && (
        <p className="text-sm text-[var(--gh-text-secondary)]">No headers added.</p>
      )}
      {headers.map(h => (
        <div key={h.id} className="flex gap-2 items-center">
          <input
            type="text"
            value={h.key}
            onChange={e => onUpdate(h.id, 'key', e.target.value)}
            placeholder="Key"
            className="flex-1 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
          />
          <input
            type="text"
            value={h.value}
            onChange={e => onUpdate(h.id, 'value', e.target.value)}
            placeholder="Value"
            className="flex-1 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
          />
          <button
            onClick={() => onRemove(h.id)}
            aria-label="Remove header"
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
        onClick={onAdd}
        className="text-sm text-[var(--gh-accent)] underline hover:opacity-80 transition"
      >
        Add header
      </button>
    </div>
  )
}
