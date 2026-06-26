import type { ResponseDef } from "@/domain/endpoint/models/Response"

interface Props {
    response: ResponseDef
    onChange: (r: ResponseDef) => void
    onRemove: () => void
}

export function ResponseField({ response, onChange, onRemove }: Props) {
    // TODO add response types
    return (
        <div className="flex flex-wrap gap-2 items-center">
            <input
                className="w-20 p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                placeholder="200"
                value={response.code || ''}
                onChange={e => onChange({ ...response, code: e.target.value })}
            />
            <input
                className="flex-1 min-w-[120px] p-1 border border-[var(--gh-border)] rounded bg-[var(--gh-canvas)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                placeholder="Description"
                value={response.description || ''}
                onChange={e => onChange({ ...response, description: e.target.value })}
            />
            <button aria-label="Remove response" className="text-[var(--gh-danger)] hover:opacity-80" onClick={onRemove}>
                <svg height="20" width="20" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5.755,20.283,4,8H20L18.245,20.283A2,2,0,0,1,16.265,22H7.735A2,2,0,0,1,5.755,20.283ZM21,4H16V3a1,1,0,0,0-1-1H9A1,1,0,0,0,8,3V4H3A1,1,0,0,0,3,6H21a1,1,0,0,0,0-2Z"></path>
                </svg>
            </button>
        </div>
    )
}
