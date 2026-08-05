import { Tooltip } from '@/components/Tooltip'

interface Props {
  open: boolean
  onClose: () => void
}

const steps: { title: string; detail: string }[] = [
  { title: "Set your endpoint", detail: "Choose HTTP method, enter the path (e.g. /api/users/{id}), fill in summary and description" },
  { title: "Add parameters", detail: "Path, query, or header params — mark required ones" },
  { title: "Set the request body", detail: "For POST / PUT / PATCH, add JSON fields and choose content type" },
  { title: "Add responses", detail: "One entry per status code, with an optional response schema" },
  { title: "Pick a format", detail: "PHP DocBlock, PHP Attributes (PHP 8+), OpenAPI JSON — or JS JSDoc (coming soon)" },
  { title: "Pick a spec version", detail: "Swagger 2.0, OpenAPI 3.0.3, or OpenAPI 3.1.0 — output adapts to the selected version" },
  { title: "Copy", detail: "Hit the copy button in the preview panel" },
]

export function HowToUseModal({ open, onClose }: Props) {
  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-[var(--gh-canvas)] border border-[var(--gh-border)] rounded-lg p-4 w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-3 pb-3 border-b border-[var(--gh-border)]">
          <h2 className="font-semibold text-lg text-[var(--gh-text-primary)]">How to Use</h2>
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
        <ol className="flex flex-col gap-3">
          {steps.map((step, i) => (
            <li key={i} className="flex gap-3">
              <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-xs flex items-center justify-center text-[var(--gh-text-secondary)] font-medium">
                {i + 1}
              </span>
              <span className="text-sm leading-snug">
                <span className="font-semibold text-[var(--gh-text-primary)]">{step.title}</span>
                <span className="text-[var(--gh-text-secondary)]"> — {step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
