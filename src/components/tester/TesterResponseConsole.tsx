import { useMemo, useState } from 'react'
import { tokenize, TOKEN_COLORS } from '@/components/preview/syntaxHighlight'
import { useToast } from '@/components/toast/useToast'
import type { TesterStatus, TesterResponse, RequestSnapshot, RequestLogEntry, ResponseLogEntry } from '@/hooks/useEndpointTester'

const RESPONSE_PREVIEW_LIMIT = 4_000

interface Props {
  status: TesterStatus
  errorMessage: string | null
  response: TesterResponse | null
  requestSnapshot: RequestSnapshot | null
  requestHistory?: RequestLogEntry[]
  responseHistory?: ResponseLogEntry[]
  onClearHistory?: () => void
  onCreateDoc: (response?: TesterResponse, requestSnapshot?: RequestSnapshot) => void
}

function statusBadgeClass(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-400'
  if (code >= 300 && code < 400) return 'text-blue-400'
  if (code >= 400 && code < 500) return 'text-yellow-400'
  return 'text-red-400'
}

function formatLogTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export function TesterResponseConsole({ status, errorMessage, response, requestSnapshot, requestHistory = [], responseHistory = [], onClearHistory, onCreateDoc }: Props) {
  const [openEntries, setOpenEntries] = useState<Record<string, boolean>>({})
  const requests = requestHistory.length || !requestSnapshot ? requestHistory : [{ id: 0, timestamp: Date.now(), snapshot: requestSnapshot }]
  const responses = responseHistory.length || !response
    ? responseHistory
    : [{ id: 0, timestamp: Date.now(), response, errorMessage, requestSnapshot: requestSnapshot ?? { method: '', url: '', headers: {}, body: undefined } }]

  if (status === 'idle' && requests.length === 0) {
    return <div className="flex-1 flex items-center justify-center p-3 text-sm text-[var(--gh-text-secondary)]">Run the endpoint to see the request and response log.</div>
  }

  const entries = [
    ...requests.map(entry => ({ kind: 'request' as const, sequence: entry.id, entry })),
    ...responses.map(entry => ({ kind: 'response' as const, sequence: entry.id, entry })),
  ].sort((a, b) => a.sequence - b.sequence || (a.kind === 'request' ? -1 : 1))
  const latestRequestId = Math.max(...requests.map(entry => entry.id), -1)
  const latestResponseId = Math.max(...responses.map(entry => entry.id), -1)

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-auto p-3 gap-2">
      {(requests.length > 0 || responses.length > 0) && (
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--gh-text-secondary)]">Console</span>
          {onClearHistory && (
            <button
              type="button"
              onClick={onClearHistory}
              className="text-xs text-[var(--gh-text-secondary)] underline hover:text-[var(--gh-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]"
            >
              Clear
            </button>
          )}
        </div>
      )}
      {status === 'sending' && <div className="text-xs text-[var(--gh-text-secondary)]">Running…</div>}
      {entries.map(item => item.kind === 'request' ? (
        <RequestConsole
          key={`request-${item.entry.id}`}
          snapshot={item.entry.snapshot}
          timestamp={item.entry.timestamp}
          compact={item.entry.id !== latestRequestId}
          open={openEntries[`request-${item.entry.id}`] ?? false}
          onToggle={open => setOpenEntries(prev => ({ ...prev, [`request-${item.entry.id}`]: open }))}
        />
      ) : (
        <ResponseLog
          key={`response-${item.entry.id}`}
          entry={item.entry}
          compact={item.entry.id !== latestResponseId}
          timestamp={item.entry.timestamp}
          onCreateDoc={onCreateDoc}
          open={openEntries[`response-${item.entry.id}`] ?? false}
          onToggle={open => setOpenEntries(prev => ({ ...prev, [`response-${item.entry.id}`]: open }))}
        />
      ))}
      {status === 'error' && responses.length === 0 && <p className="text-sm text-[var(--gh-danger)]">{errorMessage}</p>}
    </div>
  )
}

function ResponseLog({ entry, onCreateDoc, open, onToggle, compact, timestamp }: { entry: ResponseLogEntry; onCreateDoc: Props['onCreateDoc']; open: boolean; onToggle: (open: boolean) => void; compact: boolean; timestamp: number }) {
  const response = entry.response

  return (
    <details open={open} onToggle={event => onToggle(event.currentTarget.open)} className="rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
      <summary className={`flex items-center gap-2 cursor-pointer select-none ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]`}>
        <span className={`font-mono font-semibold ${statusBadgeClass(response.statusCode)}`}>
          {response.statusCode ? `${response.statusCode} ${response.statusText}` : 'Network error'}
        </span>
        <span className="text-xs text-[var(--gh-text-secondary)]">Response · {response.durationMs}ms</span>
        <span className="ml-auto shrink-0 text-xs text-[var(--gh-text-secondary)]">{formatLogTime(timestamp)}</span>
      </summary>
      {open && (
        <ResponseBody response={response} onCreateDoc={() => onCreateDoc(response, entry.requestSnapshot)} errorMessage={entry.errorMessage} compact={compact} />
      )}
    </details>
  )
}

