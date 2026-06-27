import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationGenerator } from '@/core/annotation/contracts/AnnotationGenerator'
import type { SpecVersion } from '@/core/annotation/specs'
import { generatePhpAttribute } from '@/core/annotation/generators/php/generatePhpAttribute'

export class PhpAttributeGenerator implements AnnotationGenerator {
  generate(endpoint: Endpoint, spec: SpecVersion): string {
    return generatePhpAttribute(endpoint, spec)
  }
}
