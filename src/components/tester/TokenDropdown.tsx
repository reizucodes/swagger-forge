interface Props {
  names: string[]
  selectedIndex: number
  onPick: (name: string) => void
}

export function TokenDropdown({ names, selectedIndex, onPick }: Props) {
  return (
    <ul
      role="listbox"
      className="absolute left-0 right-0 top-full mt-1 z-50 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded shadow-lg overflow-hidden text-sm"
    >
      {names.map((name, i) => (
        <li key={name} role="option" aria-selected={i === selectedIndex}>
          <button
            type="button"
            onMouseDown={e => { e.preventDefault(); onPick(name) }}
            className={`w-full text-left px-3 py-1.5 text-[var(--gh-text-primary)] transition ${
              i === selectedIndex ? 'bg-[var(--gh-accent)]/15' : 'hover:bg-[var(--gh-accent)]/10'
            }`}
          >
            {name}
          </button>
        </li>
      ))}
    </ul>
  )
}
