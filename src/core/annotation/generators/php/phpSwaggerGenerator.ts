import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationGenerator } from '@/core/annotation/contracts/AnnotationGenerator'
import { generateOaAnnotation } from '@/core/annotation/generators/php/generateOaAnnotation'

export class PhpSwaggerGenerator implements AnnotationGenerator {
  generate(endpoint: Endpoint): string {
    return generateOaAnnotation(endpoint)
  }
}
