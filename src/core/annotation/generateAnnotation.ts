import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import { getGeneratorDefinition } from '@/core/annotation/registry/generatorRegistry'

export function generateAnnotation(
    endpoint: Endpoint,
    target: AnnotationTarget
): string {
    return getGeneratorDefinition(target).generator.generate(endpoint)
}
