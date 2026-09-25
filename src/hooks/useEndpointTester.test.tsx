// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useEndpointTester } from '@/hooks/useEndpointTester'

afterEach(() => {
  vi.restoreAllMocks()
})

function response(body: string, status = 200): Response {
  return new Response(body, {
    status,
    headers: { 'content-type': 'application/json' },
  })
}

describe('useEndpointTester console history', () => {
  it('keeps the five newest requests and responses independently', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockImplementation(async url => response(JSON.stringify({ url })))
    const { result } = renderHook(() => useEndpointTester())

    act(() => result.current.setUrl('https://example.test/1'))
    for (let index = 1; index <= 6; index += 1) {
      act(() => result.current.setUrl(`https://example.test/${index}`))
      await act(async () => { await result.current.send() })
    }

    expect(fetchMock).toHaveBeenCalledTimes(6)
    expect(result.current.requestHistory).toHaveLength(5)
    expect(result.current.responseHistory).toHaveLength(5)
    expect(result.current.requestHistory.every(entry => entry.timestamp > 0)).toBe(true)
    expect(result.current.responseHistory.every(entry => entry.timestamp > 0)).toBe(true)
    expect(result.current.requestHistory.map(entry => entry.snapshot.url)).toEqual([
      'https://example.test/2',
      'https://example.test/3',
      'https://example.test/4',
      'https://example.test/5',
      'https://example.test/6',
    ])
    expect(result.current.responseHistory.map(entry => entry.requestSnapshot.url)).toEqual([
      'https://example.test/2',
      'https://example.test/3',
      'https://example.test/4',
      'https://example.test/5',
      'https://example.test/6',
    ])
  })

  it('retains network errors as response history entries', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('offline'))
    const { result } = renderHook(() => useEndpointTester())

    act(() => result.current.setUrl('https://example.test/fails'))
    await act(async () => { await result.current.send() })

    expect(result.current.state.status).toBe('error')
    expect(result.current.responseHistory).toHaveLength(1)
    expect(result.current.responseHistory[0].response.statusCode).toBe(0)
    expect(result.current.responseHistory[0].requestSnapshot.url).toBe('https://example.test/fails')
  })

  it('clears history and ignores a completion after reset', async () => {
    let resolveFetch: (value: Response) => void = () => undefined
    vi.spyOn(globalThis, 'fetch').mockImplementation(() => new Promise(resolve => {
      resolveFetch = resolve
    }))
    const { result } = renderHook(() => useEndpointTester())

    act(() => result.current.setUrl('https://example.test/stale'))
    let sendPromise: Promise<void>
    act(() => { sendPromise = result.current.send() })
    expect(result.current.requestHistory).toHaveLength(1)

    act(() => result.current.reset())
    expect(result.current.requestHistory).toHaveLength(0)
    expect(result.current.responseHistory).toHaveLength(0)

    resolveFetch(response('{"stale":true}'))
    await act(async () => { await sendPromise })

    expect(result.current.requestHistory).toHaveLength(0)
    expect(result.current.responseHistory).toHaveLength(0)
    expect(result.current.state.status).toBe('idle')
  })

  it('clears console history while preserving the request form', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(response('{"ok":true}'))
    const { result } = renderHook(() => useEndpointTester())

    act(() => {
      result.current.setUrl('https://example.test/keep-form')
      result.current.setBody('{"name":"Ada"}')
    })
    await act(async () => { await result.current.send() })
    expect(result.current.requestHistory).toHaveLength(1)

    act(() => result.current.clearHistory())

    expect(result.current.state.url).toBe('https://example.test/keep-form')
    expect(result.current.state.body).toBe('{"name":"Ada"}')
    expect(result.current.requestHistory).toHaveLength(0)
    expect(result.current.responseHistory).toHaveLength(0)
    expect(result.current.state.response).toBeNull()
  })
})

describe('useEndpointTester header rows', () => {
  it('keeps one trailing blank row and appends only when the last row is edited', () => {
    const { result } = renderHook(() => useEndpointTester())
    const firstId = result.current.state.headers[0].id

    expect(result.current.state.headers).toHaveLength(1)
    act(() => result.current.updateHeader(firstId, 'key', 'Accept'))
    expect(result.current.state.headers).toHaveLength(2)
    expect(result.current.state.headers[1]).toMatchObject({ key: '', value: '' })

    act(() => result.current.updateHeader(firstId, 'value', 'application/json'))
    expect(result.current.state.headers).toHaveLength(2)

    const lastId = result.current.state.headers[1].id
    act(() => result.current.updateHeader(lastId, 'value', '{{token}}'))
    expect(result.current.state.headers).toHaveLength(3)
    expect(result.current.state.headers[2]).toMatchObject({ key: '', value: '' })

    act(() => result.current.removeHeader(firstId))
    act(() => result.current.removeHeader(lastId))
    act(() => result.current.removeHeader(result.current.state.headers[0].id))
    expect(result.current.state.headers).toHaveLength(1)
    expect(result.current.state.headers[0]).toMatchObject({ key: '', value: '' })
  })

  it('restores one blank header row on reset and sample loading', () => {
    const { result } = renderHook(() => useEndpointTester())
    const initialId = result.current.state.headers[0].id

    act(() => result.current.updateHeader(initialId, 'key', 'Accept'))
    act(() => result.current.loadSample())
    expect(result.current.state.headers).toHaveLength(1)
    expect(result.current.state.headers[0]).toMatchObject({ key: '', value: '' })

    act(() => result.current.updateHeader(result.current.state.headers[0].id, 'key', 'Accept'))
    act(() => result.current.reset())
    expect(result.current.state.headers).toHaveLength(1)
    expect(result.current.state.headers[0]).toMatchObject({ key: '', value: '' })
  })

  it('cleans redundant blank rows only after focus leaves the edited row', () => {
    const { result } = renderHook(() => useEndpointTester())
    const firstId = result.current.state.headers[0].id

    act(() => result.current.updateHeader(firstId, 'key', 'Accept'))
    act(() => result.current.updateHeader(firstId, 'key', ''))
    expect(result.current.state.headers).toHaveLength(2)

    act(() => result.current.cleanupHeaders())
    expect(result.current.state.headers).toHaveLength(1)
    expect(result.current.state.headers[0]).toMatchObject({ key: '', value: '' })

    act(() => result.current.updateHeader(result.current.state.headers[0].id, 'key', 'Content-Type'))
    const secondId = result.current.state.headers[1].id
    act(() => result.current.updateHeader(secondId, 'key', 'Accept'))
    act(() => result.current.updateHeader(result.current.state.headers[0].id, 'key', ''))
    act(() => result.current.cleanupHeaders())

    expect(result.current.state.headers).toHaveLength(2)
    expect(result.current.state.headers[0].key).toBe('Accept')
    expect(result.current.state.headers[1]).toMatchObject({ key: '', value: '' })
  })
})
