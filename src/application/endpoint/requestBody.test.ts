import { describe, it, expect } from 'vitest'
import { setRequestBodyContentType } from '@/application/endpoint/requestBody'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'

const BASE: Endpoint = {
  method: 'post',
  path: '/upload',
  requestBodyContentType: 'application/json',
  requestBodyJsonFields: [
    {
      id: 'f1',
      property: 'file',
      schemaType: 'object',
      children: [{ id: 'f2', property: 'name', schemaType: 'string' }],
    },
  ],
}

describe('setRequestBodyContentType', () => {
  it('returns same reference when contentType is unchanged', () => {
    const result = setRequestBodyContentType(BASE, 'application/json')
    expect(result).toBe(BASE)
  })

  it('updates contentType when switching to a new type', () => {
    const result = setRequestBodyContentType(BASE, 'application/x-www-form-urlencoded')
    expect(result.requestBodyContentType).toBe('application/x-www-form-urlencoded')
  })

  it('flattens nested fields when switching to multipart/form-data', () => {
    const result = setRequestBodyContentType(BASE, 'multipart/form-data')
    expect(result.requestBodyContentType).toBe('multipart/form-data')
    expect(result.requestBodyJsonFields).toBeDefined()
    // nested object is flattened: children dropped, schemaType coerced
    const field = result.requestBodyJsonFields![0]
    expect(field.schemaType).toBe('string')
    expect(field.children).toEqual([])
  })

  it('does not flatten fields when switching to application/json', () => {
    const formDataEndpoint: Endpoint = {
      ...BASE,
      requestBodyContentType: 'multipart/form-data',
    }
    const result = setRequestBodyContentType(formDataEndpoint, 'application/json')
    // children preserved as-is (no flattening for json)
    expect(result.requestBodyJsonFields![0].children).toHaveLength(1)
  })

  it('preserves other endpoint fields unchanged', () => {
    const result = setRequestBodyContentType(BASE, 'multipart/form-data')
    expect(result.method).toBe(BASE.method)
    expect(result.path).toBe(BASE.path)
  })
})
