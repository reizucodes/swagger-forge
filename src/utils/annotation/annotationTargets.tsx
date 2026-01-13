import type { AnnotationTarget } from './contracts'

export interface AnnotationTargetOption {
    value: AnnotationTarget
    label: string
    isDisabled?: boolean
}

export const ANNOTATION_TARGETS: readonly AnnotationTargetOption[] = [
    { value: 'php-swagger', label: 'PHP (Swagger)' },
    { value: 'js-jsdoc', label: 'JavaScript (JSDoc)' , isDisabled: true},
    { value: 'openapi-json', label: 'OpenAPI JSON (Native)', isDisabled:true},
] as const
