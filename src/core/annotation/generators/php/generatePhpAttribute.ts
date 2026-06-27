import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { JsonField } from '@/domain/endpoint/models/JsonField'
import type { SpecVersion } from '@/core/annotation/specs'

const indent = (n = 1) => '    '.repeat(n)

function escapePhpSingleQuote(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function phpStr(s: string): string {
    return `'${escapePhpSingleQuote(s)}'`
}

function capitalize(s: string): string {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}

export function generatePhpAttribute(e: Endpoint, spec: SpecVersion): string {
    if (spec.requestBodyStyle === 'body-parameter') {
        return [
            '// PHP Attributes require swagger-php v4+',
            '// which only supports OpenAPI 3.x.',
            '// Switch to OpenAPI 3.0.3 or 3.1.0 for this format.',
        ].join('\n')
    }
    const method = capitalize(e.method)
    const lines: string[] = []

    lines.push(`#[OA\\${method}(`)
    lines.push(`${indent(1)}path: ${phpStr(e.path)},`)

    if (e.operationId) lines.push(`${indent(1)}operationId: ${phpStr(e.operationId)},`)
    if (e.summary) lines.push(`${indent(1)}summary: ${phpStr(e.summary)},`)
    if (e.description) lines.push(`${indent(1)}description: ${phpStr(e.description)},`)
    if (e.tags) lines.push(`${indent(1)}tags: [${phpStr(e.tags)}],`)

    // Security
    const secType = e.security?.type
    if (secType && secType !== 'none') {
        const secMap: Record<string, string> = {
            sanctum: 'sanctum',
            bearer: 'bearerAuth',
            jwt: 'jwtAuth',
            apiKey: 'apiKeyAuth',
        }
        const key = secMap[secType]
        if (key) {
            lines.push(`${indent(1)}security: [['${key}' => []]],`)
        }
    }

    // Parameters
    if (e.parameters?.length) {
        lines.push(`${indent(1)}parameters: [`)
        e.parameters.forEach((p) => {
            lines.push(`${indent(2)}new OA\\Parameter(`)
            lines.push(`${indent(3)}name: ${phpStr(p.name)},`)
            lines.push(`${indent(3)}in: ${phpStr(p.in)},`)
            lines.push(`${indent(3)}required: ${p.required ? 'true' : 'false'},`)
            if (p.description) lines.push(`${indent(3)}description: ${phpStr(p.description)},`)
            if (p.schemaType) lines.push(`${indent(3)}schema: new OA\\Schema(type: ${phpStr(p.schemaType)}),`)
            lines.push(`${indent(2)}),`)
        })
        lines.push(`${indent(1)}],`)
    }

    // Request Body (skip for GET)
    if (e.method !== 'get' && e.requestBodyJsonFields?.length) {
        lines.push(`${indent(1)}requestBody: new OA\\RequestBody(`)
        lines.push(`${indent(2)}required: true,`)

        if (e.requestBodyContentType === 'multipart/form-data') {
            lines.push(`${indent(2)}content: new OA\\MediaType(`)
            lines.push(`${indent(3)}mediaType: 'multipart/form-data',`)
            lines.push(`${indent(3)}schema: new OA\\Schema(`)
            lines.push(`${indent(4)}properties: [`)
            e.requestBodyJsonFields.forEach((f) => {
                lines.push(...renderProperty(f, 5))
            })
            lines.push(`${indent(4)}],`)
            lines.push(`${indent(3)}),`)
            lines.push(`${indent(2)}),`)
        } else {
            // application/json and fallback
            lines.push(`${indent(2)}content: new OA\\JsonContent(`)
            lines.push(`${indent(3)}properties: [`)
            e.requestBodyJsonFields.forEach((f) => {
                lines.push(...renderProperty(f, 4))
            })
            lines.push(`${indent(3)}],`)
            lines.push(`${indent(2)}),`)
        }

        lines.push(`${indent(1)}),`)
    }

    // Responses
    lines.push(`${indent(1)}responses: [`)
    if (!e.responses?.length) {
        lines.push(`${indent(2)}new OA\\Response(response: 200, description: 'Success'),`)
    } else {
        e.responses.forEach((r) => {
            const code = r.code ?? '200'
            const desc = escapePhpSingleQuote(r.description ?? 'Success')
            if (r.schema?.length) {
                lines.push(`${indent(2)}new OA\\Response(`)
                lines.push(`${indent(3)}response: ${code},`)
                lines.push(`${indent(3)}description: '${desc}',`)
                lines.push(`${indent(3)}content: new OA\\JsonContent(`)
                lines.push(`${indent(4)}properties: [`)
                r.schema.forEach((f) => lines.push(...renderProperty(f, 5)))
                lines.push(`${indent(4)}],`)
                lines.push(`${indent(3)}),`)
                lines.push(`${indent(2)}),`)
            } else {
                lines.push(`${indent(2)}new OA\\Response(response: ${code}, description: '${desc}'),`)
            }
        })
    }
    lines.push(`${indent(1)}],`)

    // Close attribute — remove trailing comma from last line before closing
    const last = lines[lines.length - 1]
    lines[lines.length - 1] = last.replace(/,\s*$/, '')

    lines.push(`)]`)
    return lines.join('\n')
}

function renderProperty(field: JsonField, depth: number): string[] {
    const pad = indent(depth)
    const lines: string[] = []

    const isPrimitiveArray =
        field.schemaType === 'array' &&
        field.example !== undefined &&
        field.example !== null &&
        field.example !== ''

    const type =
        field.schemaType === 'file' || isPrimitiveArray
            ? 'string'
            : (field.schemaType ?? 'string')

    const shouldRenderExample =
        field.example !== undefined &&
        field.example !== null &&
        field.example !== '' &&
        field.schemaType !== 'object' &&
        field.schemaType !== 'file'

    lines.push(`${pad}new OA\\Property(`)
    lines.push(`${pad}${indent(1)}property: ${phpStr(field.property)},`)
    lines.push(`${pad}${indent(1)}type: ${phpStr(type)},`)
    if (field.schemaType === 'file') {
        lines.push(`${pad}${indent(1)}format: 'binary',`)
    }
    if (field.description) {
        lines.push(`${pad}${indent(1)}description: ${phpStr(field.description)},`)
    }

    if (shouldRenderExample) {
        if (isPrimitiveArray) {
            const raw = String(field.example)
                .replace(/[[\]]/g, '')
                .split(',')
                .map((v) => v.trim())
                .filter((v) => v !== '')
            const allNumbers = raw.every((v) => !isNaN(Number(v)))
            const formatted = raw.map((v) => (allNumbers ? v : phpStr(v)))
            lines.push(`${pad}${indent(1)}example: [${formatted.join(', ')}],`)
        } else {
            lines.push(`${pad}${indent(1)}example: ${phpStr(String(field.example))},`)
        }
    }

    // Recursive children
    if (field.children?.length) {
        if (type === 'array') {
            lines.push(`${pad}${indent(1)}items: new OA\\Items(`)
            lines.push(`${pad}${indent(2)}properties: [`)
            field.children.forEach((child) => lines.push(...renderProperty(child, depth + 3)))
            lines.push(`${pad}${indent(2)}],`)
            lines.push(`${pad}${indent(1)}),`)
        } else if (type === 'object') {
            lines.push(`${pad}${indent(1)}properties: [`)
            field.children.forEach((child) => lines.push(...renderProperty(child, depth + 2)))
            lines.push(`${pad}${indent(1)}],`)
        }
    }

    lines.push(`${pad}),`)
    return lines
}
