import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { AnnotationGenerator } from "@/core/annotation/contracts/AnnotationGenerator"
import type { SpecVersion } from "@/core/annotation/specs"

function escapePyStr(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\r/g, '').replace(/\n/g, '\\n')
}

// Maps JsonField schemaType to Python type annotation used in Pydantic models
function toPyFieldType(schemaType: string | undefined): string {
    switch (schemaType) {
        case 'integer': return 'int'
        case 'number':  return 'float'
        case 'boolean': return 'bool'
        case 'array':   return 'list'
        case 'object':  return 'dict'
        case 'file':    return 'bytes'
        default:        return 'str'
    }
}

function toPascalCase(str: string): string {
    return str
        .replace(/[_-](\w)/g, (_, c: string) => c.toUpperCase())
        .replace(/^(\w)/, (_, c: string) => c.toUpperCase())
}

function deriveModelName(endpoint: Endpoint): string {
    if (endpoint.operationId) {
        return toPascalCase(endpoint.operationId) + 'Request'
    }
    const method = endpoint.method.charAt(0).toUpperCase() + endpoint.method.slice(1).toLowerCase()
    const segments = endpoint.path
        .split('/')
        .filter(s => s.length > 0 && !s.startsWith('{'))
        .map(s => toPascalCase(s.replace(/[^a-zA-Z0-9]/g, '_')))
    return `${method}${segments.join('')}Request`
}

function hasJsonBody(endpoint: Endpoint): boolean {
    if (endpoint.method === 'get') return false
    if (!endpoint.requestBodyJsonFields || endpoint.requestBodyJsonFields.length === 0) return false
    const ct = endpoint.requestBodyContentType ?? ''
    return !ct.includes('form')
}

function renderPydanticModel(endpoint: Endpoint): string | null {
    if (!hasJsonBody(endpoint)) return null

    const className = deriveModelName(endpoint)
    const lines: string[] = [`class ${className}(BaseModel):`]
    for (const field of endpoint.requestBodyJsonFields!) {
        const pyType = toPyFieldType(field.schemaType)
        if (field.required) {
            lines.push(`    ${field.property}: ${pyType}`)
        } else {
            lines.push(`    ${field.property}: ${pyType} | None = None`)
        }
    }
    return lines.join('\n')
}

function renderRouteDecorator(endpoint: Endpoint): string {
    const method = endpoint.method.toLowerCase()
    const responses = endpoint.responses ?? []

    const hasExtras = !!(
        endpoint.summary ||
        endpoint.description ||
        endpoint.operationId ||
        (endpoint.tags && endpoint.tags.trim()) ||
        responses.length
    )

    if (!hasExtras) {
        return `@router.${method}("${endpoint.path}")`
    }

    const lines: string[] = []
    lines.push(`@router.${method}(`)
    lines.push(`    "${endpoint.path}",`)
    if (endpoint.summary)                  lines.push(`    summary="${escapePyStr(endpoint.summary)}",`)
    if (endpoint.description)              lines.push(`    description="${escapePyStr(endpoint.description)}",`)
    if (endpoint.operationId)              lines.push(`    operation_id="${escapePyStr(endpoint.operationId)}",`)
    if (endpoint.tags?.trim())             lines.push(`    tags=["${escapePyStr(endpoint.tags)}"],`)
    if (responses.length) {
        lines.push(`    responses={`)
        for (const r of responses) {
            lines.push(`        ${r.code}: {"description": "${escapePyStr(r.description ?? '')}"},`)
        }
        lines.push(`    },`)
    }
    lines.push(')')
    return lines.join('\n')
}

export class PyFastApiGenerator implements AnnotationGenerator {
    generate(endpoint: Endpoint, _spec: SpecVersion): string {
        void _spec
        const model = renderPydanticModel(endpoint)
        const decorator = renderRouteDecorator(endpoint)
        return model ? `${model}\n\n${decorator}` : decorator
    }
}
