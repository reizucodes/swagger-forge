import swagger20 from './swagger-2.0.json'
import openapi303 from './openapi-3.0.3.json'
import openapi310 from './openapi-3.1.0.json'

export type SpecVersionId = 'swagger-2.0' | 'openapi-3.0.3' | 'openapi-3.1.0'

export interface SpecVersion {
    id: SpecVersionId
    label: string
    openApiVersionKey: 'swagger' | 'openapi'
    openApiVersionValue: string
    nullable: 'nullable-field' | 'type-union'
    requestBodyStyle: 'body-parameter' | 'request-body'
    securityKey: 'securityDefinitions' | 'components'
}

export const SPEC_VERSIONS: readonly SpecVersion[] = [swagger20, openapi303, openapi310] as SpecVersion[]

export function getSpecVersion(id: SpecVersionId): SpecVersion {
    return SPEC_VERSIONS.find(s => s.id === id)!
}
