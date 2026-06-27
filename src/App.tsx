import { useState, useEffect } from 'react'
import EndpointForm from '@/components/endpoint-form/EndpointForm'
import PreviewPanel from '@/components/preview/PreviewPanel'
import { useEndpointForm } from '@/hooks/useEndpointForm'
import { HowToUseModal } from '@/components/modals/HowToUseModal'
import { EndpointTesterModal } from '@/components/tester/EndpointTesterModal'

export default function App() {
  const { endpoint, update, allowed } = useEndpointForm()
  const year: number = new Date().getFullYear()

  const [showHowTo, setShowHowTo] = useState(false)
  const [testerOpen, setTesterOpen] = useState(false)
  const [fromTester, setFromTester] = useState(false)

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    return localStorage.getItem('theme') === 'light' ? 'light' : 'dark'
  })

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.remove('dark')
    } else {
      document.documentElement.classList.add('dark')
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  const toggleTheme = () => setTheme(t => t === 'dark' ? 'light' : 'dark')

  return (
    <div className="min-h-screen flex flex-col bg-[var(--gh-canvas)] text-[var(--gh-text-primary)]">
      {/* App Header */}
      <header className="bg-[var(--gh-canvas-subtle)] border-b border-[var(--gh-border)] w-full">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[var(--gh-text-primary)]">apispec-forge</h1>
            <p className="text-sm text-[var(--gh-text-secondary)] mt-0.5">Build OpenAPI endpoint specs</p>
          </div>
          <div className="flex items-center gap-2">
          <button
            onClick={() => setTesterOpen(true)}
            className="px-3 py-1.5 rounded border border-[var(--gh-accent)] text-[var(--gh-accent)] text-sm hover:bg-[var(--gh-accent)]/10 transition flex items-center gap-1.5"
          >
            Test Endpoint
            <span className="text-[10px] font-semibold px-1 py-0.5 rounded bg-[var(--gh-accent)]/15 text-[var(--gh-accent)] leading-none">Beta</span>
          </button>
          <button
            onClick={() => setShowHowTo(true)}
            aria-label="How to use"
            className="p-2 rounded border border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-canvas-inset)] transition"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
              <line x1="12" y1="17" x2="12.01" y2="17"/>
            </svg>
          </button>
          <button
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded border border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)] hover:bg-[var(--gh-canvas-inset)] transition"
          >
            {theme === 'dark' ? (
              /* Sun icon for switching to light */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            ) : (
              /* Moon icon for switching to dark */
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            )}
          </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-grow max-w-7xl mx-auto p-4 grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
        <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border-muted)] rounded shadow-sm overflow-x-hidden overflow-y-auto text-sm">
          <EndpointForm value={endpoint} onChange={(v) => { setFromTester(false); update(v) }} allowed={allowed} fromTester={fromTester} onDismissTip={() => setFromTester(false)} />
        </div>
        <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border-muted)] rounded shadow-sm overflow-auto">
          <PreviewPanel endpoint={endpoint} />
        </div>
      </div>

      {/* Footer */}
      <footer className="py-3 text-center text-xs text-[var(--gh-text-secondary)]">
        reizucodes © {year}
      </footer>
      <HowToUseModal open={showHowTo} onClose={() => setShowHowTo(false)} />
      <EndpointTesterModal
        open={testerOpen}
        onClose={() => setTesterOpen(false)}
        onApplyEndpoint={(patch) => { update(patch); setTesterOpen(false); setFromTester(true) }}
      />
    </div>
  )
}
