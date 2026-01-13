import type { Endpoint } from '../../types'
import type { AnnotationTarget } from './contracts'
import { PhpSwaggerGenerator } from './generators/php/phpSwaggerGenerator'
import { JsJsDocGenerator } from './generators/js/jsJsDocGenerator'
import { OpenApiJsonGenerator } from './generators/openapi/openApiJsonGenerator'

export function generateAnnotation(
    endpoint: Endpoint,
    target: AnnotationTarget
): string {
    switch (target) {
        case 'php-swagger':
            return new PhpSwaggerGenerator().generate(endpoint)
        case 'js-jsdoc':
            return new JsJsDocGenerator().generate(endpoint)
        case 'openapi-json':
            return new OpenApiJsonGenerator().generate(endpoint)
        default:
            throw new Error(`Unsupported annotation target: ${target}`)
    }
}
