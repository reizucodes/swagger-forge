import { useState } from 'react'
import { tokenize, TOKEN_COLORS } from '@/components/preview/syntaxHighlight'
import { useToast } from '@/components/toast/useToast'
import type { TesterStatus, TesterResponse, RequestSnapshot } from '@/hooks/useEndpointTester'

interface Props {
  status: TesterStatus
  errorMessage: string | null
  response: TesterResponse | null
  requestSnapshot: RequestSnapshot | null
  onCreateDoc: () => void
}

function statusBadgeClass(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-400'
  if (code >= 300 && code < 400) return 'text-blue-400'
  if (code >= 400 && code < 500) return 'text-yellow-400'
  return 'text-red-400'
}

type ConsoleTab = 'response' | 'console'

function ConsoleTabs({ active, onChange }: { active: ConsoleTab; onChange: (t: ConsoleTab) => void }) {
  return (
    <div className="flex border-b border-[var(--gh-border)]">
      {(['response', 'console'] as ConsoleTab[]).map(tab => (
        <button
          key={tab}
          onClick={() => onChange(tab)}
          className={`px-4 py-2 text-sm transition border-b-2 -mb-px capitalize ${
            active === tab
              ? 'border-[var(--gh-accent)] text-[var(--gh-accent)]'
              : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
          }`}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}

export function TesterResponseConsole({ status, errorMessage, response, requestSnapshot, onCreateDoc }: Props) {
  const [activeTab, setActiveTab] = useState<ConsoleTab>('response')

  if (status === 'idle') {
    return (
      <div className="flex-1 flex items-center justify-center p-3 text-sm text-[var(--gh-text-secondary)]">
        Send a request to see the response.
      </div>
    )
  }

  if (status === 'sending') {
    return (
      <div className="p-3 text-sm text-[var(--gh-text-secondary)]">
        Sending...
      </div>
    )
  }

  if (status === 'error' && !response?.statusCode) {
    return (
      <div className="flex flex-col flex-1 min-h-0">
        <ConsoleTabs active={activeTab} onChange={setActiveTab} />
        {activeTab === 'response' && (
          <div className="p-3 space-y-3">
            <p className="text-sm text-[var(--gh-danger)]">{errorMessage}</p>
          </div>
        )}
        {activeTab === 'console' && requestSnapshot && (
          <RequestConsole snapshot={requestSnapshot} />
        )}
      </div>
    )
  }

  if (!response) return null

  const headerCount = Object.keys(response.headers).length

  const isHtml = response.body.trimStart().startsWith('<')

  const prettyBody = response.isJson && response.body
    ? (() => { try { return JSON.stringify(JSON.parse(response.body), null, 2) } catch { return response.body } })()
    : response.body

  const prettyTokens = response.isJson && prettyBody
    ? tokenize(prettyBody, 'openapi-json')
    : null

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <ConsoleTabs active={activeTab} onChange={setActiveTab} />
      {activeTab === 'response' && (
        <ResponseBody
          response={response}
          headerCount={headerCount}
          prettyBody={prettyBody}
          tokens={prettyTokens}
          isHtml={isHtml}
          onCreateDoc={onCreateDoc}
        />
      )}
      {activeTab === 'console' && requestSnapshot && (
        <RequestConsole snapshot={requestSnapshot} />
      )}
    </div>
  )
}

function ResponseBody({ response, headerCount, prettyBody, tokens, isHtml, onCreateDoc }: {
  response: TesterResponse
  headerCount: number
  prettyBody: string
  tokens: ReturnType<typeof tokenize> | null
  isHtml: boolean
  onCreateDoc: () => void
}) {
  const toast = useToast()
  const [pretty, setPretty] = useState(false)
  const [wrap, setWrap] = useState(true)

  const displayBody = pretty ? prettyBody : response.body
  const displayTokens = pretty ? tokens : (response.isJson && response.body ? tokenize(response.body, 'openapi-json') : null)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayBody)
      toast.success('Response body copied to clipboard.')
    } catch {
      toast.error('Could not copy the response body.')
    }
  }

  return (
    <div className="p-3 flex flex-col flex-1 min-h-0 gap-3">
      <div className="flex items-center gap-2">
        <span className={`font-mono text-sm font-semibold ${statusBadgeClass(response.statusCode)}`}>
          {response.statusCode} {response.statusText}
        </span>
        <span className="text-xs text-[var(--gh-text-secondary)]">· {response.durationMs}ms</span>
      </div>

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
        onClick={() => {
          if (window.confirm('This will overwrite your current builder form with data from this response. Continue?')) {
            onCreateDoc()
          }
        }}
        className="w-full py-2 rounded bg-[var(--gh-accent)] text-white text-sm font-medium hover:opacity-90 transition shrink-0"
      >
        Import to Builder
      </button>
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

function RequestConsole({ snapshot }: { snapshot: RequestSnapshot }) {
  const methodColor = METHOD_COLORS[snapshot.method] ?? 'text-[var(--gh-text-secondary)]'
  const headerEntries = Object.entries(snapshot.headers)

  return (
    <div className="p-3 flex flex-col gap-3 overflow-auto">
      <div className="flex items-baseline gap-2">
        <span className={`font-mono text-sm font-semibold shrink-0 ${methodColor}`}>{snapshot.method}</span>
        <span className="font-mono text-sm text-[var(--gh-text-primary)] break-all">{snapshot.url}</span>
      </div>

      <div className="flex flex-col gap-1">
        <span className="text-xs text-[var(--gh-text-secondary)]">Request Headers</span>
        {headerEntries.length === 0 ? (
          <span className="text-xs text-[var(--gh-text-secondary)]">None</span>
        ) : (
          <div className="space-y-1 pl-2 border-l border-[var(--gh-border)]">
            {headerEntries.map(([k, v]) => (
              <div key={k} className="flex gap-2 text-xs font-mono">
                <span className="text-[var(--gh-text-secondary)] shrink-0">{k}:</span>
                <span className="text-[var(--gh-text-primary)] break-all">{v}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {snapshot.body !== undefined && snapshot.body !== '' && (
        <div className="flex flex-col gap-1">
          <span className="text-xs text-[var(--gh-text-secondary)]">Request Body</span>
          <pre className="bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-xs font-mono whitespace-pre-wrap break-words">
            {snapshot.body}
          </pre>
        </div>
      )}
    </div>
  )
}
