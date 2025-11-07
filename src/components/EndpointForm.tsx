import type { Endpoint, Parameter, JsonField } from '../types/index'
import { ParameterField } from './endpoint-form/ParameterField'
import { JsonFieldEditor } from './endpoint-form/JsonFieldEditor'
import { ResponseField } from './endpoint-form/ResponseField'

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

  return (
    <div className="p-4 space-y-4">
      {/* Method & Path */}
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col">
          Method
          <select
            className="mt-1 p-2 rounded border"
            value={value.method}
            onChange={e => onChange({ ...value, method: e.target.value as any })}
          >
            <option value="get">GET</option>
            <option value="post">POST</option>
            <option value="put">PUT</option>
            <option value="patch">PATCH</option>
            <option value="delete">DELETE</option>
          </select>
        </label>
        <label className="flex flex-col">
          Path
          <input 
            className="mt-1 p-2 rounded border" 
            value={value.path} 
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
          Bearer (Sanctum)
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
                // value={selectedContentType}
                // onChange={(e) => setSelectedContentType(e.target.value)}
              >
                <option value="application/json">application/json</option>
                <option value="multipart/form-data">multipart/form-data</option>
              </select>
              <span className="text-xs text-orange-300">coming soon</span>
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
    </div>
  )
}
