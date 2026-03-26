import { useState } from 'react'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint';
import type { Parameter } from '@/domain/endpoint/models/Parameter';
import type { ResponseDef } from '@/domain/endpoint/models/Response';
import type { JsonField } from '@/domain/endpoint/models/JsonField';
import { EMPTY_ENDPOINT } from '@/constants/endpoint';
import { getAllowedSections } from '@/domain/endpoint/builders/EndpointBuilder';

export function useEndpointForm() {
    const [endpoint, setEndpoint] = useState<Endpoint>(EMPTY_ENDPOINT)

    const allowed = getAllowedSections(endpoint.method)

    const update = (patch: Partial<Endpoint>) => 
        setEndpoint(prev => ({ ...prev, ...patch }))

    const setParameters = (params: Parameter[]) => 
        setEndpoint(p => ({ ...p, parameters: params }))

    const setResponses = (responses: ResponseDef[]) => 
        setEndpoint(p => ({ ...p, responses }))

    const setJsonFields = (fields: JsonField[]) => 
        setEndpoint(p => ({ ...p, requestBodyJsonFields: fields }))

    return {
        endpoint,
        update,
        setParameters,
        setResponses,
        setJsonFields,
        allowed,
    }
}
