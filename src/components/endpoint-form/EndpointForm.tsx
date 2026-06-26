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
}

export default function EndpointForm({ value, onChange, allowed }: Props) {
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
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        {/* Sample Request Selector */}
        <select
          className="p-2 border border-[var(--gh-border)] rounded text-xs bg-[var(--gh-canvas-subtle)] text-[var(--gh-text-primary)] placeholder-[var(--gh-text-placeholder)] focus:outline-none"
          value={selectedSample}
          onChange={(e) => {
            const key = e.target.value;
            setSelectedSample(key);
            if (!key) {
              onChange(EMPTY_ENDPOINT)
              return;
            }
            const sample = key.startsWith("json:")
              ? SAMPLE_ENDPOINTS.json[key.replace("json:", "")]
              : SAMPLE_ENDPOINTS.formData[key.replace("form:", "")];
            if (sample) onChange(sample); // ponytail: bypass handleChange so sample selection keeps dropdown in sync
          }}
        >
          <option value="">Sample Requests</option>
          <optgroup label="application/json">
            {Object.keys(SAMPLE_ENDPOINTS.json).map(key => (
              <option key={key} value={`json:${key}`}>
                {key}
              </option>
            ))}
          </optgroup>
          <optgroup label="multipart/form-data">
            {Object.keys(SAMPLE_ENDPOINTS.formData).map(key => (
              <option key={key} value={`form:${key}`}>
                {key}
              </option>
            ))}
          </optgroup>
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
            <option value="sanctum">Sanctum</option>
            <option value="jwt" disabled>JWT (coming soon)</option>
          </select>
        </label>
      </div>

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
                <button
                  className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                  onClick={() => setShowJsonModal(true)}
                >
                  Preview JSON
                </button>
              )}
              {value.requestBodyContentType === "application/json" && (
                <button
                  className="text-sm underline text-[var(--gh-accent)] hover:opacity-80"
                  onClick={() => setShowImportModal(true)}
                >
                  Import JSON
                </button>
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
