import type { AnnotationGenerator } from '@/core/annotation/contracts/AnnotationGenerator'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import { PhpSwaggerGenerator } from '@/core/annotation/generators/php/phpSwaggerGenerator'
import { JsJsDocGenerator } from '@/core/annotation/generators/js/jsJsDocGenerator'
import { OpenApiJsonGenerator } from '@/core/annotation/generators/openapi/openApiJsonGenerator'

export interface GeneratorDefinition {
  target: AnnotationTarget
  label: string
  description?: string
  isEnabled: boolean
  generator: AnnotationGenerator
}

const definitions = [
  {
    target: 'php-swagger',
    label: 'PHP (Swagger)',
    description: 'PHPDoc annotations for swagger-php / l5-swagger.',
    isEnabled: true,
    generator: new PhpSwaggerGenerator(),
  },
  {
    target: 'js-jsdoc',
    label: 'JavaScript (JSDoc)',
    description: 'JSDoc @openapi blocks (swagger-jsdoc).',
    isEnabled: false,
    generator: new JsJsDocGenerator(),
  },
  {
    target: 'openapi-json',
    label: 'OpenAPI JSON (Native)',
    description: 'A native OpenAPI 3.0 JSON document.',
    isEnabled: false,
    generator: new OpenApiJsonGenerator(),
  },
] as const satisfies readonly GeneratorDefinition[]

const byTarget: Record<AnnotationTarget, GeneratorDefinition> = definitions.reduce(
  (acc, def) => {
    acc[def.target] = def
    return acc
  },
  {} as Record<AnnotationTarget, GeneratorDefinition>,
)

export function listGeneratorDefinitions(): readonly GeneratorDefinition[] {
  return definitions
}

export function getGeneratorDefinition(target: AnnotationTarget): GeneratorDefinition {
  return byTarget[target]
}

