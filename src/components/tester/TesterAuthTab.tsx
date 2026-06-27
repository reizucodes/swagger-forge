import { useState } from 'react'
import type { TesterAuthType } from '@/hooks/useEndpointTester'

interface Auth {
  type: TesterAuthType
  value: string
  headerName: string
}

interface Props {
  auth: Auth
  onChange: (patch: Partial<Auth>) => void
}

export function TesterAuthTab({ auth, onChange }: Props) {
  const [showValue, setShowValue] = useState(false)

  return (
    <div className="p-3 space-y-3">
      <div className="flex items-center gap-3">
        <label className="text-xs text-[var(--gh-text-secondary)] w-24 shrink-0">Auth type</label>
        <select
          value={auth.type}
          onChange={e => onChange({ type: e.target.value as TesterAuthType })}
          className="bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)]"
        >
          <option value="none">None</option>
          <option value="bearer">Bearer Token</option>
          <option value="apiKey">API Key</option>
        </select>
      </div>

      {auth.type !== 'none' && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-[var(--gh-text-secondary)] w-24 shrink-0">
            {auth.type === 'bearer' ? 'Token' : 'Key value'}
          </label>
          <div className="relative flex-1 min-w-0">
            <input
              type={showValue ? 'text' : 'password'}
              value={auth.value}
              onChange={e => onChange({ value: e.target.value })}
              placeholder={auth.type === 'bearer' ? 'your-token' : 'your-api-key'}
              className="w-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 pr-8 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
            />
            <button
              type="button"
              onClick={() => setShowValue(v => !v)}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] transition"
              aria-label={showValue ? 'Hide value' : 'Show value'}
            >
              {showValue ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </svg>
              )}
            </button>
          </div>
        </div>
      )}

      {auth.type === 'apiKey' && (
        <div className="flex items-center gap-3">
          <label className="text-xs text-[var(--gh-text-secondary)] w-24 shrink-0">Header name</label>
          <input
            type="text"
            value={auth.headerName}
            onChange={e => onChange({ headerName: e.target.value })}
            placeholder="X-API-Key"
            className="flex-1 bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] rounded px-2 py-1.5 text-sm text-[var(--gh-text-primary)] placeholder-[var(--gh-text-secondary)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-accent)] focus:border-[var(--gh-accent)]/50"
          />
        </div>
      )}
    </div>
  )
}
