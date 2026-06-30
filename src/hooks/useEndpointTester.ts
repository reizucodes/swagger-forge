import { useState, useEffect } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { HttpMethod } from '@/domain/endpoint/models/enums'
import { buildRequest } from '@/domain/endpoint/tester/buildRequest'
import { detectCorsError } from '@/domain/endpoint/tester/detectCorsError'
import { inferEndpoint } from '@/domain/endpoint/tester/inferEndpoint'
import type { EnvVariable } from '@/domain/endpoint/tester/envVariables'
import { loadEnvVariables, saveEnvVariables, buildEnvMap } from '@/domain/endpoint/tester/envVariables'
import { resolveVariables } from '@/domain/endpoint/tester/resolveVariables'

export type TesterStatus = 'idle' | 'sending' | 'success' | 'error'
export type TesterAuthType = 'none' | 'bearer' | 'apiKey'

export interface RequestSnapshot {
  method: string
  url: string
  headers: Record<string, string>
  body: string | undefined
}

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
  resolveWarnings: string[]
  requestSnapshot: RequestSnapshot | null
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
  resolveWarnings: [],
  requestSnapshot: null,
}

export function useEndpointTester() {
  const [state, setState] = useState<TesterState>(initialState)
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>(() => loadEnvVariables())

  useEffect(() => { saveEnvVariables(envVariables) }, [envVariables])

  const addEnvVariable = () =>
    setEnvVariables(prev => [...prev, { id: globalThis.crypto.randomUUID(), name: '', value: '' }])

  const updateEnvVariable = (id: string, field: 'name' | 'value', value: string) =>
    setEnvVariables(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v))

  const removeEnvVariable = (id: string) =>
    setEnvVariables(prev => prev.filter(v => v.id !== id))

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
      const map = buildEnvMap(envVariables)
      const resolvedState: TesterState = {
        ...state,
        url: resolveVariables(state.url, map).resolved,
        auth: { ...state.auth, value: resolveVariables(state.auth.value, map).resolved },
        headers: state.headers.map(h => ({
          ...h,
          key: resolveVariables(h.key, map).resolved,
          value: resolveVariables(h.value, map).resolved,
        })),
        body: resolveVariables(state.body, map).resolved,
      }
      const allWarnings = [
        ...resolveVariables(state.url, map).unresolvedTokens,
        ...resolveVariables(state.auth.value, map).unresolvedTokens,
        ...state.headers.flatMap(h => [
          ...resolveVariables(h.key, map).unresolvedTokens,
          ...resolveVariables(h.value, map).unresolvedTokens,
        ]),
        ...resolveVariables(state.body, map).unresolvedTokens,
      ]
      const resolveWarnings = [...new Set(allWarnings.filter(Boolean))]
      setState(prev => ({ ...prev, resolveWarnings }))
      const { url, init } = buildRequest(resolvedState)
      const snapshot: RequestSnapshot = {
        method: init.method as string,
        url,
        headers: (init.headers ?? {}) as Record<string, string>,
        body: init.body as string | undefined,
      }
      setState(prev => ({ ...prev, requestSnapshot: snapshot }))
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
    envVariables,
    addEnvVariable,
    updateEnvVariable,
    removeEnvVariable,
    requestSnapshot: state.requestSnapshot,
  }
}
