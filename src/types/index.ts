export type HttpMethod = 'get' | 'post' | 'put' | 'patch' | 'delete'
export type ParamLocation = 'path' | 'query' | 'header'

export interface Parameter {
  name: string
  in: ParamLocation
  required?: boolean
  schemaType?: 'string' | 'integer' | 'boolean' | 'number'
  description?: string
  // TODO add example?
}

export type SchemaType =
  | 'string'
  | 'integer'
  | 'boolean'
  | 'number'
  | 'array'
  | 'object'

export interface JsonField {
  property: string
  schemaType?: SchemaType
  example?: string | number | boolean | unknown[] | Record<string, unknown>
  description?: string
  children?: JsonField[] // nested fields for arrays/objects
}

export interface ResponseDef {
  code?: string // optional - generator will supply default if missing
  description?: string
  example?: unknown
}

export interface Endpoint {
  method: HttpMethod
  path: string
  operationId?: string
  tags?: string
  summary?: string
  description?: string
  parameters?: Parameter[]
  requestBodyJsonFields?: JsonField[] // per-field schema
  responses?: ResponseDef[]
  security?: { bearer?: boolean }
}
