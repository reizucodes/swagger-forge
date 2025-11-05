import type { Endpoint, Parameter, HttpMethod, ParamLocation, JsonField } from '../types/index'

interface Props {
  value: Endpoint
  onChange: (v: Endpoint) => void
  allowed: { path: boolean; query: boolean; body: boolean }
}

export default function EndpointForm({ value, onChange, allowed }: Props) {
  const addParam = () => {
    const p: Parameter = { name: 'new', in: allowed.path ? 'path' : allowed.query ? 'query' : 'header', required: false, schemaType: 'string', description: '' }
    onChange({ ...value, parameters: [...(value.parameters || []), p] })
  }

  const updateParam = (i: number, patch: Partial<Parameter>) => {
    const copy = (value.parameters || []).slice()
    copy[i] = { ...copy[i], ...patch }
    onChange({ ...value, parameters: copy })
  }

  const removeParam = (i: number) => {
    const copy = (value.parameters || []).slice()
    copy.splice(i, 1)
    onChange({ ...value, parameters: copy })
  }

  const addResponse = () => onChange({ ...value, responses: [...(value.responses || []), { code: '400', description: 'Bad request' }] })

  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <label className="flex flex-col">
          Method
          <select
            className="mt-1 p-2 rounded border"
            value={value.method}
            onChange={e => onChange({ ...value, method: e.target.value as HttpMethod })}
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
          <input className="mt-1 p-2 rounded border" value={value.path} onChange={e => onChange({ ...value, path: e.target.value })} />
        </label>
      </div>

      {/* Security */}
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={!!value.security?.bearer} onChange={e => onChange({ ...value, security: { bearer: e.target.checked } })} />
          Bearer (Sanctum)
          {/* TODO: should be able to use other security options */}
        </label>
      </div>

      <label className="flex flex-col">
        Operation ID
        <input className="mt-1 p-2 rounded border" value={value.operationId} onChange={e => onChange({ ...value, operationId: e.target.value })} />
      </label>

      <label className="flex flex-col">
        Tags
        <input className="mt-1 p-2 rounded border" value={value.tags} onChange={e => onChange({ ...value, tags: e.target.value })} />
      </label>


      <label className="flex flex-col">
        Summary
        <input className="mt-1 p-2 rounded border" value={value.summary} onChange={e => onChange({ ...value, summary: e.target.value })} />
      </label>

      <label className="flex flex-col">
        Description
        <textarea className="mt-1 p-2 rounded border" value={value.description} onChange={e => onChange({ ...value, description: e.target.value })} />
      </label>

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
            return true // header always shown
          }).map((p, i) => (
            <div key={i} className="p-2 border rounded grid grid-cols-6 gap-2 items-center">
              <input className="col-span-2 p-1 border rounded" value={p.name} onChange={e => updateParam(i, { name: e.target.value })} />
              <select className="p-1 border rounded" value={p.in} onChange={e => updateParam(i, { in: e.target.value as ParamLocation })}>
                {allowed.path && <option value="path">path</option>}
                {allowed.query && <option value="query">query</option>}
                <option value="header">header</option>
              </select>
              <select className="p-1 border rounded" value={p.schemaType} onChange={e => updateParam(i, { schemaType: e.target.value as any })}>
                <option value="string">string</option>
                <option value="integer">integer</option>
                <option value="boolean">boolean</option>
                <option value="number">number</option>
              </select>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={!!p.required} onChange={e => updateParam(i, { required: e.target.checked })} />
                required
              </label>
              <button className="text-sm text-red-600 hover:cursor-pointer" onClick={() => removeParam(i)}>Remove</button>
            </div>
          ))}
        </div>
      </div>

      {/* Request Body */}
      {allowed.body && (
        <div>
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Request Body (application/json)</h4>
            <button
              className="text-sm underline hover:cursor-pointer"
              onClick={() => {
                const newField: JsonField = {
                  property: 'newField',
                  schemaType: 'string',
                  example: '',
                  description: '',
                }
                onChange({ ...value, requestBodyJsonFields: [...(value.requestBodyJsonFields || []), newField] })
              }}
            >
              Add field
            </button>
          </div>
            
          <div className="space-y-2 mt-2">
            {(value.requestBodyJsonFields || []).map((field, i) => (
              <div key={i} className="p-2 border rounded space-y-2">
                <div className="grid grid-cols-5 gap-2 items-center">
                  <input
                    className="p-1 border rounded"
                    placeholder="property"
                    value={field.property}
                    onChange={e => {
                      const copy = [...(value.requestBodyJsonFields || [])]
                      copy[i] = { ...field, property: e.target.value }
                      onChange({ ...value, requestBodyJsonFields: copy })
                    }}
                  />
                  <select
                    className="p-1 border rounded"
                    value={field.schemaType || 'string'}
                    onChange={e => {
                      const copy = [...(value.requestBodyJsonFields || [])]
                      copy[i] = { ...field, schemaType: e.target.value as any }
                      onChange({ ...value, requestBodyJsonFields: copy })
                    }}
                  >
                    <option value="string">string</option>
                    <option value="integer">integer</option>
                    <option value="boolean">boolean</option>
                    <option value="number">number</option>
                    <option value="array">array</option>
                    <option value="object">object</option>
                  </select>
                  <input
                    className={`p-1 border rounded ${field.schemaType === 'object' || field.schemaType === 'array' ? 'cursor-not-allowed' : ''}`}
                    placeholder={
                      field.schemaType === 'object' || field.schemaType === 'array'
                        ? 'disabled'
                        : 'example'
                    }
                    disabled={field.schemaType === 'object' || field.schemaType === 'array'}
                    title={
                      field.schemaType === 'object' || field.schemaType === 'array'
                        ? 'Field is disabled for object and array types'
                        : ''
                    }
                    value={String(field.example ?? '')}
                    onChange={e => {
                      const copy = [...(value.requestBodyJsonFields || [])]
                      copy[i] = { ...field, example: e.target.value }
                      onChange({ ...value, requestBodyJsonFields: copy })
                    }}
                  />
                  <input
                    className="p-1 border rounded"
                    placeholder="description"
                    value={field.description ?? ''}
                    onChange={e => {
                      const copy = [...(value.requestBodyJsonFields || [])]
                      copy[i] = { ...field, description: e.target.value }
                      onChange({ ...value, requestBodyJsonFields: copy })
                    }}
                  />
                  <button
                    className="text-sm text-red-600 hover:cursor-pointer justify-self-end"
                    onClick={() => {
                      const copy = [...(value.requestBodyJsonFields || [])]
                      copy.splice(i, 1)
                      onChange({ ...value, requestBodyJsonFields: copy })
                    }}
                  >
                    Remove
                  </button>
                </div>
                  
                {/* Recursive child fields if array/object */}
                {(field.schemaType === 'array' || field.schemaType === 'object') && (
                  <div className="ml-4 border-l pl-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Children</span>
                      <button
                        className="text-sm underline hover:cursor-pointer"
                        onClick={() => {
                          const copy = [...(value.requestBodyJsonFields || [])]
                          const children = field.children ? [...field.children] : []
                          children.push({
                            property: 'childField',
                            schemaType: 'string',
                            example: '',
                            description: '',
                          })
                          copy[i] = { ...field, children }
                          onChange({ ...value, requestBodyJsonFields: copy })
                        }}
                      >
                        Add child
                      </button>
                    </div>
                      
                    {(field.children || []).map((child, j) => (
                      <div key={j} className="grid grid-cols-4 gap-2 items-center">
                        <input
                          className="p-1 border rounded"
                          placeholder="child property"
                          value={child.property}
                          onChange={e => {
                            const copy = [...(value.requestBodyJsonFields || [])]
                            const updatedChildren = [...(field.children || [])]
                            updatedChildren[j] = { ...child, property: e.target.value }
                            copy[i] = { ...field, children: updatedChildren }
                            onChange({ ...value, requestBodyJsonFields: copy })
                          }}
                        />
                        <select
                          className="p-1 border rounded"
                          value={child.schemaType || 'string'}
                          onChange={e => {
                            const copy = [...(value.requestBodyJsonFields || [])]
                            const updatedChildren = [...(field.children || [])]
                            updatedChildren[j] = { ...child, schemaType: e.target.value as any }
                            copy[i] = { ...field, children: updatedChildren }
                            onChange({ ...value, requestBodyJsonFields: copy })
                          }}
                        >
                          <option value="string">string</option>
                          <option value="integer">integer</option>
                          <option value="boolean">boolean</option>
                          <option value="number">number</option>
                          {/* 
                          <option value="array">array</option>
                          <option value="object">object</option>
                           */}
                        </select>
                        <input
                          className={`p-1 border rounded ${child.schemaType === 'object' || child.schemaType === 'array' ? 'cursor-not-allowed' : ''}`}
                          placeholder={
                            child.schemaType === 'object' || child.schemaType === 'array'
                              ? 'disabled'
                              : 'example'
                          }
                          disabled={child.schemaType === 'object' || child.schemaType === 'array'}
                          title={
                            child.schemaType === 'object' || child.schemaType === 'array'
                              ? 'Field is disabled for object and array types'
                              : ''
                          }
                          value={String(child.example ?? '')}
                          onChange={e => {
                            const copy = [...(value.requestBodyJsonFields || [])]
                            const updatedChildren = [...(field.children || [])]
                            updatedChildren[j] = { ...child, example: e.target.value }
                            copy[i] = { ...field, children: updatedChildren }
                            onChange({ ...value, requestBodyJsonFields: copy })
                          }}
                        />
                        <button
                          className="text-sm text-red-600 hover:cursor-pointer"
                          onClick={() => {
                            const copy = [...(value.requestBodyJsonFields || [])]
                            const updatedChildren = [...(field.children || [])]
                            updatedChildren.splice(j, 1)
                            copy[i] = { ...field, children: updatedChildren }
                            onChange({ ...value, requestBodyJsonFields: copy })
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
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
            <div key={i} className="grid grid-cols-3 gap-2 items-center">
              <input className="p-1 border rounded" value={r.code} onChange={e => onChange({ ...value, responses: value.responses!.map((rr, idx) => idx === i ? { ...rr, code: e.target.value } : rr) })} />
              <input className="p-1 border rounded col-span-1" value={r.description} onChange={e => onChange({ ...value, responses: value.responses!.map((rr, idx) => idx === i ? { ...rr, description: e.target.value } : rr) })} />
              <button className="text-sm text-red-600 hover:cursor-pointer" onClick={() => onChange({ ...value, responses: value.responses!.filter((_, idx) => idx !== i) })}>Remove</button>
            </div>
          ))}
        </div>
      </div>

    </div>
  )
}
