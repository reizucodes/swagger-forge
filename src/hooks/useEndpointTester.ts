import { useState, useEffect, useRef } from 'react'
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

export interface RequestLogEntry {
  id: number
  timestamp: number
  snapshot: RequestSnapshot
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

export interface ResponseLogEntry {
  id: number
  timestamp: number
  response: TesterResponse
  errorMessage: string | null
  requestSnapshot: RequestSnapshot
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
  requestHistory: RequestLogEntry[]
  responseHistory: ResponseLogEntry[]
}

function createEmptyHeader() {
  return { id: globalThis.crypto.randomUUID(), key: '', value: '' }
}

function createInitialState(): TesterState {
  return {
    method: 'get',
    url: '',
    auth: { type: 'none', value: '', headerName: 'X-API-Key' },
    headers: [createEmptyHeader()],
    body: '',
    status: 'idle',
    errorMessage: null,
    response: null,
    resolveWarnings: [],
    requestSnapshot: null,
    requestHistory: [],
    responseHistory: [],
  }
}

export function useEndpointTester() {
  const [state, setState] = useState<TesterState>(createInitialState)
  const [envVariables, setEnvVariables] = useState<EnvVariable[]>(() => loadEnvVariables())
  const requestIdRef = useRef(0)
  const runGenerationRef = useRef(0)

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
    setState(prev => {
      const headers = prev.headers.map(h => (h.id === id ? { ...h, [field]: value } : h))
      const editedIndex = headers.findIndex(h => h.id === id)
      const editedHeader = editedIndex >= 0 ? headers[editedIndex] : undefined
      const isLastRow = editedIndex === headers.length - 1
      if (isLastRow && editedHeader && (editedHeader.key.trim() !== '' || editedHeader.value.trim() !== '')) {
        return { ...prev, headers: [...headers, createEmptyHeader()] }
      }
      return { ...prev, headers }
    })

  const removeHeader = (id: string) =>
    setState(prev => {
      const headers = prev.headers.filter(h => h.id !== id)
      return { ...prev, headers: headers.length > 0 ? headers : [createEmptyHeader()] }
    })

  const cleanupHeaders = () =>
    setState(prev => {
      const populatedHeaders = prev.headers.filter(h => h.key.trim() !== '' || h.value.trim() !== '')
      const lastHeader = prev.headers[prev.headers.length - 1]
      const trailingBlank = lastHeader && lastHeader.key.trim() === '' && lastHeader.value.trim() === ''
        ? lastHeader
        : createEmptyHeader()
      return { ...prev, headers: [...populatedHeaders, trailingBlank] }
    })

  const setBody = (body: string) =>
    setState(prev => ({ ...prev, body }))

  const loadSample = () =>
    setState(prev => ({
      ...prev,
      method: 'get',
      url: 'https://jsonplaceholder.typicode.com/posts',
      auth: { type: 'none', value: '', headerName: 'X-API-Key' },
      headers: [createEmptyHeader()],
      body: '',
      status: 'idle',
      errorMessage: null,
      response: null,
    }))

  const reset = () => {
    runGenerationRef.current += 1
    setState(createInitialState())
  }

  const clearHistory = () => {
    runGenerationRef.current += 1
    setState(prev => ({
      ...prev,
      status: 'idle',
      errorMessage: null,
      response: null,
      requestSnapshot: null,
      requestHistory: [],
      responseHistory: [],
    }))
  }

  const send = async (): Promise<void> => {
    if (!state.url.trim()) return

    const generation = runGenerationRef.current
    setState(prev => ({ ...prev, status: 'sending', errorMessage: null, response: null }))
    const start = performance.now()
    let requestSnapshotForRun: RequestSnapshot | null = null
    let requestIdForRun: number | null = null
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
      requestSnapshotForRun = {
        method: init.method as string,
        url,
        headers: (init.headers ?? {}) as Record<string, string>,
        body: init.body as string | undefined,
      }
      requestIdForRun = ++requestIdRef.current
      if (!requestSnapshotForRun) return
      const requestSnapshotForState = requestSnapshotForRun
      const requestIdForState = requestIdForRun
      const requestTimestamp = Date.now()
      setState(prev => ({
        ...prev,
        requestSnapshot: requestSnapshotForState,
        requestHistory: [...prev.requestHistory, { id: requestIdForState, timestamp: requestTimestamp, snapshot: requestSnapshotForState }].slice(-5),
      }))
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
      if (generation !== runGenerationRef.current) return
      if (!requestSnapshotForRun || requestIdForRun === null) return
      const responseLog: ResponseLogEntry = {
        id: requestIdForState,
        timestamp: Date.now(),
        response: {
          statusCode: res.status,
          statusText: res.statusText,
          headers,
          body: bodyText,
          bodyParsed,
          isJson,
          durationMs,
        },
        errorMessage: null,
        requestSnapshot: requestSnapshotForState,
      }
      setState(prev => ({
        ...prev,
        status: 'success',
        response: responseLog.response,
        responseHistory: [...prev.responseHistory, responseLog].slice(-5),
      }))
    } catch (err) {
      const durationMs = Math.round(performance.now() - start)
      if (generation !== runGenerationRef.current) return
      const errorMessage = detectCorsError(err)
        ? 'Network error — could not reach the server. Check the URL and your connection. If the endpoint exists, a CORS policy may be blocking cross-origin access.'
        : 'Network error — check the URL and your connection.'
      const errorResponse: TesterResponse = { statusCode: 0, statusText: '', headers: {}, body: '', bodyParsed: null, isJson: false, durationMs }
      if (!requestSnapshotForRun || requestIdForRun === null) {
        setState(prev => ({ ...prev, status: 'error', errorMessage, response: errorResponse }))
        return
      }
      const requestSnapshotForError = requestSnapshotForRun
      const requestIdForError = requestIdForRun
      setState(prev => ({
        ...prev,
        status: 'error',
        errorMessage,
        response: errorResponse,
        responseHistory: [...prev.responseHistory, { id: requestIdForError, timestamp: Date.now(), response: errorResponse, errorMessage, requestSnapshot: requestSnapshotForError }].slice(-5),
      }))
    }
  }

  const getEndpointPatch = (response = state.response, requestSnapshot = state.requestSnapshot): Partial<Endpoint> => {
    if (!response || response.statusCode === 0 || !requestSnapshot) return {}
    return inferEndpoint({
      ...state,
      method: requestSnapshot.method as HttpMethod,
      url: requestSnapshot.url,
      body: requestSnapshot.body ?? '',
    }, response)
  }

  return {
    state,
    setMethod,
    setUrl,
    setAuth,
    addHeader,
    updateHeader,
    removeHeader,
    cleanupHeaders,
    setBody,
    send,
    loadSample,
    reset,
    clearHistory,
    getEndpointPatch,
    envVariables,
    addEnvVariable,
    updateEnvVariable,
    removeEnvVariable,
    requestSnapshot: state.requestSnapshot,
    requestHistory: state.requestHistory,
    responseHistory: state.responseHistory,
  }
}
