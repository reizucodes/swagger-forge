import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import type { Parameter } from "@/domain/endpoint/models/Parameter"
import type { ResponseDef } from "@/domain/endpoint/models/Response"
import type { SpecVersion } from "@/core/annotation/specs"

function yamlStr(s: string): string {
    if (!s.includes('\n') && !s.includes('"') && !s.includes("'") && !s.includes(':') && !s.includes('#')) return s
    const escaped = s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
    return `"${escaped}"`
}

export function indent(level: number): string {
    return '  '.repeat(level)
}

export function jsdocLine(content: string): string {
    return ` * ${content}`
}

export function renderYamlSchema(fields: JsonField[], baseIndent: number): string[] {
    const lines: string[] = []
    const requiredFields = fields.filter(f => f.required).map(f => f.property)

    if (requiredFields.length) {
        lines.push(jsdocLine(`${indent(baseIndent)}required:`))
        for (const name of requiredFields) {
            lines.push(jsdocLine(`${indent(baseIndent + 1)}- ${name}`))
        }
    }

    lines.push(jsdocLine(`${indent(baseIndent)}properties:`))
    for (const f of fields) {
        const schemaType = f.schemaType ?? 'string'
        lines.push(jsdocLine(`${indent(baseIndent + 1)}${yamlStr(f.property)}:`))

        if (schemaType === 'file') {
            lines.push(jsdocLine(`${indent(baseIndent + 2)}type: string`))
            lines.push(jsdocLine(`${indent(baseIndent + 2)}format: binary`))
        } else if (schemaType === 'object' && f.children?.length) {
            lines.push(jsdocLine(`${indent(baseIndent + 2)}type: object`))
            lines.push(...renderYamlSchema(f.children, baseIndent + 2))
        } else if (schemaType === 'array' && f.children?.length) {
            lines.push(jsdocLine(`${indent(baseIndent + 2)}type: array`))
            lines.push(jsdocLine(`${indent(baseIndent + 2)}items:`))
            lines.push(jsdocLine(`${indent(baseIndent + 3)}type: object`))
            lines.push(...renderYamlSchema(f.children, baseIndent + 3))
        } else {
            lines.push(jsdocLine(`${indent(baseIndent + 2)}type: ${schemaType}`))
        }

        if (f.description) {
            lines.push(jsdocLine(`${indent(baseIndent + 2)}description: ${yamlStr(f.description)}`))
        }
        if (f.example !== undefined && f.example !== '') {
            const exampleStr = String(f.example)
            if (exampleStr.includes('\n')) {
                const escaped = exampleStr.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
                lines.push(jsdocLine(`${indent(baseIndent + 2)}example: "${escaped}"`))
            } else {
                lines.push(jsdocLine(`${indent(baseIndent + 2)}example: ${f.example}`))
            }
        }
    }
    return lines
}

export function renderSecurityBlock(security: Endpoint['security']): string[] {
    if (!security || security.type === 'none') return []
    const lines: string[] = []
    lines.push(jsdocLine(`${indent(2)}security:`))
    if (security.type === 'bearer' || security.type === 'sanctum') {
        lines.push(jsdocLine(`${indent(3)}- bearerAuth: []`))
    } else if (security.type === 'jwt') {
        lines.push(jsdocLine(`${indent(3)}- jwtAuth: []`))
    } else if (security.type === 'apiKey') {
        lines.push(jsdocLine(`${indent(3)}- apiKeyAuth: []`))
    }
    return lines
}

export function renderParameters(parameters: Parameter[]): string[] {
    if (!parameters.length) return []
    const lines: string[] = []
    lines.push(jsdocLine(`${indent(2)}parameters:`))
    for (const p of parameters) {
        lines.push(jsdocLine(`${indent(3)}- name: ${yamlStr(p.name)}`))
        lines.push(jsdocLine(`${indent(4)}in: ${p.in}`))
        lines.push(jsdocLine(`${indent(4)}required: ${p.in === 'path' ? true : (p.required ?? false)}`))
        if (p.description) {
            lines.push(jsdocLine(`${indent(4)}description: ${yamlStr(p.description)}`))
        }
        lines.push(jsdocLine(`${indent(4)}schema:`))
        lines.push(jsdocLine(`${indent(5)}type: ${p.schemaType ?? 'string'}`))
    }
    return lines
}

