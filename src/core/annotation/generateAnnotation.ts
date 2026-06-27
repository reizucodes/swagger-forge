import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import type { SpecVersion } from '@/core/annotation/specs'
import { getGeneratorDefinition } from '@/core/annotation/registry/generatorRegistry'

export function generateAnnotation(
    endpoint: Endpoint,
    target: AnnotationTarget,
    spec: SpecVersion
): string {
    return getGeneratorDefinition(target).generator.generate(endpoint, spec)
}
