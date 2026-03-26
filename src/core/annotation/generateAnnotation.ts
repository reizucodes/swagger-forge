import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import { PhpSwaggerGenerator } from '@/core/annotation/generators/php/phpSwaggerGenerator'
import { JsJsDocGenerator } from '@/core/annotation/generators/js/jsJsDocGenerator'
import { OpenApiJsonGenerator } from '@/core/annotation/generators/openapi/openApiJsonGenerator'

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