export function renderRequestBodySwagger2(endpoint: Endpoint): string[] {
    const fields = endpoint.requestBodyJsonFields
    if (!fields?.length || endpoint.method === 'get') return []
    const lines: string[] = []
    lines.push(jsdocLine(`${indent(2)}parameters:`))
    lines.push(jsdocLine(`${indent(3)}- in: body`))
    lines.push(jsdocLine(`${indent(4)}name: body`))
    lines.push(jsdocLine(`${indent(4)}required: true`))
    lines.push(jsdocLine(`${indent(4)}schema:`))
    lines.push(jsdocLine(`${indent(5)}type: object`))
    lines.push(...renderYamlSchema(fields, 5))
    return lines
}

export function renderRequestBodyOpenApi(endpoint: Endpoint): string[] {
    const fields = endpoint.requestBodyJsonFields
    if (!fields?.length || endpoint.method === 'get') return []
    const contentType = endpoint.requestBodyContentType ?? 'application/json'
    const lines: string[] = []
    lines.push(jsdocLine(`${indent(2)}requestBody:`))
    lines.push(jsdocLine(`${indent(3)}required: true`))
    lines.push(jsdocLine(`${indent(3)}content:`))
    lines.push(jsdocLine(`${indent(4)}${contentType}:`))
    lines.push(jsdocLine(`${indent(5)}schema:`))
    lines.push(jsdocLine(`${indent(6)}type: object`))
    lines.push(...renderYamlSchema(fields, 6))
    return lines
}

export function renderRequestBody(endpoint: Endpoint, spec: SpecVersion): string[] {
    if (spec.requestBodyStyle === 'body-parameter') {
        return renderRequestBodySwagger2(endpoint)
    }
    return renderRequestBodyOpenApi(endpoint)
}

export function renderResponses(responses: ResponseDef[], spec: SpecVersion): string[] {
    const lines: string[] = []
    lines.push(jsdocLine(`${indent(2)}responses:`))
    const isSwagger2 = spec.requestBodyStyle === 'body-parameter'

    const entries = responses.length ? responses : [{ id: 'default', code: '200', description: 'Success' }]
    for (const r of entries) {
        const code = r.code ?? '200'
        const description = r.description ?? ''
        lines.push(jsdocLine(`${indent(3)}'${code}':`))
        lines.push(jsdocLine(`${indent(4)}description: ${yamlStr(description)}`))
        if (r.schema?.length) {
            if (isSwagger2) {
                lines.push(jsdocLine(`${indent(4)}schema:`))
                lines.push(jsdocLine(`${indent(5)}type: object`))
                lines.push(...renderYamlSchema(r.schema, 5))
            } else {
                lines.push(jsdocLine(`${indent(4)}content:`))
                lines.push(jsdocLine(`${indent(5)}application/json:`))
                lines.push(jsdocLine(`${indent(6)}schema:`))
                lines.push(jsdocLine(`${indent(7)}type: object`))
                lines.push(...renderYamlSchema(r.schema, 7))
            }
        }
    }
    return lines
}

export function buildJsDocBlock(endpoint: Endpoint, spec: SpecVersion): string[] {
    const lines: string[] = []
    lines.push('/**')
    lines.push(jsdocLine('@openapi'))
    lines.push(jsdocLine(`${endpoint.path}:`))
    lines.push(jsdocLine(`${indent(1)}${endpoint.method.toLowerCase()}:`))

    if (endpoint.summary) {
        lines.push(jsdocLine(`${indent(2)}summary: ${yamlStr(endpoint.summary)}`))
    }
    if (endpoint.description) {
        lines.push(jsdocLine(`${indent(2)}description: ${yamlStr(endpoint.description)}`))
    }
    if (endpoint.operationId) {
        lines.push(jsdocLine(`${indent(2)}operationId: ${yamlStr(endpoint.operationId)}`))
    }
    if (endpoint.tags) {
        lines.push(jsdocLine(`${indent(2)}tags:`))
        lines.push(jsdocLine(`${indent(3)}- ${yamlStr(endpoint.tags)}`))
    }

    lines.push(...renderSecurityBlock(endpoint.security))
    lines.push(...renderParameters(endpoint.parameters ?? []))
    lines.push(...renderRequestBody(endpoint, spec))
    lines.push(...renderResponses(endpoint.responses ?? [], spec))

    lines.push(' */')

    return lines
}
