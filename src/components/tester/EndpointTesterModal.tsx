import { useCallback, useEffect, useRef, useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import { useToast } from '@/components/toast/useToast'
import { useEndpointTester } from '@/hooks/useEndpointTester'
import { TesterRequestBar } from './TesterRequestBar'
import { TesterAuthTab } from './TesterAuthTab'
import { TesterHeadersTab } from './TesterHeadersTab'
import { TesterBodyTab } from './TesterBodyTab'
import { TesterResponseConsole } from './TesterResponseConsole'
import { TesterInfoModal } from './TesterInfoModal'
import { TesterEnvPanel } from './TesterEnvPanel'

interface Props {
  open: boolean
  onClose: () => void
  onApplyEndpoint: (patch: Partial<Endpoint>) => void
}

type Tab = 'auth' | 'headers' | 'body'

export function EndpointTesterModal({ open, onClose, onApplyEndpoint }: Props) {
  const toast = useToast()
  const [activeTab, setActiveTab] = useState<Tab>('auth')
  const [infoOpen, setInfoOpen] = useState(false)
  const {
    state,
    setMethod,
    setUrl,
    setAuth,
    addHeader,
    updateHeader,
    removeHeader,
    setBody,
    send,
    loadSample,
    reset,
    getEndpointPatch,
    envVariables,
    addEnvVariable,
    updateEnvVariable,
    removeEnvVariable,
  } = useEndpointTester()

  const [tabPanelHeight, setTabPanelHeight] = useState(140)
  const isDragging = useRef(false)
  const dragStartY = useRef(0)
  const dragStartHeight = useRef(0)
  const lastErrorRef = useRef<string | null>(null)

  useEffect(() => {
    if (state.requestSnapshot && state.resolveWarnings.length > 0) {
      toast.warning(`Unresolved variables: ${state.resolveWarnings.join(', ')}`)
    }
  }, [state.requestSnapshot, state.resolveWarnings, toast])

  useEffect(() => {
    if (state.status === 'error' && state.errorMessage && state.errorMessage !== lastErrorRef.current) {
      toast.error(state.errorMessage)
      lastErrorRef.current = state.errorMessage
      return
    }

    if (state.status !== 'error') {
      lastErrorRef.current = null
    }
  }, [state.errorMessage, state.status, toast])

  const onDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true
    dragStartY.current = e.clientY
    dragStartHeight.current = tabPanelHeight
    const onMove = (ev: MouseEvent) => {
      if (!isDragging.current) return
      const delta = ev.clientY - dragStartY.current
      const maxPx = Math.floor(window.innerHeight * 0.8)
      setTabPanelHeight(Math.min(maxPx, Math.max(60, dragStartHeight.current + delta)))
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }, [tabPanelHeight])

  if (!open) return null

  const handleCreateDoc = () => {
    const patch = getEndpointPatch()
    onApplyEndpoint(patch)
  }

  const tabs: { id: Tab; label: string }[] = [
    { id: 'auth', label: 'Auth' },
    { id: 'headers', label: 'Headers' },
    { id: 'body', label: 'Body' },
  ]

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg w-full max-w-2xl lg:max-w-4xl max-h-[90vh] flex flex-col"
        onClick={e => e.stopPropagation()}
        onKeyDown={e => {
          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && state.status !== 'sending' && state.url.trim()) {
            e.preventDefault()
            send()
          }
        }}
      >
        <div className="flex justify-between items-center px-3 sm:px-4 py-3 border-b border-[var(--gh-border)]">
          <h2 className="font-semibold text-base sm:text-lg text-[var(--gh-text-primary)] flex items-center gap-2">
            Test Endpoint
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-[var(--gh-accent)]/15 text-[var(--gh-accent)] leading-none">Beta</span>
          </h2>
          <div className="flex items-center gap-1.5">
            <button
              onClick={reset}
              className="text-xs text-[var(--gh-text-secondary)] underline hover:text-[var(--gh-text-primary)] transition"
            >
              Reset
            </button>
            <div className="relative group">
              <button
                onClick={() => setInfoOpen(true)}
                aria-label="About this feature"
                className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-text-secondary)] hover:opacity-80 hover:border-[var(--gh-accent)] hover:text-[var(--gh-accent)] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                About
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={onClose}
                aria-label="Close"
                className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-text-secondary)] hover:opacity-80 hover:border-[var(--gh-accent)] hover:text-[var(--gh-accent)] transition"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                Close
              </span>
            </div>
          </div>
        </div>

        <TesterEnvPanel
          variables={envVariables}
          onAdd={addEnvVariable}
          onUpdate={updateEnvVariable}
          onRemove={removeEnvVariable}
        />

        <TesterRequestBar
          method={state.method}
          url={state.url}
          isSending={state.status === 'sending'}
          onMethodChange={setMethod}
          onUrlChange={setUrl}
          onSend={send}
          envNames={envVariables.map(v => v.name)}
          envMap={Object.fromEntries(envVariables.filter(v => v.name.trim()).map(v => [v.name, v.value]))}
          onUpdateEnvValue={(name, value) => {
            const v = envVariables.find(ev => ev.name === name)
            if (v) updateEnvVariable(v.id, 'value', value)
          }}
        />

        <div className="px-4 py-1.5 flex items-center gap-1.5 text-xs text-[var(--gh-text-secondary)]">
          No endpoint?
          <button
            onClick={loadSample}
            className="underline hover:text-[var(--gh-text-primary)] transition"
          >
            Load a sample GET request
          </button>
        </div>

        <div className="flex border-b border-[var(--gh-border)]">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 text-sm transition border-b-2 -mb-px ${
                activeTab === tab.id
                  ? 'border-[var(--gh-accent)] text-[var(--gh-accent)]'
                  : 'border-transparent text-[var(--gh-text-secondary)] hover:text-[var(--gh-text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="overflow-y-auto shrink-0 max-h-[35vh] sm:max-h-none" style={{ height: tabPanelHeight }}>
          {activeTab === 'auth' && (
            <TesterAuthTab auth={state.auth} onChange={setAuth} envNames={envVariables.map(v => v.name)} />
          )}
          {activeTab === 'headers' && (
            <TesterHeadersTab
              headers={state.headers}
              onAdd={addHeader}
              onUpdate={updateHeader}
              onRemove={removeHeader}
              envNames={envVariables.map(v => v.name)}
            />
          )}
          {activeTab === 'body' && (
            <TesterBodyTab method={state.method} body={state.body} onChange={setBody} />
          )}
        </div>

        <div
          onMouseDown={onDragStart}
          className="hidden sm:flex h-2 shrink-0 items-center justify-center cursor-row-resize border-y border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] hover:bg-[var(--gh-canvas-inset)] transition-colors group"
        >
          <div className="flex gap-0.5">
            <span className="w-4 h-0.5 rounded-full bg-[var(--gh-border)] group-hover:bg-[var(--gh-text-secondary)] transition-colors" />
            <span className="w-4 h-0.5 rounded-full bg-[var(--gh-border)] group-hover:bg-[var(--gh-text-secondary)] transition-colors" />
          </div>
        </div>

        <div className="flex-1 min-h-0 flex flex-col">
          <TesterResponseConsole
            status={state.status}
            errorMessage={state.errorMessage}
            response={state.response}
            requestSnapshot={state.requestSnapshot}
            onCreateDoc={handleCreateDoc}
          />
        </div>
        <TesterInfoModal open={infoOpen} onClose={() => setInfoOpen(false)} />
      </div>
    </div>
  )
}
