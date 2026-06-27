import { describe, it, expect } from 'vitest'
import { inferEndpoint } from './inferEndpoint'

const baseState = {
  method: 'get',
  url: 'https://api.example.com/users/42',
  auth: { type: 'none' as const, value: '', headerName: '' },
  body: '',
}

const baseResponse = {
  statusCode: 200,
  statusText: 'OK',
  bodyParsed: null,
  isJson: false,
}

describe('inferEndpoint', () => {
  it('extracts pathname from full URL', () => {
    const result = inferEndpoint(baseState, baseResponse)
    expect(result.path).toBe('/users/42')
  })

  it('falls back to raw url if URL is invalid', () => {
    const result = inferEndpoint({ ...baseState, url: 'not-a-url' }, baseResponse)
    expect(result.path).toBe('not-a-url')
  })

  it('maps path params as Parameter[] with in: path', () => {
    const result = inferEndpoint(
      { ...baseState, url: 'https://api.example.com/users/{id}/posts/{postId}' },
      baseResponse
    )
    expect(result.parameters).toHaveLength(2)
    expect(result.parameters![0].name).toBe('id')
    expect(result.parameters![0].in).toBe('path')
    expect(result.parameters![0].required).toBe(true)
    expect(result.parameters![0].schemaType).toBe('string')
    expect(result.parameters![1].name).toBe('postId')
  })

  it('maps bearer auth correctly', () => {
    const result = inferEndpoint(
      { ...baseState, auth: { type: 'bearer', value: 'tok', headerName: '' } },
      baseResponse
    )
    expect(result.security).toEqual({ type: 'bearer' })
  })

  it('maps apiKey auth with headerName', () => {
    const result = inferEndpoint(
      { ...baseState, auth: { type: 'apiKey', value: 'key', headerName: 'X-My-Key' } },
      baseResponse
    )
    expect(result.security).toEqual({ type: 'apiKey', headerName: 'X-My-Key' })
  })

  it('maps none auth correctly', () => {
    const result = inferEndpoint(baseState, baseResponse)
    expect(result.security).toEqual({ type: 'none' })
  })

  it('parses body JSON into requestBodyJsonFields', () => {
    const result = inferEndpoint(
      { ...baseState, method: 'post', body: '{"name":"Alice","age":30}' },
      baseResponse
    )
    expect(result.requestBodyJsonFields).toHaveLength(2)
    expect(result.requestBodyContentType).toBe('application/json')
  })

  it('ignores invalid body JSON', () => {
    const result = inferEndpoint(
      { ...baseState, method: 'post', body: 'not json' },
      baseResponse
    )
    expect(result.requestBodyJsonFields).toBeUndefined()
  })

  it('maps JSON response body to schema', () => {
    const result = inferEndpoint(baseState, {
      statusCode: 200,
      statusText: 'OK',
      bodyParsed: { id: 1, name: 'Bob' },
      isJson: true,
    })
    expect(result.responses![0].schema).toHaveLength(2)
  })

  it('sets empty schema for non-JSON response', () => {
    const result = inferEndpoint(baseState, {
      statusCode: 200,
      statusText: 'OK',
      bodyParsed: null,
      isJson: false,
    })
    expect(result.responses![0].schema).toEqual([])
  })

  it('includes statusCode and statusText in response', () => {
    const result = inferEndpoint(baseState, {
      statusCode: 404,
      statusText: 'Not Found',
      bodyParsed: null,
      isJson: false,
    })
    expect(result.responses![0].code).toBe('404')
    expect(result.responses![0].description).toBe('Not Found')
  })
})
