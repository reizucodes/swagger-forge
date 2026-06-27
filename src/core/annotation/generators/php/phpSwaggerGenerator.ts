import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationGenerator } from '@/core/annotation/contracts/AnnotationGenerator'
import type { SpecVersion } from '@/core/annotation/specs'
import { generateOaAnnotation } from '@/core/annotation/generators/php/generateOaAnnotation'

export class PhpSwaggerGenerator implements AnnotationGenerator {
  generate(endpoint: Endpoint, spec: SpecVersion): string {
    return generateOaAnnotation(endpoint, spec)
  }
}
