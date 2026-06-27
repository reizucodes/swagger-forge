import { useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint';
import { EMPTY_ENDPOINT } from '@/constants/endpoint';
import { getAllowedSections } from '@/domain/endpoint/builders/EndpointBuilder';

const LS_KEY = 'sf:endpoint'

function loadEndpoint(): Endpoint {
    try {
        const raw = localStorage.getItem(LS_KEY)
        if (!raw) return EMPTY_ENDPOINT
        const parsed = JSON.parse(raw)
        // must have at least method and path to be considered valid
        if (typeof parsed?.method === 'string' && typeof parsed?.path === 'string') {
            return { ...EMPTY_ENDPOINT, ...parsed }
        }
    } catch {
        // ignore parse errors
    }
    return EMPTY_ENDPOINT
}

export function useEndpointForm() {
    const [endpoint, setEndpoint] = useState<Endpoint>(loadEndpoint)

    const allowed = getAllowedSections(endpoint.method)

    const update = (patch: Partial<Endpoint>) =>
        setEndpoint(prev => {
            const next = { ...prev, ...patch }
            localStorage.setItem(LS_KEY, JSON.stringify(next))
            return next
        })

    return {
        endpoint,
        update,
        allowed,
    }
}
