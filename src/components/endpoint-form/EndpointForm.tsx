import { useState, useCallback } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { HttpMethod, RequestBodyContentType, AuthType } from '@/domain/endpoint/models/enums'
import type { Parameter } from '@/domain/endpoint/models/Parameter'
import type { JsonField } from '@/domain/endpoint/models/JsonField'
import { ParameterField } from '@/components/endpoint-form/ParameterField'
import { JsonFieldEditor } from '@/components/endpoint-form/JsonFieldEditor'
import { ResponseField } from '@/components/endpoint-form/ResponseField'
import { EMPTY_ENDPOINT } from '@/constants/endpoint'
import { SAMPLE_ENDPOINTS } from '@/constants/endpoint'
import { JsonPreviewModal } from '@/components/modals/JsonPreviewModal'
import { JsonImportModal } from '@/components/modals/JsonImportModal'
import { jsonFieldToObject } from '@/domain/endpoint/transformers/jsonFieldToObject'
import { objectToJsonField } from '@/domain/endpoint/transformers/objectToJsonField'
import { setRequestBodyContentType } from '@/application/endpoint/requestBody'

interface Props {
  value: Endpoint
  onChange: (v: Endpoint) => void
  allowed: { path: boolean; query: boolean; body: boolean }
  fromTester?: boolean
  onDismissTip?: () => void
}

