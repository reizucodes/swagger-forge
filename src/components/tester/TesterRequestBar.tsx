import type { HttpMethod } from '@/domain/endpoint/models/enums'

interface Props {
  method: HttpMethod
  url: string
  isSending: boolean
  onMethodChange: (m: HttpMethod) => void
  onUrlChange: (url: string) => void
  onSend: () => void
}

const METHOD_COLORS: Record<HttpMethod, string> = {
  get:    'text-blue-400',
  post:   'text-green-400',
  put:    'text-yellow-400',
  patch:  'text-orange-400',
  delete: 'text-red-400',
}

const METHODS: HttpMethod[] = ['get', 'post', 'put', 'patch', 'delete']

export function TesterRequestBar({ method, url, isSending, onMethodChange, onUrlChange, onSend }: Props) {
  return (
    <div className="flex gap-2 p-3 border-b border-[var(--gh-border)]">
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
      <input
        type="url"
        value={url}
        onChange={e => onUrlChange(e.target.value)}
        placeholder="https://api.example.com/users/1"
        className="flex-1 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
      />
      <button
        onClick={onSend}
        disabled={isSending || !url.trim()}
        className="px-4 py-1.5 rounded bg-[var(--gh-accent)] text-white text-sm font-medium hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSending ? 'Sending...' : 'Send'}
      </button>
    </div>
  )
}
