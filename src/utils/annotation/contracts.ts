import type { Endpoint } from '../../types'

export interface AnnotationGenerator {
    generate(endpoint: Endpoint): string
}

export type AnnotationTarget =
    | 'php-swagger'
    | 'js-jsdoc'
    | 'openapi-json'
