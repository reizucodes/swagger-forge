import type { HttpMethod } from '@/domain/endpoint/models/enums'

interface Props {
  method: HttpMethod
  url: string
  isSending: boolean
  onMethodChange: (m: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
  resolveWarnings?: string[]
  envNames?: string[]
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  get:    'text-blue-400',
  post:   'text-green-400',
  put:    'text-yellow-400',
  patch:  'text-orange-400',
  delete: 'text-red-400',
}

const METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete']

function renderHighlightedUrl(url: string, envNames: string[] = []) {
  const parts = url.split(/({{[^}]*}})/g)
  return parts.map((part, i) => {
    const m = part.match(/^{{(.*)}}$/)
    if (m) {
      const isDefined = envNames.includes(m[1])
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

export function TesterRequestBar({ method, url, isSending, onMethodChange, onUrlChange, onSend, resolveWarnings, envNames }: Props) {
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
          {renderHighlightedUrl(url, envNames)}
        </div>
        <input
          type="text"
          value={url}
          onChange={e => onUrlChange(e.target.value)}
          placeholder="https://api.example.com/users/1"
          style={{ caretColor: 'var(--gh-text-primary)', color: 'transparent' }}
          className="relative w-full bg-transparent border-0 px-2 py-1.5 text-sm placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-0"
        />
      </div>
      <button
        onClick={onSend}
        disabled={isSending || !url.trim()}
        className="px-4 py-1.5 rounded bg-[var(--gh-accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
    {resolveWarnings && resolveWarnings.length > 0 && (
      <p className="px-3 pb-1.5 text-xs text-yellow-400">
        Unresolved variables: {resolveWarnings.join(', ')}
      </p>
    )}
    </div>
  )
}
