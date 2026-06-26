// @vitest-environment jsdom
import { describe, it, expect } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { useEndpointForm } from '@/hooks/useEndpointForm'
import { EMPTY_ENDPOINT } from '@/constants/endpoint'

describe('useEndpointForm', () => {
  it('initial endpoint matches EMPTY_ENDPOINT structure', () => {
    const { result } = renderHook(() => useEndpointForm())
    expect(result.current.endpoint.method).toBe(EMPTY_ENDPOINT.method)
    expect(result.current.endpoint.path).toBe(EMPTY_ENDPOINT.path)
    expect(result.current.endpoint.parameters).toEqual([])
    expect(result.current.endpoint.requestBodyJsonFields).toEqual([])
  })

  it('update patches a single field on the endpoint', () => {
    const { result } = renderHook(() => useEndpointForm())
    act(() => {
      result.current.update({ path: '/users' })
    })
    expect(result.current.endpoint.path).toBe('/users')
  })

  it('update does not clobber unrelated fields', () => {
    const { result } = renderHook(() => useEndpointForm())
    act(() => {
      result.current.update({ operationId: 'listUsers' })
    })
    expect(result.current.endpoint.method).toBe(EMPTY_ENDPOINT.method)
    expect(result.current.endpoint.operationId).toBe('listUsers')
  })

  it('adding a parameter via update gives it a non-empty string id', () => {
    const { result } = renderHook(() => useEndpointForm())
    const newParam = { id: crypto.randomUUID(), name: 'limit', in: 'query' as const, required: false }
    act(() => {
      result.current.update({ parameters: [newParam] })
    })
    expect(result.current.endpoint.parameters).toHaveLength(1)
    expect(typeof result.current.endpoint.parameters![0].id).toBe('string')
    expect(result.current.endpoint.parameters![0].id.length).toBeGreaterThan(0)
  })

  it('adding two parameters gives them distinct ids', () => {
    const { result } = renderHook(() => useEndpointForm())
    const p1 = { id: crypto.randomUUID(), name: 'limit', in: 'query' as const }
    const p2 = { id: crypto.randomUUID(), name: 'offset', in: 'query' as const }
    act(() => {
      result.current.update({ parameters: [p1, p2] })
    })
    const ids = result.current.endpoint.parameters!.map(p => p.id)
    expect(ids[0]).not.toBe(ids[1])
  })

  it('adding a response via update gives it a non-empty string id', () => {
    const { result } = renderHook(() => useEndpointForm())
    const newResponse = { id: crypto.randomUUID(), code: '', description: '' }
    act(() => {
      result.current.update({ responses: [...(result.current.endpoint.responses ?? []), newResponse] })
    })
    const added = result.current.endpoint.responses!.find(r => r.id === newResponse.id)
    expect(added).toBeDefined()
    expect(typeof added!.id).toBe('string')
    expect(added!.id.length).toBeGreaterThan(0)
  })

  it('new response defaults code to empty string', () => {
    const { result } = renderHook(() => useEndpointForm())
    const newResponse = { id: crypto.randomUUID(), code: '', description: '' }
    act(() => {
      result.current.update({ responses: [newResponse] })
    })
    expect(result.current.endpoint.responses![0].code).toBe('')
  })

  it('new response defaults description to empty string', () => {
    const { result } = renderHook(() => useEndpointForm())
    const newResponse = { id: crypto.randomUUID(), code: '', description: '' }
    act(() => {
      result.current.update({ responses: [newResponse] })
    })
    expect(result.current.endpoint.responses![0].description).toBe('')
  })

  it('GET method has body section disallowed', () => {
    const { result } = renderHook(() => useEndpointForm())
    act(() => {
      result.current.update({ method: 'get' })
    })
    expect(result.current.allowed.body).toBe(false)
  })

  it('POST method has body section allowed', () => {
    const { result } = renderHook(() => useEndpointForm())
    act(() => {
      result.current.update({ method: 'post' })
    })
    expect(result.current.allowed.body).toBe(true)
  })
})
