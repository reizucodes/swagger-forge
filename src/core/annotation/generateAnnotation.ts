import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import type { SpecVersion } from '@/core/annotation/specs'
import { getGeneratorDefinition } from '@/core/annotation/registry/generatorRegistry'

// ponytail: strip {{varName}} env var placeholders from path so they never appear in generated output
function stripEnvVars(path: string): string {
    return path.replace(/\{\{[^}]*\}\}/g, '')
}

export function generateAnnotation(
    endpoint: Endpoint,
    target: AnnotationTarget,
    spec: SpecVersion
): string {
    const sanitizedPath = stripEnvVars(endpoint.path)
    const sanitized: Endpoint = {
        ...endpoint,
        path: sanitizedPath,
        parameters: (endpoint.parameters ?? []).filter(p =>
            p.in !== 'path' || sanitizedPath.includes(`{${p.name}}`)
        ),
    }
    return getGeneratorDefinition(target).generator.generate(sanitized, spec)
}
