import { useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { HttpMethod, RequestBodyContentType } from '@/domain/endpoint/models/enums'
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
  const addParam = () => {
    const p: Parameter = { name: '', in: allowed.path ? 'path' : allowed.query ? 'query' : 'header', required: false, schemaType: 'string', description: '' }
    onChange({ ...value, parameters: [...(value.parameters || []), p] })
  }

  const addRequestBodyField = () => {
    const field: JsonField = { property: '', schemaType: 'string', example: '', description: '' }
    onChange({ ...value, requestBodyJsonFields: [...(value.requestBodyJsonFields || []), field] })
  }

  const addResponse = () => {
    const resp = { code: '400', description: 'Bad request' }
    onChange({ ...value, responses: [...(value.responses || []), resp] })
  }

  const [showJsonModal, setShowJsonModal] = useState<boolean>(false);
  const [showImportModal, setShowImportModal] = useState<boolean>(false);
  const [selectedSample, setSelectedSample] = useState<string>('');


  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between mb-4">
        {/* Sample Request Selector */}
        <select
          className="p-2 border rounded text-xs"
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
            if (sample) onChange(sample);
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
          className="text-sm underline text-red-400 hover:cursor-pointer"
          onClick={() => {
            onChange(EMPTY_ENDPOINT);
            setSelectedSample('');
          }}
        >
          Reset
        </button>
      </div>
      {/* Method & Path */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col">
          Method
          <select
            className="mt-1 p-2 rounded border"
            value={value.method}
            onChange={e => onChange({ ...value, method: e.target.value as HttpMethod })}
          >
            <option value="get"> GET </option>
            <option value="post"> POST </option>
            <option value="put"> PUT </option>
            <option value="patch"> PATCH </option>
            <option value="delete"> DELETE </option>
          </select>
        </label>
        <label className="flex flex-col">
          <div className="flex items-center justify-between">
            <span>Path</span>
          </div>
          <input 
            className="mt-1 p-2 rounded border" 
            value={value.path} 
            placeholder='/sample/path'
            onChange={e => onChange({ ...value, path: e.target.value })} />
        </label>
      </div>

      {/* Security */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={!!value.security?.bearer}
            onChange={e => onChange({ ...value, security: { bearer: e.target.checked } })}
          />
          {/* TODO add support for other security types */}
          Auth (Sanctum)
          <span className="text-xs text-orange-300">more security types soon</span>
        </label>
      </div>

      {/* Basic Info */}
      {['operationId', 'tags', 'summary', 'description'].map((field) => (
        <label className="flex flex-col" key={field}>
          {field.charAt(0).toUpperCase() + field.slice(1)}
          {field === 'description' ? (
            <textarea
              className="mt-1 p-2 rounded border"
              value={value[field as keyof Endpoint] as string || ''}
              onChange={e => onChange({ ...value, [field]: e.target.value })}
            />
          ) : (
            <input
              className="mt-1 p-2 rounded border"
              value={value[field as keyof Endpoint] as string || ''}
              onChange={e => onChange({ ...value, [field]: e.target.value })}
            />
          )}
        </label>
      ))}

      {/* Parameters */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Parameters</h4>
          <button className="text-sm underline hover:cursor-pointer" onClick={addParam}>Add parameter</button>
        </div>
        <div className="space-y-2 mt-2">
          {(value.parameters || []).filter(p => {
            if (p.in === 'path') return allowed.path
            if (p.in === 'query') return allowed.query
            return true
          }).map((p, i) => (
            <ParameterField
              key={i}
              parameter={p}
              allowed={allowed}
              onChange={updated => {
                const copy = [...(value.parameters || [])]
                copy[i] = updated
                onChange({ ...value, parameters: copy })
              }}
              onRemove={() => onChange({ ...value, parameters: (value.parameters || []).filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
      </div>

      {/* Request Body */}
      {allowed.body && (
        <div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h4 className="font-medium">Request Body</h4>
              <select 
                className="border rounded p-1 text-sm"
                value={value.requestBodyContentType}
                onChange={e => onChange(setRequestBodyContentType(value, e.target.value as RequestBodyContentType))}
              >
                <option value="application/json">application/json</option>
                <option value="multipart/form-data">multipart/form-data</option>
                <option value="x-www-form-urlencoded" disabled>(coming soon)</option>
              </select>
              {value.requestBodyContentType === "application/json" && (
                <button
                  className="text-sm underline text-orange-300 hover:cursor-pointer"
                  onClick={() => setShowJsonModal(true)}
                >
                  Preview JSON
                </button>
              )}
              {value.requestBodyContentType === "application/json" && (
                <button
                  className="text-sm underline text-orange-300"
                  onClick={() => setShowImportModal(true)}
                >
                  Import JSON
                </button>
              )}
            </div>
            <button className="text-sm underline hover:cursor-pointer" onClick={addRequestBodyField}>
              Add field
            </button>
          </div>
          <div className="space-y-2 mt-2">
            {(value.requestBodyJsonFields || []).map((f, i) => (
              <JsonFieldEditor
                key={i}
                field={f}
                onChange={updated => {
                  const copy = [...(value.requestBodyJsonFields || [])]
                  copy[i] = updated
                  onChange({ ...value, requestBodyJsonFields: copy })
                }}
                onRemove={() => onChange({ ...value, requestBodyJsonFields: (value.requestBodyJsonFields || []).filter((_, idx) => idx !== i) })}
                contentType={value.requestBodyContentType}
              />
            ))}
          </div>
        </div>
      )}

      {/* Responses */}
      <div>
        <div className="flex items-center justify-between">
          <h4 className="font-medium">Responses</h4>
          <button className="text-sm underline hover:cursor-pointer" onClick={addResponse}>Add response</button>
        </div>
        <div className="space-y-2 mt-2">
          {(value.responses || []).map((r, i) => (
            <ResponseField
              key={i}
              response={r}
              onChange={updated => {
                const copy = [...(value.responses || [])]
                copy[i] = updated
                onChange({ ...value, responses: copy })
              }}
              onRemove={() => onChange({ ...value, responses: (value.responses || []).filter((_, idx) => idx !== i) })}
            />
          ))}
        </div>
      </div>
      <JsonPreviewModal
        open={showJsonModal}
        onClose={() => setShowJsonModal(false)}
        json={jsonFieldToObject(value.requestBodyJsonFields || [])}
      />
      <JsonImportModal
        open={showImportModal}
        onClose={() => setShowImportModal(false)}
        onImport={(jsonString) => {
          const parsed = JSON.parse(jsonString);
          const fields = objectToJsonField(parsed); // you already generated this file
          onChange({ ...value, requestBodyJsonFields: fields });
        }}
      />
    </div>
  )
}
