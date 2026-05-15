import { describe, expect, test } from 'vitest'
import { getGeneratorDefinition, listGeneratorDefinitions } from '@/core/annotation/registry/generatorRegistry'

describe('generatorRegistry', () => {
  test('lists known generator targets', () => {
    const targets = listGeneratorDefinitions().map((d) => d.target)
    expect(targets).toEqual(['php-swagger', 'js-jsdoc', 'openapi-json'])
  })

  test('can resolve generator by target', () => {
    const def = getGeneratorDefinition('php-swagger')
    expect(def.isEnabled).toBe(true)
    expect(def.label).toMatch(/PHP/i)
  })
})

