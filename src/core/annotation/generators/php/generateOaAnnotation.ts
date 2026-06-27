import type { Endpoint } from "@/domain/endpoint/models/Endpoint"
import type { JsonField } from "@/domain/endpoint/models/JsonField"
import type { SpecVersion } from '@/core/annotation/specs'

const indent = (n = 1) => ' '.repeat(n * 4)

function escapeForPhpString(s: string): string {
    return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

export function generateOaAnnotation(e: Endpoint, spec: SpecVersion): string {
    const lines: string[] = []
    const method = e.method.toUpperCase()

    lines.push('/**')
    lines.push(`*${indent()}@OA\\${capitalize(method)}(`)
    lines.push(`*${indent(2)}path="${escapeForPhpString(e.path)}",`)

    if (e.security?.type === 'sanctum') {
        lines.push(`*${indent(2)}security={{"sanctum": {}}},`)
    } else if (e.security?.type === 'bearer') {
        lines.push(`*${indent(2)}security={{"bearerAuth": {}}},`)
    } else if (e.security?.type === 'apiKey') {
        lines.push(`*${indent(2)}security={{"apiKeyAuth": {}}},`)
    } else if (e.security?.type === 'jwt') {
        lines.push(`*${indent(2)}security={{"jwt": {}}},`)
    }
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
        if (spec.requestBodyStyle === 'body-parameter') {
            lines.push(`*${indent(2)}@OA\\Parameter(`)
            lines.push(`*${indent(3)}in="body",`)
            lines.push(`*${indent(3)}name="body",`)
            lines.push(`*${indent(3)}required=true,`)
            lines.push(`*${indent(3)}@OA\\Schema(`)
            e.requestBodyJsonFields.forEach((f) => {
                lines.push(...renderJsonField(f, 4))
            })
            lines.push(`*${indent(3)}),`)
            lines.push(`*${indent(2)}),`)
        } else {
            lines.push(`*${indent(2)}@OA\\RequestBody(`)
            lines.push(`*${indent(3)}required=true,`)

            if (e.requestBodyContentType === 'application/json') {
                lines.push(`*${indent(3)}@OA\\JsonContent(`)
                e.requestBodyJsonFields.forEach((f) => {
                    lines.push(...renderJsonField(f, 4))
                })
                lines.push(`*${indent(3)}),`)
            } else if (e.requestBodyContentType === 'multipart/form-data') {
                lines.push(`*${indent(3)}@OA\\MediaType(`)
                lines.push(`*${indent(4)}mediaType="multipart/form-data",`)
                lines.push(`*${indent(4)}@OA\\Schema(`)

                e.requestBodyJsonFields.forEach((f) => {
                    lines.push(...renderJsonField(f, 5))
                })

                lines.push(`*${indent(4)}),`)
                lines.push(`*${indent(3)}),`)
            } else {
                lines.push(`*${indent(3)}@OA\\JsonContent(`)
                e.requestBodyJsonFields.forEach((f) => {
                    lines.push(...renderJsonField(f, 4))
                })
                lines.push(`*${indent(3)}),`)
            }

            lines.push(`*${indent(2)}),`)
        }
    }

    // Responses
    if (!e.responses?.length) {
        lines.push(`*${indent(2)}@OA\\Response(response=200, description="Success"),`)
    } else {
        e.responses.forEach((r) => {
            const code = r.code ?? '200'
            const desc = escapeForPhpString(r.description ?? 'Success')
            if (r.schema?.length) {
                lines.push(`*${indent(2)}@OA\\Response(`)
                lines.push(`*${indent(3)}response=${code},`)
                lines.push(`*${indent(3)}description="${desc}",`)
                lines.push(`*${indent(3)}@OA\\JsonContent(`)
                r.schema.forEach(f => lines.push(...renderJsonField(f, 4)))
                lines.push(`*${indent(3)}),`)
                lines.push(`*${indent(2)}),`)
            } else {
                lines.push(`*${indent(2)}@OA\\Response(response=${code}, description="${desc}"),`)
            }
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
    const isPrimitiveArray =
        field.schemaType === 'array' &&
        field.example !== undefined &&
        field.example !== null &&
        field.example !== ''

    const type = 
        (field.schemaType === 'file' || isPrimitiveArray)
            ? 'string'
            : (field.schemaType ?? 'string');

    const shouldRenderExample =
            field.example !== undefined &&
            field.example !== null &&
            field.example !== '' &&
            field.schemaType !== 'object' &&
            field.schemaType !== 'file';

    lines.push(`*${pad}@OA\\Property(`)
    if (field.property) 
        lines.push(`*${pad}${indent(1)}property="${escapeForPhpString(field.property)}",`)
    if (field.schemaType === 'file')
        lines.push(`*${pad}${indent(1)}format="binary",`)
    lines.push(`*${pad}${indent(1)}type="${type}",`)
    if (field.description)
        lines.push(`*${pad}${indent(1)}description="${escapeForPhpString(field.description)}",`)
    
    if (shouldRenderExample) {
        if (isPrimitiveArray) {
            const raw = String(field.example)
                .replace(/[[\]]/g, '')   // remove [ ]
                .split(',')
                .map(v => v.trim())
                .filter(v => v !== '');

            // detect if array is numeric
            const allNumbers = raw.every(v => !isNaN(Number(v)));
            // format values per type
            const formatted = raw.map(v => {
                if (allNumbers) return v;             // e.g. 1 → 1
                return `"${escapeForPhpString(v)}"`;  // e.g. hello → "hello"
            });

            lines.push(`*${pad}${indent(1)}example={${formatted.join(',')}},`);
        } else {
            lines.push(`*${pad}${indent(1)}example="${escapeForPhpString(String(field.example))}",`
            );
        }
    }

  // === Recursive logic ===
    if (field.children?.length) {
        if (type === 'array') {
            lines.push(`*${pad}${indent(1)}@OA\\Items(`)
            field.children.forEach((child) => {
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
