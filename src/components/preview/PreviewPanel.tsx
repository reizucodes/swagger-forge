import { useState } from 'react'

const COPY_FEEDBACK_MS = 1500
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import { generateAnnotation } from '@/core/annotation/generateAnnotation'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import { ANNOTATION_TIPS } from '@/components/annotation/annotationTips'
import { ANNOTATION_TARGETS } from '@/components/annotation/annotationTargets'

interface Props {
  endpoint: Endpoint
}

export default function PreviewPanel({ endpoint }: Props) {
  const [target, setTarget] = useState<AnnotationTarget>('php-swagger')
  const annotation = generateAnnotation(endpoint, target)
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(annotation)
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="font-semibold text-[var(--gh-text-primary)]">Generated Annotation</h3>
          <label className="text-xs text-[var(--gh-text-secondary)]" htmlFor="annotation-format">Format:</label>
          <select
            id="annotation-format"
            className="text-xs border border-[var(--gh-border)] rounded px-2 py-1 bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
            value={target}
            onChange={(e) => setTarget(e.target.value as AnnotationTarget)}
          >
            {ANNOTATION_TARGETS.map(({ value, label, isDisabled}) => (
              <option key={value} value={value} disabled={isDisabled}>
                {label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          {copied && <span className="text-sm text-[var(--gh-accent)]">Copied!</span>}
          <button
            className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-accent)] hover:opacity-80 hover:border-[var(--gh-accent)] transition"
            onClick={copy}
            aria-label="Copy annotation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
          </button>
        </div>
      </div>

      <pre className="flex-1 overflow-auto p-4 border border-[var(--gh-border)] rounded font-mono text-sm whitespace-pre-wrap bg-[var(--gh-code-bg)] text-[var(--gh-code-text)]">
        {annotation}
      </pre>

      <div className="mt-3 text-xs text-[var(--gh-text-secondary)]">
        Tip: {ANNOTATION_TIPS[target]}
      </div>
    </div>
  )
}
