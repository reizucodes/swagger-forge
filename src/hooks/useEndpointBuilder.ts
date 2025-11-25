import { useState } from 'react'
import type { Endpoint, HttpMethod, Parameter, ResponseDef, JsonField } from '../types/index'
import { EMPTY_ENDPOINT } from '../constants/endpoint';


function getAllowedSections(method: HttpMethod) {
    switch (method) {
        case 'get':
            return { path: true, query: true, body: false }
        case 'post':
        case 'put':
        case 'patch':
            return { path: true, query: true, body: true }
        case 'delete':
        return { path: true, query: true, body: false }
        default:
            return { path: true, query: true, body: false }
    }
}

export function useEndpointBuilder() {
    const [endpoint, setEndpoint] = useState<Endpoint>(EMPTY_ENDPOINT)

    const allowed = getAllowedSections(endpoint.method)

    const update = (patch: Partial<Endpoint>) => setEndpoint(prev => ({ ...prev, ...patch }))
    const setParameters = (params: Parameter[]) => setEndpoint(p => ({ ...p, parameters: params }))
    const setResponses = (responses: ResponseDef[]) => setEndpoint(p => ({ ...p, responses }))
    const setJsonFields = (fields: JsonField[]) => setEndpoint(p => ({ ...p, requestBodyJsonFields: fields }))

    return {
        endpoint,
        update,
        setParameters,
        setResponses,
        setJsonFields,
        allowed,
    }
}
