import type { Endpoint } from '../../../../types'
import type { AnnotationGenerator } from '../../contracts'
import { generateOaAnnotation } from './generateOaAnnotation'

export class PhpSwaggerGenerator implements AnnotationGenerator {
  generate(endpoint: Endpoint): string {
    return generateOaAnnotation(endpoint)
  }
}
