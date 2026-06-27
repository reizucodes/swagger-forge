import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import type { AnnotationGenerator } from "@/core/annotation/contracts/AnnotationGenerator"
import type { SpecVersion } from "@/core/annotation/specs"

function buildSecurityScheme(security: Endpoint['security'], spec: SpecVersion): Record<string, unknown> | null {
    if (!security || security.type === 'none') return null

    if (spec.requestBodyStyle === 'body-parameter') {
        if (security.type === 'sanctum' || security.type === 'bearer') {
            return { bearerAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } }
        }
        if (security.type === 'jwt') {
            return { jwtAuth: { type: 'apiKey', in: 'header', name: 'Authorization' } }
        }
        if (security.type === 'apiKey') {
            return { apiKeyAuth: { type: 'apiKey', in: 'header', name: security.headerName || 'X-API-Key' } }
        }
    } else {
        if (security.type === 'sanctum' || security.type === 'bearer') {
            return { bearerAuth: { type: 'http', scheme: 'bearer' } }
        }
        if (security.type === 'apiKey') {
            return { apiKeyAuth: { type: 'apiKey', in: 'header', name: security.headerName || 'X-API-Key' } }
        }
        if (security.type === 'jwt') {
            return { jwtAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } }
        }
    }
    return null
}

function buildSecurityRequirement(security: Endpoint['security']): Record<string, unknown[]>[] | undefined {
    if (!security || security.type === 'none') return undefined
    if (security.type === 'sanctum' || security.type === 'bearer') return [{ bearerAuth: [] }]
    if (security.type === 'apiKey') return [{ apiKeyAuth: [] }]
    if (security.type === 'jwt') return [{ jwtAuth: [] }]
    return undefined
}

function jsonFieldsToSchema(fields: JsonField[]): Record<string, unknown> {
    const properties: Record<string, unknown> = {}
    const required: string[] = []
    for (const f of fields) {
        const prop: Record<string, unknown> = { type: f.schemaType ?? 'string' }
        if (f.description) prop.description = f.description
        if (f.example !== undefined && f.example !== '') prop.example = f.example
        if (f.children?.length) {
            if (f.schemaType === 'object') prop.properties = jsonFieldsToSchema(f.children).properties
            if (f.schemaType === 'array') prop.items = { type: 'object', properties: jsonFieldsToSchema(f.children).properties }
        }
        properties[f.property] = prop
        if (f.required) required.push(f.property)
    }
    return { type: 'object', properties, ...(required.length ? { required } : {}) }
}

export class OpenApiJsonGenerator implements AnnotationGenerator {
    generate(endpoint: Endpoint, spec: SpecVersion): string {
        const securityScheme = buildSecurityScheme(endpoint.security, spec)
        const isSwagger2 = spec.requestBodyStyle === 'body-parameter'

        const securityBlock = securityScheme
            ? isSwagger2
                ? { securityDefinitions: securityScheme }
                : { components: { securitySchemes: securityScheme } }
            : {}

        const hasBody = endpoint.requestBodyJsonFields?.length && endpoint.method !== 'get'
        const bodyParam = isSwagger2 && hasBody
            ? [{
                in: 'body',
                name: 'body',
                required: true,
                schema: jsonFieldsToSchema(endpoint.requestBodyJsonFields!),
            }]
            : []

        const requestBodyBlock = !isSwagger2 && hasBody
            ? {
                requestBody: {
                    required: true,
                    content: {
                        [endpoint.requestBodyContentType ?? 'application/json']: {
                            schema: jsonFieldsToSchema(endpoint.requestBodyJsonFields!),
                        },
                    },
                },
            }
            : {}

        const operation: Record<string, unknown> = {
            summary: endpoint.summary,
            description: endpoint.description,
            operationId: endpoint.operationId,
            tags: endpoint.tags ? [endpoint.tags] : undefined,
            security: buildSecurityRequirement(endpoint.security),
            ...(bodyParam.length ? { parameters: bodyParam } : {}),
            ...requestBodyBlock,
            responses: Object.fromEntries(
                (endpoint.responses ?? []).map(r => [
                    r.code ?? '200',
                    {
                        description: r.description ?? '',
                        ...(r.schema?.length ? {
                            ...(isSwagger2
                                ? { schema: jsonFieldsToSchema(r.schema) }
                                : { content: { 'application/json': { schema: jsonFieldsToSchema(r.schema) } } }
                            )
                        } : {})
                    }
                ])
            ),
        }

        const spec_doc = {
            [spec.openApiVersionKey]: spec.openApiVersionValue,
            ...securityBlock,
            paths: {
                [endpoint.path]: {
                    [endpoint.method.toLowerCase()]: operation,
                },
            },
        }

        return JSON.stringify(spec_doc, null, 2)
    }
}
