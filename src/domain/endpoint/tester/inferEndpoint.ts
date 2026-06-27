import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { ResponseDef } from '@/domain/endpoint/models/Response'
import type { Parameter } from '@/domain/endpoint/models/Parameter'
import { objectToJsonField } from '@/domain/endpoint/transformers/objectToJsonField'
import { parsePathParams } from './parsePathParams'

interface InferState {
  method: string
  url: string
  auth: { type: 'none' | 'bearer' | 'apiKey'; value: string; headerName?: string }
  body: string
}

interface InferResponse {
  statusCode: number
  statusText: string
  bodyParsed: unknown | null
  isJson: boolean
}

export function inferEndpoint(state: InferState, response: InferResponse): Partial<Endpoint> {
  let path: string
  try {
    path = decodeURIComponent(new URL(state.url).pathname)
  } catch {
    path = state.url
  }
  path = path.replace(/\{\{[^}]*\}\}/g, '')

  const paramNames = parsePathParams(path)
  const parameters: Parameter[] = paramNames.map(name => ({
    id: globalThis.crypto.randomUUID(),
    name,
    in: 'path',
    required: true,
    schemaType: 'string',
  }))

  let security: Endpoint['security']
  if (state.auth.type === 'bearer') {
    security = { type: 'bearer' }
  } else if (state.auth.type === 'apiKey') {
    security = { type: 'apiKey', headerName: state.auth.headerName ?? 'X-API-Key' }
  } else {
    security = { type: 'none' }
  }

  let requestBodyJsonFields: Endpoint['requestBodyJsonFields']
  let requestBodyContentType: Endpoint['requestBodyContentType']
  if (state.body) {
    try {
      const parsed = JSON.parse(state.body)
      requestBodyJsonFields = objectToJsonField(parsed)
      requestBodyContentType = 'application/json'
    } catch {
      // invalid JSON — skip
    }
  }

  let responseSchema: import('@/domain/endpoint/models/JsonField').JsonField[] = []
  if (response.isJson && response.bodyParsed !== null) {
    if (Array.isArray(response.bodyParsed)) {
      const first = response.bodyParsed[0]
      responseSchema = [{
        id: globalThis.crypto.randomUUID(),
        property: 'data',
        schemaType: 'array' as const,
        description: '',
        example: '',
        children: first && typeof first === 'object' && !Array.isArray(first)
          ? objectToJsonField(first as Record<string, unknown>)
          : [],
      }]
    } else {
      responseSchema = objectToJsonField(response.bodyParsed as Record<string, unknown>)
    }
  }

  const responseDef: ResponseDef = {
    id: globalThis.crypto.randomUUID(),
    code: String(response.statusCode),
    description: response.statusText,
    schema: responseSchema,
  }

  return {
    method: state.method as Endpoint['method'],
    path,
    parameters,
    security,
    requestBodyJsonFields,
    requestBodyContentType,
    responses: [responseDef],
    operationId: undefined,
    tags: undefined,
    summary: undefined,
    description: undefined,
  }
}
