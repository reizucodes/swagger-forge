import { useEffect, useState } from 'react'
import { useToast } from '@/components/toast/useToast'
import { Tooltip } from '@/components/Tooltip'

interface Props {
  open: boolean
  onClose: () => void
  onImport: (jsonString: string) => void
  sample?: string
}

export function JsonImportModal({ open, onClose, onImport, sample }: Props) {
    const [input, setInput] = useState('')
    const toast = useToast()

    useEffect(() => {
        if (!open) {
            setInput('')
        }
    }, [open])

    if (!open) return null

    const handleValidate = () => {
        try {
            JSON.parse(input)
            toast.success('JSON is valid.')
        } catch {
            toast.error('Invalid JSON format.')
        }
    }

    const handlePrettify = () => {
        try {
            const parsed = JSON.parse(input)
            setInput(JSON.stringify(parsed, null, 2))
            toast.success('JSON prettified.')
        } catch {
            toast.error('Invalid JSON — cannot prettify.')
        }
    }

    const handleImport = () => {
        try {
            JSON.parse(input)
            onImport(input)
            toast.success('JSON imported into the request body.')
            onClose()
        } catch {
            toast.error('Fix JSON errors first.')
        }
    }

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
                <h2 className="font-semibold text-lg text-[var(--gh-text-primary)]">Import JSON</h2>
                <Tooltip label="Close">
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
                </Tooltip>
            </div>
            {/* Buttons */}
            <div className="flex justify-between mb-3">
                <div className="flex gap-3">
                    <button
                        className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                        onClick={handleValidate}
                    >
                        Validate
                    </button>
                    <button
                        className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                        onClick={handlePrettify}
                    >
                        Prettify
                    </button>
                    {sample && (
                        <button
                            className="text-sm underline text-[var(--gh-text-secondary)] hover:opacity-80"
                            onClick={() => setInput(sample)}
                        >
                            Paste sample
                        </button>
                    )}
                </div>
                <button
                    className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                    onClick={handleImport}
                >
                    Import
                </button>
            </div>

            {/* Textarea */}
            <textarea
                className="w-full min-h-[8rem] h-48 max-h-[30vh] bg-[var(--gh-code-bg)] border border-[var(--gh-border)] rounded p-2 text-sm font-mono text-[var(--gh-code-text)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50 resize-y"
                value={input}
                onChange={(e) => setInput(e.target.value)}
placeholder='{
    "example": true
}'
            />
                </div>
            </div>
    )
}