export default function EndpointForm({ value, onChange, allowed, fromTester, onDismissTip }: Props) {
  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<string>('');
  const [importError, setImportError] = useState<string>('');

  // Wrap onChange to clear stale sample selection on manual edits
  const handleChange = useCallback((updated: Endpoint) => {
    setSelectedSample('');
    onChange(updated);
  }, [onChange]);

  const addParam = () => {
    const p: Parameter = { id: crypto.randomUUID(), name: '', in: allowed.path ? 'path' : allowed.query ? 'query' : 'header', required: false, schemaType: 'string', description: '' }
    handleChange({ ...value, parameters: [...(value.parameters || []), p] })
  }

  const addRequestBodyField = () => {
    const field: JsonField = { property: '', schemaType: 'string', example: '', description: '' }
    handleChange({ ...value, requestBodyJsonFields: [...(value.requestBodyJsonFields || []), field] })
  }

  const addResponse = () => {
    const resp = { id: crypto.randomUUID(), code: '', description: '' }
    handleChange({ ...value, responses: [...(value.responses || []), resp] })
  }

  const METHOD_COLORS: Record<string, string> = {
    get:    'text-blue-400 border-blue-500/60',
    post:   'text-green-400 border-green-500/60',
    put:    'text-orange-400 border-orange-500/60',
    patch:  'text-purple-400 border-purple-500/60',
    delete: 'text-red-400 border-red-500/60',
  }

  return (
    <div className="p-4 space-y-4">
      {fromTester && (
        <div className="flex items-start justify-between gap-2 px-3 py-2 rounded border border-yellow-500/40 bg-yellow-500/10 text-xs text-yellow-400">
          <span>Endpoint imported from test. Fill in <strong>OperationId</strong>, <strong>Tags</strong>, <strong>Summary</strong>, and <strong>Description</strong> to complete your doc.</span>
          <button onClick={onDismissTip} className="shrink-0 hover:opacity-70 transition" aria-label="Dismiss">✕</button>
        </div>
      )}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        {/* Sample Request Selector */}
        <select
          className="p-2 border border-[var(--gh-border)] rounded text-xs bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
          value={selectedSample}
          onChange={(e) => {
            const key = e.target.value
            setSelectedSample(key)
            if (!key) { onChange(EMPTY_ENDPOINT); return }
            const [method, idxStr] = key.split(':')
            const sample = SAMPLE_ENDPOINTS[method]?.[Number(idxStr)]?.endpoint
            if (sample) onChange(sample) // ponytail: bypass handleChange so sample selection keeps dropdown in sync
          }}
        >
          <option value="">Sample Requests</option>
          {Object.entries(SAMPLE_ENDPOINTS).map(([method, samples]) => (
            <optgroup key={method} label={method.toUpperCase()}>
              {samples.map((s, i) => (
                <option key={i} value={`${method}:${i}`}>{s.hint ? `${s.label} · ${s.hint}` : s.label}</option>
              ))}
            </optgroup>
          ))}
        </select>
        {/* Clear Button */}
        <button
          className="text-sm underline text-[var(--gh-danger)] hover:opacity-80"
          onClick={() => {
            onChange(EMPTY_ENDPOINT);
            setSelectedSample('');
          }}
        >
          Reset
        </button>
      </div>
      {/* Method, Path & Auth */}
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_4fr_0.6fr] gap-2">
        <label className="flex flex-col text-[var(--gh-text-primary)]">
          Method
          <select
            className={`mt-1 p-2 rounded border bg-[var(--gh-canvas-subtle)] placeholder-[var(--gh-text-placeholder)] focus:outline-none font-semibold ${METHOD_COLORS[value.method] ?? 'text-[var(--gh-text-primary)] border-[var(--gh-border)]'}`}
            value={value.method}
            onChange={e => handleChange({ ...value, method: e.target.value as HttpMethod })}
          >
            <option value="get"> GET </option>
            <option value="post"> POST </option>
            <option value="put"> PUT </option>
            <option value="patch"> PATCH </option>
            <option value="delete"> DELETE </option>
          </select>
        </label>
        <label className="flex flex-col text-[var(--gh-text-primary)]">
          <div className="flex items-center justify-between">
            <span>Path</span>
          </div>
          <input
            className="mt-1 p-2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
            value={value.path}
            placeholder='/sample/path'
            onChange={e => handleChange({ ...value, path: e.target.value })} />
        </label>
        <label className="flex flex-col text-[var(--gh-text-primary)]">
          Auth
          <select
            className="mt-1 p-2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] focus:outline-none"
            value={value.security?.type ?? 'none'}
            onChange={e => handleChange({ ...value, security: { type: e.target.value as AuthType } })}
          >
            <option value="none">No auth</option>
            <optgroup label="General">
              <option value="apiKey">API Key</option>
              <option value="bearer">Bearer Token</option>
            </optgroup>
            <optgroup label="Platform">
              <option value="jwt">JWT</option>
              <option value="sanctum">Laravel Sanctum</option>
            </optgroup>
          </select>
        </label>
      </div>

      {/* API Key header name — shown only when apiKey auth is selected */}
      {value.security?.type === 'apiKey' && (
        <label className="flex flex-col text-[var(--gh-text-primary)]">
          Header Name
          <input
            className="mt-1 p-2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
            placeholder="e.g. X-API-Key"
            value={value.security?.headerName ?? ''}
            onChange={e => handleChange({ ...value, security: { ...value.security!, headerName: e.target.value } })}
          />
        </label>
      )}

      {/* Basic Info */}
      {(['operationId', 'tags', 'summary', 'description'] as const).map((field) => {
        const placeholders: Record<typeof field, string> = {
          operationId: 'e.g. getUserById',
          tags: 'e.g. Users, Auth',
          summary: 'e.g. Fetch a single user by ID',
          description: 'e.g. Returns the user matching the given ID',
        }
        return (
          <label className="flex flex-col text-[var(--gh-text-primary)]" key={field}>
            {field.charAt(0).toUpperCase() + field.slice(1)}
            {field === 'description' ? (
              <textarea
                className="mt-1 p-2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                placeholder={placeholders[field]}
                value={value[field as keyof Endpoint] as string || ''}
                onChange={e => handleChange({ ...value, [field]: e.target.value })}
              />
            ) : (
              <input
                className="mt-1 p-2 rounded border border-[var(--gh-border)] bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none focus:ring-1 focus:ring-[var(--gh-border)] focus:border-[var(--gh-accent)]/50"
                placeholder={placeholders[field]}
                value={value[field as keyof Endpoint] as string || ''}
                onChange={e => handleChange({ ...value, [field]: e.target.value })}
              />
            )}
          </label>
        )
      })}

      {/* Parameters */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium uppercase tracking-wide text-[var(--gh-text-primary)]">Parameters</h4>
          <button className="text-sm text-[var(--gh-accent)] underline hover:opacity-80" onClick={addParam}>Add parameter</button>
        </div>
        <div className="space-y-2 mt-2">
          {(value.parameters || []).filter(p => {
            if (p.in === 'path') return allowed.path
            if (p.in === 'query') return allowed.query
            return true
          }).map((p, i) => (
            <ParameterField
              key={p.id}
              parameter={p}
              allowed={allowed}
              onChange={updated => {
                const copy = [...(value.parameters || [])]
                copy[i] = updated
                handleChange({ ...value, parameters: copy })
              }}
              onRemove={() => handleChange({ ...value, parameters: (value.parameters || []).filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
      </div>

      {/* Request Body */}
      {allowed.body && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="text-sm font-medium uppercase tracking-wide text-[var(--gh-text-primary)]">Request Body</h4>
              <select
                className="border border-[var(--gh-border)] rounded p-1 text-sm bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
                value={value.requestBodyContentType}
                onChange={e => handleChange(setRequestBodyContentType(value, e.target.value as RequestBodyContentType))}
              >
                <option value="application/json">application/json</option>
                <option value="multipart/form-data">multipart/form-data</option>
                <option value="x-www-form-urlencoded" disabled>(coming soon)</option>
              </select>
              {value.requestBodyContentType === "application/json" && (
                <div className="relative group">
                  <button
                    className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                    onClick={() => setShowJsonModal(true)}
                  >
                    Preview
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50 max-w-[200px] text-center" style={{whiteSpace: 'normal', width: '160px'}}>
                    See the request body as a raw JSON object
                  </span>
                </div>
              )}
              {value.requestBodyContentType === "application/json" && (
                <div className="relative group">
                  <button
                    className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                    onClick={() => setShowImportModal(true)}
                  >
                    Import
                  </button>
                  <span className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded text-xs whitespace-nowrap bg-[var(--gh-canvas-subtle)] border border-[var(--gh-border)] text-[var(--gh-text-secondary)] opacity-0 group-hover:opacity-100 transition-opacity delay-100 z-50 max-w-[200px] text-center" style={{whiteSpace: 'normal', width: '180px'}}>
                    Paste a JSON object to auto-fill the request body fields
                  </span>
                </div>
              )}
            </div>
            <button className="text-sm text-[var(--gh-accent)] underline hover:opacity-80" onClick={addRequestBodyField}>
              Add field
            </button>
          </div>
          {(value.requestBodyJsonFields || []).length > 0 && (
            <div className="grid gap-2 mt-3 mb-1 px-3 grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,3fr)_auto_auto_auto]">
              {['Field name', 'Type', 'Example', 'Req.', '', ''].map((label) => (
                <span key={label} className="text-xs text-[var(--gh-text-secondary)] font-medium">{label}</span>
              ))}
            </div>
          )}
          <div className="space-y-2 mt-2">
            {(value.requestBodyJsonFields || []).map((f, i) => (
              <JsonFieldEditor
                key={f.id ?? i}
                field={f}
                onChange={updated => {
                  const copy = [...(value.requestBodyJsonFields || [])]
                  copy[i] = updated
                  handleChange({ ...value, requestBodyJsonFields: copy })
                }}
                onRemove={() => handleChange({ ...value, requestBodyJsonFields: (value.requestBodyJsonFields || []).filter((_, idx) => idx !== i) })}
                contentType={value.requestBodyContentType}
              />
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium uppercase tracking-wide text-[var(--gh-text-primary)]">Responses</h4>
          <button className="text-sm text-[var(--gh-accent)] underline hover:opacity-80" onClick={addResponse}>Add response</button>
        </div>
        <div className="space-y-2 mt-2">
          {(value.responses || []).map((r, i) => (
            <ResponseField
              key={r.id}
              response={r}
              onChange={updated => {
                const copy = [...(value.responses || [])]
                copy[i] = updated
                handleChange({ ...value, responses: copy })
              }}
              onRemove={() => handleChange({ ...value, responses: (value.responses || []).filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
      </div>
      <JsonPreviewModal
        open={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        json={jsonFieldToObject(value.requestBodyJsonFields || [])}
      />
      {importError && (
        <p className="text-[var(--gh-danger)] text-sm mt-1">{importError}</p>
      )}
      <JsonImportModal
        open={showImportModal}
        onClose={() => { setShowImportModal(false); setImportError(''); }}
        sample={JSON.stringify({
          name: "Doggie",
          status: "available",
          category: {
            id: 1,
            name: "Dogs"
          }
        }, null, 2)}
        onImport={(jsonString) => {
          try {
            const parsed = JSON.parse(jsonString);
            const fields = objectToJsonField(parsed);
            handleChange({ ...value, requestBodyJsonFields: fields });
            setImportError('');
          } catch {
            setImportError('Invalid JSON — please check the format and try again.');
          }
        }}
      />
    </div>
  )
}
