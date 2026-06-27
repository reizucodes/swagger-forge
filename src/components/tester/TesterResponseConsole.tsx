import { useState } from 'react'
import { tokenize, TOKEN_COLORS } from '@/components/preview/syntaxHighlight'
import type { TesterStatus, TesterResponse } from '@/hooks/useEndpointTester'

interface Props {
  status: TesterStatus
  errorMessage: string | null
  response: TesterResponse | null
  onCreateDoc: () => void
}

function statusBadgeClass(code: number): string {
  if (code >= 200 && code < 300) return 'text-green-400'
  if (code >= 300 && code < 400) return 'text-blue-400'
  if (code >= 400 && code < 500) return 'text-yellow-400'
  return 'text-red-400'
}

export function TesterResponseConsole({ status, errorMessage, response, onCreateDoc }: Props) {
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
      <div className="p-3 space-y-3">
        <p className="text-sm text-[var(--gh-danger)]">{errorMessage}</p>
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
    <ResponseBody
      response={response}
      headerCount={headerCount}
      prettyBody={prettyBody}
      tokens={prettyTokens}
      isHtml={isHtml}
      onCreateDoc={onCreateDoc}
    />
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
  const [pretty, setPretty] = useState(false)
  const [copied, setCopied] = useState(false)
  const [wrap, setWrap] = useState(true)

  const displayBody = pretty ? prettyBody : response.body
  const displayTokens = pretty ? tokens : (response.isJson && response.body ? tokenize(response.body, 'openapi-json') : null)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(displayBody)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
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
                {copied ? 'Copied!' : 'Copy'}
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
