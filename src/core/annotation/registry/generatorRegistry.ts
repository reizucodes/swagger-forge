import type { AnnotationGenerator } from '@/core/annotation/contracts/AnnotationGenerator'
import type { AnnotationTarget } from '@/core/annotation/contracts/AnnotationTarget'
import type { SpecVersionId } from '@/core/annotation/specs'
import { PhpSwaggerGenerator } from '@/core/annotation/generators/php/phpSwaggerGenerator'
import { PhpAttributeGenerator } from '@/core/annotation/generators/php/phpAttributeGenerator'
import { JsJsDocGenerator } from '@/core/annotation/generators/js/jsJsDocGenerator'
import { OpenApiJsonGenerator } from '@/core/annotation/generators/openapi/openApiJsonGenerator'

export interface GeneratorDefinition {
  target: AnnotationTarget
  label: string
  group?: string
  description?: string
  isEnabled: boolean
  generator: AnnotationGenerator
  supportedSpecs: SpecVersionId[]
}

const definitions = [
  {
    target: 'php-swagger',
    label: 'DocBlock',
    group: 'PHP',
    description: 'PHPDoc annotations for swagger-php / l5-swagger.',
    isEnabled: true,
    generator: new PhpSwaggerGenerator(),
    supportedSpecs: ['swagger-2.0', 'openapi-3.0.3', 'openapi-3.1.0'] as SpecVersionId[],
  },
  {
    target: 'php-attribute',
    label: 'Attributes (PHP 8+)',
    group: 'PHP',
    description: 'Native PHP 8 attributes for swagger-php v4+.',
    isEnabled: true,
    generator: new PhpAttributeGenerator(),
    supportedSpecs: ['openapi-3.0.3', 'openapi-3.1.0'] as SpecVersionId[],
  },
  {
    target: 'js-jsdoc',
    label: 'JSDoc',
    group: 'JavaScript',
    description: 'JSDoc @openapi blocks (swagger-jsdoc).',
    isEnabled: false,
    generator: new JsJsDocGenerator(),
    supportedSpecs: ['openapi-3.0.3', 'openapi-3.1.0'] as SpecVersionId[],
  },
  {
    target: 'openapi-json',
    label: 'OpenAPI JSON',
    group: 'Other',
    description: 'A native OpenAPI 3.0 JSON document.',
    isEnabled: false,
    generator: new OpenApiJsonGenerator(),
    supportedSpecs: ['swagger-2.0', 'openapi-3.0.3', 'openapi-3.1.0'] as SpecVersionId[],
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

