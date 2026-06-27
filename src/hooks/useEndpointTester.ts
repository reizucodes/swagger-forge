import { useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { HttpMethod } from '@/domain/endpoint/models/enums'
import { buildRequest } from '@/domain/endpoint/tester/buildRequest'
import { detectCorsError } from '@/domain/endpoint/tester/detectCorsError'
import { inferEndpoint } from '@/domain/endpoint/tester/inferEndpoint'

export type TesterStatus = 'idle' | 'sending' | 'success' | 'error'
export type TesterAuthType = 'none' | 'bearer' | 'apiKey'

export interface TesterResponse {
  statusCode: number
  statusText: string
  headers: Record<string, string>
  body: string
  bodyParsed: unknown | null
  isJson: boolean
  durationMs: number
}

export interface TesterState {
  method: HttpMethod
  url: string
  auth: { type: TesterAuthType; value: string; headerName: string }
  headers: { id: string; key: string; value: string }[]
  body: string
  status: TesterStatus
  errorMessage: string | null
  response: TesterResponse | null
}

const initialState: TesterState = {
  method: 'get',
  url: '',
  auth: { type: 'none', value: '', headerName: 'X-API-Key' },
  headers: [],
  body: '',
  status: 'idle',
  errorMessage: null,
  response: null,
}

export function useEndpointTester() {
  const [state, setState] = useState<TesterState>(initialState)

  const setMethod = (method: HttpMethod) =>
    setState(prev => ({ ...prev, method }))

  const setUrl = (url: string) =>
    setState(prev => ({ ...prev, url }))

  const setAuth = (auth: Partial<TesterState['auth']>) =>
    setState(prev => ({ ...prev, auth: { ...prev.auth, ...auth } }))

  const addHeader = () =>
    setState(prev => ({
      ...prev,
      headers: [...prev.headers, { id: globalThis.crypto.randomUUID(), key: '', value: '' }],
    }))

  const updateHeader = (id: string, field: 'key' | 'value', value: string) =>
    setState(prev => ({
      ...prev,
      headers: prev.headers.map(h => (h.id === id ? { ...h, [field]: value } : h)),
    }))

  const removeHeader = (id: string) =>
    setState(prev => ({ ...prev, headers: prev.headers.filter(h => h.id !== id) }))

  const setBody = (body: string) =>
    setState(prev => ({ ...prev, body }))

  const loadSample = () =>
    setState(prev => ({
      ...prev,
      method: 'get',
      url: 'https://jsonplaceholder.typicode.com/posts',
      auth: { type: 'none', value: '', headerName: 'X-API-Key' },
      headers: [],
      body: '',
      status: 'idle',
      errorMessage: null,
      response: null,
    }))

  const reset = () => setState(initialState)

  const send = async (): Promise<void> => {
    setState(prev => ({ ...prev, status: 'sending', errorMessage: null, response: null }))
    const start = performance.now()
    try {
      const { url, init } = buildRequest(state)
      const res = await fetch(url, init)
      const durationMs = Math.round(performance.now() - start)
      const bodyText = await res.text()
      let bodyParsed: unknown = null
      const contentType = res.headers.get('content-type') ?? ''
      let isJson = contentType.includes('json')
      try {
        bodyParsed = JSON.parse(bodyText)
        if (!isJson) isJson = true
      } catch {
        isJson = false
      }
      const headers: Record<string, string> = {}
      res.headers.forEach((v, k) => { headers[k] = v })
      setState(prev => ({
        ...prev,
        status: 'success',
        response: {
          statusCode: res.status,
          statusText: res.statusText,
          headers,
          body: bodyText,
          bodyParsed,
          isJson,
          durationMs,
        },
      }))
    } catch (err) {
      const durationMs = Math.round(performance.now() - start)
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage: detectCorsError(err)
          ? 'Network error — could not reach the server. Check the URL and your connection. If the endpoint exists, a CORS policy may be blocking cross-origin access.'
          : 'Network error — check the URL and your connection.',
        response: { statusCode: 0, statusText: '', headers: {}, body: '', bodyParsed: null, isJson: false, durationMs },
      }))
    }
  }

  const getEndpointPatch = (): Partial<Endpoint> => {
    if (!state.response || state.response.statusCode === 0) return {}
    return inferEndpoint(state, state.response)
  }

  return {
    state,
    setMethod,
    setUrl,
    setAuth,
    addHeader,
    updateHeader,
    removeHeader,
    setBody,
    send,
    loadSample,
    reset,
    getEndpointPatch,
  }
}
