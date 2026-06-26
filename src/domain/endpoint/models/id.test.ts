import { describe, it, expect } from 'vitest'
import type { Parameter } from '@/domain/endpoint/models/Parameter'
import type { ResponseDef } from '@/domain/endpoint/models/Response'
import type { JsonField } from '@/domain/endpoint/models/JsonField'

const parameter: Parameter = {
  id: 'param-abc',
  name: 'userId',
  in: 'query',
  required: false,
  description: '',
}

const responseDef: ResponseDef = {
  id: 'resp-xyz',
  code: '200',
  description: 'Success',
}

const jsonField: JsonField = {
  id: 'field-123',
  property: 'name',
  schemaType: 'string',
  description: '',
}

describe('Parameter', () => {
  it('has id field as a string', () => {
    expect(parameter.id).toBe('param-abc')
  })
})

describe('ResponseDef', () => {
  it('has id field as a string', () => {
    expect(responseDef.id).toBe('resp-xyz')
  })
})

describe('JsonField', () => {
  it('accepts id field as a string', () => {
    expect(jsonField.id).toBe('field-123')
  })
})