function ResponseBody({ response, onCreateDoc, errorMessage, compact }: {
  response: TesterResponse
  onCreateDoc: () => void
  errorMessage?: string | null
  compact: boolean
}) {
  const toast = useToast()
  const [pretty, setPretty] = useState(false)
  const [wrap, setWrap] = useState(true)
  const [showFullBody, setShowFullBody] = useState(false)
  const [importConfirmationOpen, setImportConfirmationOpen] = useState(false)
  const headerCount = Object.keys(response.headers).length
  const isHtml = response.body.trimStart().startsWith('<')
  const prettyBody = useMemo(() => {
    if (!response.isJson || !response.body) return response.body
    try {
      return JSON.stringify(JSON.parse(response.body), null, 2)
    } catch {
      return response.body
    }
  }, [response.body, response.isJson])
  const fullDisplayBody = pretty ? prettyBody : response.body
  const isBodyTruncated = fullDisplayBody.length > RESPONSE_PREVIEW_LIMIT
  const displayBody = showFullBody || !isBodyTruncated
    ? fullDisplayBody
    : `${fullDisplayBody.slice(0, RESPONSE_PREVIEW_LIMIT)}\n…`
  const displayTokens = useMemo(
    () => response.isJson && displayBody ? tokenize(displayBody, 'openapi-json') : null,
    [displayBody, response.isJson],
  )

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(fullDisplayBody)
      toast.success('Response body copied to clipboard.')
    } catch {
      toast.error('Could not copy the response body.')
    }
  }

  return (
    <div className={`${compact ? 'mx-2 mb-2 px-2 py-2 gap-2' : 'mx-3 mb-3 px-3 py-3 gap-3'} rounded-r border-l-2 border-[var(--gh-accent)]/40 bg-[var(--gh-canvas)] flex flex-col`}>
      {response.statusCode === 0 && <p className="text-sm text-[var(--gh-danger)]">{errorMessage}</p>}

      <details className="text-sm">
        <summary className="cursor-pointer text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] select-none">
          Headers ({headerCount})
        </summary>
        <div className="mt-2 space-y-1 pl-2 border-l border-[var(--gh-border)]">
          {Object.entries(response.headers).map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs font-mono">
              <span className="text-[var(--gh-text-secondary)] shrink-0">{k}:</span>
              <span className="text-[var(--gh-text-primary)] break-all">{v}</span>
            </div>
          ))}
        </div>
      </details>

      <div className="flex flex-col flex-1 min-h-0 gap-1">
        <div className="flex items-center justify-between">
          <span className="text-xs text-[var(--gh-text-secondary)]">Body</span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWrap(w => !w)}
              className="text-xs text-[var(--gh-text-secondary)] underline hover:opacity-80"
            >
              {wrap ? 'No wrap' : 'Wrap'}
            </button>
            {response.isJson && (
              <button
                onClick={() => setPretty(p => !p)}
                className="text-xs text-[var(--gh-text-secondary)] underline hover:opacity-80"
              >
                {pretty ? 'Compact' : 'Prettify'}
              </button>
            )}
            {response.body && !isHtml && (
              <button
                onClick={handleCopy}
                className="text-xs text-[var(--gh-text-secondary)] underline hover:opacity-80"
              >
                Copy
              </button>
            )}
            {response.body && isBodyTruncated && (
              <button
                onClick={() => setShowFullBody(full => !full)}
                className="text-xs text-[var(--gh-text-secondary)] underline hover:opacity-80"
              >
                {showFullBody ? 'Truncate' : 'Show more'}
              </button>
            )}
          </div>
        </div>
        {isHtml ? (
          <div className="px-3 py-2 rounded border border-yellow-500/40 bg-yellow-500/10 text-xs text-yellow-400">
            This URL returned an HTML page, not an API response. Make sure the URL points to a JSON API endpoint.
          </div>
        ) : (
          <div className="flex-1 min-h-0 bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 overflow-auto text-sm font-mono">
            {!response.body ? (
              <span className="text-[var(--gh-text-secondary)]">No body.</span>
            ) : displayTokens ? (
              <pre className={wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'}>
                {displayTokens.map((t, i) => (
                  <span key={i} className={TOKEN_COLORS[t.type]}>{t.text}</span>
                ))}
              </pre>
            ) : (
              <pre className={`${wrap ? 'whitespace-pre-wrap break-words' : 'whitespace-pre'} text-[var(--gh-code-text)]`}>{displayBody}</pre>
            )}
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={() => setImportConfirmationOpen(true)}
        className="w-full py-2 rounded bg-[var(--gh-accent)] text-white text-sm font-medium hover:opacity-90 transition shrink-0"
      >
        Import to Builder
      </button>

      {importConfirmationOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4"
          onClick={() => setImportConfirmationOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="import-builder-confirmation-title"
            className="w-full max-w-md rounded-lg border border-[var(--gh-border)] bg-[var(--gh-canvas)] p-4 shadow-xl"
            onClick={event => event.stopPropagation()}
          >
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="import-builder-confirmation-title"
                  className="text-lg font-semibold text-[var(--gh-text-primary)]"
                >
                  Import to Builder?
                </h2>
                <p className="mt-2 text-sm text-[var(--gh-text-secondary)]">
                  This will overwrite your current builder form with data from this response.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setImportConfirmationOpen(false)}
                aria-label="Close import confirmation"
                className="rounded p-1.5 text-[var(--gh-text-secondary)] transition hover:text-[var(--gh-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImportConfirmationOpen(false)}
                className="rounded border border-[var(--gh-border)] px-3 py-2 text-sm text-[var(--gh-text-secondary)] transition hover:text-[var(--gh-text-primary)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  setImportConfirmationOpen(false)
                  onCreateDoc()
                }}
                className="rounded bg-[var(--gh-accent)] px-3 py-2 text-sm font-medium text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]"
              >
                Import to Builder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const METHOD_COLORS: Record<string, string> = {
  GET: 'text-blue-400',
  POST: 'text-green-400',
  PUT: 'text-yellow-400',
  PATCH: 'text-orange-400',
  DELETE: 'text-red-400',
  HEAD: 'text-purple-400',
  OPTIONS: 'text-cyan-400',
}

function RequestConsole({ snapshot, open, onToggle, compact, timestamp }: { snapshot: RequestSnapshot; open: boolean; onToggle: (open: boolean) => void; compact: boolean; timestamp: number }) {
  const methodColor = METHOD_COLORS[snapshot.method] ?? 'text-[var(--gh-text-secondary)]'
  const headerEntries = Object.entries(snapshot.headers)

  return (
    <details open={open} onToggle={event => onToggle(event.currentTarget.open)} className="rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)]">
      <summary className={`flex items-center gap-2 cursor-pointer select-none ${compact ? 'px-2 py-1.5 text-xs' : 'px-3 py-2 text-sm'} focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]`}>
        <span className={`font-mono font-semibold ${methodColor}`}>{snapshot.method}</span>
        <span className="min-w-0 font-mono text-xs text-[var(--gh-text-primary)] break-all">{snapshot.url}</span>
        <span className="ml-auto shrink-0 text-xs text-[var(--gh-text-secondary)]">{formatLogTime(timestamp)}</span>
      </summary>
      <div className={`${compact ? 'mx-2 mb-2 px-2 py-2 gap-2' : 'mx-3 mb-3 px-3 py-3 gap-3'} rounded-r border-l-2 border-[var(--gh-accent)]/40 bg-[var(--gh-canvas)] flex flex-col overflow-auto`}>
      <details className="rounded border border-[var(--gh-border)]/70 px-2 py-1">
        <summary className="cursor-pointer text-xs text-[var(--gh-text-secondary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--gh-accent)]">Request Headers ({headerEntries.length})</summary>
        <div className="mt-2 space-y-1 pl-2 border-l border-[var(--gh-border)]">
        {headerEntries.length === 0 ? (
          <span className="text-xs text-[var(--gh-text-secondary)]">None</span>
        ) : (
          headerEntries.map(([k, v]) => (
            <div key={k} className="flex gap-2 text-xs font-mono">
              <span className="text-[var(--gh-text-secondary)] shrink-0">{k}:</span>
              <span className="text-[var(--gh-text-primary)] break-all">{v}</span>
            </div>
          ))
        )}
        </div>
      </details>

      {snapshot.body !== undefined && snapshot.body !== '' && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--gh-text-secondary)]">Request Body</span>
          <pre className="bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-xs font-mono whitespace-pre-wrap break-words">
            {snapshot.body}
          </pre>
        </div>
      )}
      </div>
    </details>
  )
}
