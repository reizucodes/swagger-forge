interface Props {
  open: boolean
  onClose: () => void
}

export function TesterInfoModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[60] p-4" onClick={onClose}>
      <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
          <h2 className="font-semibold text-lg text-[var(--gh-text-primary)] flex items-center gap-2">
            Test Endpoint
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--gh-accent)]/15 text-[var(--gh-accent)] leading-none">Beta</span>
          </h2>
          <div className="relative group">
            <button
              className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-text-secondary)] hover:opacity-80 hover:border-[var(--gh-accent)] hover:text-[var(--gh-accent)] transition"
              onClick={onClose}
              aria-label="Close"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
              Close
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-5 text-sm">
          <p className="text-[var(--gh-text-secondary)] leading-relaxed">
            Send real HTTP requests to your API directly from the browser — no external tool needed.
          </p>

          <section>
            <h3 className="font-semibold text-[var(--gh-text-primary)] mb-2">How to use</h3>
            <ol className="flex flex-col gap-2.5">
              {([
                ['Set method & URL', 'Choose GET, POST, PUT, PATCH, or DELETE and enter the full endpoint URL.'],
                ['Configure auth', 'Add a Bearer token or API key under the Auth tab if your endpoint requires it.'],
                ['Add headers', 'Inject any custom request headers under the Headers tab.'],
                ['Set a body', 'For POST / PUT / PATCH, provide a raw JSON body under the Body tab.'],
                ['Send', 'Hit Send and review the status code, response headers, and body.'],
                ['Read the response', 'Prettify or toggle wrap for large payloads. Copy the body to clipboard if needed.'],
                ['Import to Builder', 'Click "Import to Builder" to import the method, path, request body, and response into your spec form.'],
              ] as [string, string][]).map(([title, detail], i) => (
                <li key={i} className="flex gap-3">
                  <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-xs flex items-center justify-center text-[var(--gh-text-secondary)] font-medium">
                    {i + 1}
                  </span>
                  <span className="leading-snug">
                    <span className="font-semibold text-[var(--gh-text-primary)]">{title}</span>
                    <span className="text-[var(--gh-text-secondary)]"> — {detail}</span>
                  </span>
                </li>
              ))}
            </ol>
          </section>

          <div className="flex gap-6">
            <section className="flex-1">
              <h3 className="font-semibold text-[var(--gh-text-primary)] mb-2">What's supported</h3>
              <ul className="flex flex-col gap-1.5">
                {[
                  'GET, POST, PUT, PATCH, DELETE methods',
                  'Bearer token and API key authentication',
                  'Custom request headers',
                  'Raw JSON request body',
                  'JSON response syntax highlighting and prettify',
                  'Wrap / no-wrap toggle for long responses',
                  'Copy response body to clipboard',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[var(--gh-text-secondary)]">
                    <span className="mt-0.5 text-green-400 shrink-0">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="flex-1">
              <h3 className="font-semibold text-[var(--gh-text-primary)] mb-2">Not yet supported</h3>
              <ul className="flex flex-col gap-1.5">
                {[
                  'Multipart/form-data and file uploads',
                  'Response schema validation',
                  'Request history',
                  'Environment variables',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-[var(--gh-text-secondary)]">
                    <span className="mt-0.5 text-[var(--gh-text-secondary)] opacity-50 shrink-0">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
