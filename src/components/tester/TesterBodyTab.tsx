import { useState } from 'react'
import type { HttpMethod } from '@/domain/endpoint/models/enums'

interface Props {
  method: HttpMethod
  body: string
  onChange: (body: string) => void
}

const BODY_METHODS: HttpMethod[] = ['post', 'put', 'patch']

export function TesterBodyTab({ method, body, onChange }: Props) {
  const [prettifyError, setPrettifyError] = useState<string | null>(null)

  if (!BODY_METHODS.includes(method)) {
    return (
      <div className="p-3">
        <p className="text-sm text-[var(--gh-text-secondary)]">
          Request body is not applicable for {method.toUpperCase()} requests.
        </p>
      </div>
    )
  }

  const handlePrettify = () => {
    try {
      const parsed = JSON.parse(body)
      onChange(JSON.stringify(parsed, null, 2))
      setPrettifyError(null)
    } catch {
      setPrettifyError('Invalid JSON — cannot prettify')
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
      {prettifyError && (
        <p className="text-xs text-[var(--gh-danger)]">{prettifyError}</p>
      )}
      <textarea
        value={body}
        onChange={e => { onChange(e.target.value); setPrettifyError(null) }}
        placeholder='{"key": "value"}'
        className="w-full min-h-[8rem] h-40 bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-sm font-mono text-[var(--gh-code-text)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50 resize-y"
      />
      <p className="text-xs text-[var(--gh-text-secondary)]">
        Only JSON body is supported. <span className="opacity-70">Multipart/form-data is not supported in this version.</span>
      </p>
    </div>
  )
}
