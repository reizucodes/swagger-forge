import { describe, it, expect } from 'vitest'
import { buildRequest } from './buildRequest'

const baseState = {
  method: 'get',
  url: 'https://api.example.com/users',
  auth: { type: 'none' as const, value: '', headerName: '' },
  headers: [],
  body: '',
}

describe('buildRequest', () => {
  it('GET with no auth produces no body and no auth header', () => {
    const { url, init } = buildRequest(baseState)
    expect(url).toBe('https://api.example.com/users')
    expect(init.method).toBe('GET')
    expect(init.body).toBeUndefined()
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('POST with bearer token sets Authorization header', () => {
    const { init } = buildRequest({
      ...baseState,
      method: 'post',
      auth: { type: 'bearer', value: 'my-token', headerName: '' },
    })
    expect((init.headers as Record<string, string>)['Authorization']).toBe('Bearer my-token')
  })

  it('apiKey auth with custom headerName uses that header', () => {
    const { init } = buildRequest({
      ...baseState,
      auth: { type: 'apiKey', value: 'secret', headerName: 'X-Custom-Key' },
    })
    expect((init.headers as Record<string, string>)['X-Custom-Key']).toBe('secret')
  })

  it('apiKey auth falls back to X-API-Key when headerName is empty', () => {
    const { init } = buildRequest({
      ...baseState,
      auth: { type: 'apiKey', value: 'secret', headerName: '' },
    })
    expect((init.headers as Record<string, string>)['X-API-Key']).toBe('secret')
  })

  it('empty auth value does not set auth header', () => {
    const { init } = buildRequest({
      ...baseState,
      auth: { type: 'bearer', value: '', headerName: '' },
    })
    expect((init.headers as Record<string, string>)['Authorization']).toBeUndefined()
  })

  it('custom headers are included in output', () => {
    const { init } = buildRequest({
      ...baseState,
      headers: [{ id: '1', key: 'X-Request-ID', value: 'abc' }],
    })
    expect((init.headers as Record<string, string>)['X-Request-ID']).toBe('abc')
  })

  it('empty key custom headers are filtered out', () => {
    const { init } = buildRequest({
      ...baseState,
      headers: [{ id: '1', key: '', value: 'ignored' }],
    })
    expect(Object.keys(init.headers as Record<string, string>)).not.toContain('')
  })

  it('POST with body sets body and Content-Type', () => {
    const { init } = buildRequest({
      ...baseState,
      method: 'post',
      body: '{"name":"test"}',
    })
    expect(init.body).toBe('{"name":"test"}')
    expect((init.headers as Record<string, string>)['Content-Type']).toBe('application/json')
  })

  it('PUT with body sets body', () => {
    const { init } = buildRequest({ ...baseState, method: 'put', body: '{"x":1}' })
    expect(init.body).toBe('{"x":1}')
  })

  it('PATCH with body sets body', () => {
    const { init } = buildRequest({ ...baseState, method: 'patch', body: '{"x":1}' })
    expect(init.body).toBe('{"x":1}')
  })

  it('GET with body string does not include body', () => {
    const { init } = buildRequest({ ...baseState, method: 'get', body: '{"x":1}' })
    expect(init.body).toBeUndefined()
  })

  it('DELETE with body string does not include body', () => {
    const { init } = buildRequest({ ...baseState, method: 'delete', body: '{"x":1}' })
    expect(init.body).toBeUndefined()
  })
})
