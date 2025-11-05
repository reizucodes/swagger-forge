import type { Endpoint, JsonField } from '../types/index'

const indent = (n = 1) => ' '.repeat(n * 4)

function escapeForPhpString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/\"/g, '\\"')
}

export function generateOaAnnotation(e: Endpoint): string {
    const lines: string[] = []
    const method = e.method.toUpperCase()

    lines.push('/**')
    lines.push(`*${indent()}@OA\\${capitalize(method)}(`)
    lines.push(`*${indent(2)}path="${escapeForPhpString(e.path)}",`)

    if (e.security?.bearer) lines.push(`*${indent(2)}security={{"sanctum": {}}},`)
    if (e.operationId) lines.push(`*${indent(2)}operationId="${escapeForPhpString(e.operationId)}",`)
    if (e.tags) lines.push(`*${indent(2)}tags={"${escapeForPhpString(e.tags)}"},`)
    if (e.summary) lines.push(`*${indent(2)}summary="${escapeForPhpString(e.summary)}",`)
    if (e.description) lines.push(`*${indent(2)}description="${escapeForPhpString(e.description)}",`)

    // Parameters
    e.parameters?.forEach((p) => {
        lines.push(`*${indent(2)}@OA\\Parameter(`)
        lines.push(`*${indent(3)}name="${escapeForPhpString(p.name)}",`)
        lines.push(`*${indent(3)}in="${p.in}",`)
        if (p.description) lines.push(`*${indent(3)}description="${escapeForPhpString(p.description)}",`)
            lines.push(`*${indent(3)}required=${p.required ? 'true' : 'false'},`)
        if (p.schemaType) lines.push(`*${indent(3)}@OA\\Schema(type="${p.schemaType}"),`)
            lines.push(`*${indent(2)}),`)
    })

    // Request Body
    if (e.method !== 'get' && e.requestBodyJsonFields?.length) {
        lines.push(`*${indent(2)}@OA\\RequestBody(`)
        lines.push(`*${indent(3)}required=true,`)
        lines.push(`*${indent(3)}@OA\\JsonContent(`)

        e.requestBodyJsonFields.forEach((f) => {
            lines.push(...renderJsonField(f, 4))
        })

        lines.push(`*${indent(3)}),`)
        lines.push(`*${indent(2)}),`)
    }

    // Responses
    if (!e.responses?.length) {
        lines.push(`*${indent(2)}@OA\\Response(response=200, description="Success"),`)
    } else {
        e.responses.forEach((r) => {
            const code = r.code ?? '200'
            const desc = escapeForPhpString(r.description ?? 'Success')
            lines.push(`*${indent(2)}@OA\\Response(response=${code}, description="${desc}"),`)
        })
    }

    // Clean last comma
    const last = lines[lines.length - 1]
    lines[lines.length - 1] = last.replace(/,+\s*$/, '')

    lines.push(`*${indent()})`)
    lines.push('*/')
    return lines.join('\n')
}

/**
 * Recursively render @OA\Property or @OA\Items
 */
function renderJsonField(field: JsonField, depth = 3): string[] {
    const pad = indent(depth)
    const lines: string[] = []
    const type = field.schemaType ?? 'string'

    lines.push(`*${pad}@OA\\Property(`)
    if (field.property) lines.push(`*${pad}${indent(1)}property="${escapeForPhpString(field.property)}",`)
        lines.push(`*${pad}${indent(1)}type="${type}",`)
    if (field.description)
        lines.push(`*${pad}${indent(1)}description="${escapeForPhpString(field.description)}",`)
    if (
        field.example !== undefined && 
        field.example !== null && 
        field.example !== '' && 
        field.schemaType !== 'object' && 
        field.schemaType !== 'array'
    )
        lines.push(`*${pad}${indent(1)}example="${escapeForPhpString(String(field.example))}",`)

  // === Recursive logic ===
    if (field.children?.length) {
        if (type === 'array') {
            // array of primitives or array of objects
            lines.push(`*${pad}${indent(1)}@OA\\Items(`)
            field.children.forEach((child) => {
                // const isPrimitive = !child.children?.length && child.schemaType !== 'object'
                // if (isPrimitive) {
                //     lines.push(`*${pad}${indent(2)}type="${child.schemaType ?? 'string'}",`)
                //     if (
                //     child.example !== undefined && 
                //     child.example !== null && 
                //     child.example !== '' && 
                //     child.schemaType !== 'object' && 
                //     child.schemaType !== 'array'
                //     )
                //     lines.push(`*${pad}${indent(2)}example="${escapeForPhpString(String(child.example))}",`)
                // } else {
                //     lines.push(...renderJsonField(child, depth + 2))
                // }
                lines.push(...renderJsonField(child, depth + 2))
            })
            lines.push(`*${pad}${indent(1)}),`)
        } else if (type === 'object') {
            // object with nested fields
            field.children.forEach((child) => {
                lines.push(...renderJsonField(child, depth + 1))
            })
        }
    }

    lines.push(`*${pad}),`)
    return lines
}

function capitalize(s: string) {
    return s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
}
