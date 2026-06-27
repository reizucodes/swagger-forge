interface BuildRequestState {
  method: string
  url: string
  auth: { type: 'none' | 'bearer' | 'apiKey'; value: string; headerName?: string }
  headers: { id: string; key: string; value: string }[]
  body: string
}

export function buildRequest(state: BuildRequestState): { url: string; init: RequestInit } {
  const headers: Record<string, string> = {}

  for (const h of state.headers) {
    if (h.key.trim() !== '') {
      headers[h.key] = h.value
    }
  }

  if (state.auth.type === 'bearer' && state.auth.value) {
    headers['Authorization'] = `Bearer ${state.auth.value}`
  } else if (state.auth.type === 'apiKey' && state.auth.value) {
    const headerName = state.auth.headerName || 'X-API-Key'
    headers[headerName] = state.auth.value
  }

  const method = state.method.toUpperCase()
  const hasBody = ['POST', 'PUT', 'PATCH'].includes(method)

  let body: string | undefined
  if (hasBody && state.body) {
    body = state.body
    if (!headers['Content-Type']) {
      headers['Content-Type'] = 'application/json'
    }
  }

  return {
    url: state.url,
    init: { method, headers, body },
  }
}
