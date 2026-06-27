import { useState } from 'react'

const COPY_FEEDBACK_MS = 1500
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import { generateAnnotation } from '@/core/annotation/generateAnnotation'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import { SPEC_VERSIONS, getSpecVersion } from '@/core/annotation/specs'
import type { SpecVersionId } from '@/core/annotation/specs'
import { getGeneratorDefinition } from '@/core/annotation/registry/generatorRegistry'
import { ANNOTATION_TIPS } from '@/components/annotation/annotationTips'
import { ANNOTATION_TARGETS } from '@/components/annotation/annotationTargets'
import { tokenize, TOKEN_COLORS } from './syntaxHighlight'

interface Props {
  endpoint: Endpoint
}

export default function PreviewPanel({ endpoint }: Props) {
  const [target, setTarget] = useState<AnnotationTarget>(() => {
    const saved = localStorage.getItem('sf:annotation-target')
    const valid: AnnotationTarget[] = ['php-swagger', 'php-attribute', 'js-jsdoc', 'openapi-json']
    return (valid.includes(saved as AnnotationTarget) ? saved : 'php-swagger') as AnnotationTarget
  })
  const [specVersionId, setSpecVersionId] = useState<SpecVersionId>(() => {
    const saved = localStorage.getItem('sf:spec-version') as SpecVersionId | null
    return saved && ['swagger-2.0', 'openapi-3.0.3', 'openapi-3.1.0'].includes(saved)
      ? saved
      : 'openapi-3.0.3'
  })
  const annotation = generateAnnotation(endpoint, target, getSpecVersion(specVersionId))
  const [copied, setCopied] = useState(false)
  const [highlight, setHighlight] = useState(() =>
    localStorage.getItem('sf:highlight') !== 'false'
  )
  const [wrap, setWrap] = useState(() =>
    localStorage.getItem('sf:wrap') === 'true'
  )

  const copy = async () => {
    await navigator.clipboard.writeText(annotation)
    setCopied(true)
    setTimeout(() => setCopied(false), COPY_FEEDBACK_MS)
  }

  return (
    <div className="h-full p-4 flex flex-col">
      <div className="flex flex-col gap-2 mb-2">
        <div className="flex items-center justify-between gap-2">
          <h3 className="font-semibold text-[var(--gh-text-primary)]">Generated Annotation</h3>
          <div className="flex items-center gap-2">
            {copied && <span className="text-sm text-[var(--gh-accent)]">Copied!</span>}
            <div className="relative group">
              <button
                onClick={() => setHighlight(h => {
                  const next = !h
                  localStorage.setItem('sf:highlight', String(next))
                  return next
                })}
                aria-label={highlight ? 'Disable highlighting' : 'Enable highlighting'}
                className={`p-1.5 border rounded transition ${
                  highlight
                    ? 'border-[var(--gh-accent)] text-[var(--gh-accent)]'
                    : 'border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:opacity-80'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="16 18 22 12 16 6"/>
                  <polyline points="8 6 2 12 8 18"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                {highlight ? 'Highlighting on' : 'Highlighting off'}
              </span>
            </div>
            <div className="relative group">
              <button
                onClick={() => setWrap(w => {
                  const next = !w
                  localStorage.setItem('sf:wrap', String(next))
                  return next
                })}
                aria-label={wrap ? 'Disable word wrap' : 'Enable word wrap'}
                className={`p-1.5 border rounded transition ${
                  wrap
                    ? 'border-[var(--gh-accent)] text-[var(--gh-accent)]'
                    : 'border-[var(--gh-border)] text-[var(--gh-text-secondary)] hover:opacity-80'
                }`}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="4" x2="21" y2="4"/>
                  <path d="M3 12h13a4 4 0 0 1 0 8H8"/>
                  <polyline points="11 16 8 20 11 24"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                {wrap ? 'Word wrap on' : 'Word wrap off'}
              </span>
            </div>
            <div className="relative group">
              <button
                className="p-1.5 border border-[var(--gh-border)] rounded text-[var(--gh-accent)] hover:opacity-80 hover:border-[var(--gh-accent)] transition"
                onClick={copy}
                aria-label="Copy annotation"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 -translate-x-1/2 mt-1.5 px-1.5 py-0.5 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50">
                Copy
              </span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs text-[var(--gh-text-secondary)]" htmlFor="annotation-format">Format:</label>
          <select
            id="annotation-format"
            className="text-xs border border-[var(--gh-border)] rounded px-2 py-1 bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
            value={target}
            onChange={(e) => {
              const val = e.target.value as AnnotationTarget
              setTarget(val)
              localStorage.setItem('sf:annotation-target', val)
              const def = getGeneratorDefinition(val)
              if (!def.supportedSpecs.includes(specVersionId)) {
                const fallback = def.supportedSpecs[0]
                setSpecVersionId(fallback)
                localStorage.setItem('sf:spec-version', fallback)
              }
            }}
          >
            {(() => {
              const groups: Record<string, typeof ANNOTATION_TARGETS[number][]> = {}
              for (const t of ANNOTATION_TARGETS) {
                const g = t.group ?? 'Other'
                if (!groups[g]) groups[g] = []
                groups[g].push(t)
              }
              return Object.entries(groups).map(([group, targets]) =>
                targets.length === 1 && !targets[0].group ? (
                  <option key={targets[0].value} value={targets[0].value} disabled={targets[0].isDisabled}>
                    {targets[0].label}
                  </option>
                ) : (
                  <optgroup key={group} label={group}>
                    {targets.map(t => (
                      <option key={t.value} value={t.value} disabled={t.isDisabled}>
                        {t.label}
                      </option>
                    ))}
                  </optgroup>
                )
              )
            })()}
          </select>
          <label className="text-xs text-[var(--gh-text-secondary)]" htmlFor="spec-version">Spec:</label>
          <select
            id="spec-version"
            className="text-xs border border-[var(--gh-border)] rounded px-2 py-1 bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] focus:outline-none"
            value={specVersionId}
            onChange={(e) => {
              const val = e.target.value as SpecVersionId
              setSpecVersionId(val)
              localStorage.setItem('sf:spec-version', val)
            }}
          >
            {SPEC_VERSIONS.map(sv => {
              const supported = getGeneratorDefinition(target).supportedSpecs.includes(sv.id)
              return (
                <option key={sv.id} value={sv.id} disabled={!supported}>
                  {sv.label}
                </option>
              )
            })}
          </select>
        </div>
      </div>

      <pre className={`flex-1 overflow-auto p-4 border border-[var(--gh-border)] rounded font-mono text-sm bg-[var(--gh-code-bg)] text-[var(--gh-code-text)] ${wrap ? 'whitespace-pre-wrap' : 'whitespace-pre'}`}>
        {highlight
          ? tokenize(annotation, target).map((tok, i) => (
              <span key={i} className={TOKEN_COLORS[tok.type]}>{tok.text}</span>
            ))
          : annotation
        }
      </pre>

      <div className="mt-3 text-xs text-[var(--gh-text-secondary)]">
        Tip: {ANNOTATION_TIPS[target]}
      </div>
    </div>
  )
}
