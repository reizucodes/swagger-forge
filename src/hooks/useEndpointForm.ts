import { useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint';
import { EMPTY_ENDPOINT } from '@/constants/endpoint';
import { getAllowedSections } from '@/domain/endpoint/builders/EndpointBuilder';

export function useEndpointForm() {
    const [endpoint, setEndpoint] = useState<Endpoint>(EMPTY_ENDPOINT)

    const allowed = getAllowedSections(endpoint.method)

    const update = (patch: Partial<Endpoint>) =>
        setEndpoint(prev => ({ ...prev, ...patch }))

    return {
        endpoint,
        update,
        allowed,
    }
}
