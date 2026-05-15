import { describe, expect, test } from 'vitest'
import { applyJsonFieldPatch, getJsonFieldEditorRules } from '@/domain/endpoint/rules/jsonFieldEditing'
import type { JsonField } from '@/domain/endpoint/models/JsonField'

describe('jsonFieldEditing', () => {
  test('form-data disallows array/object and drops children', () => {
    const input: JsonField = {
      property: 'x',
      schemaType: 'object',
      example: '',
      description: '',
      children: [{ property: 'y', schemaType: 'string', example: 'z', description: '', children: [] }],
    }

    const next = applyJsonFieldPatch(input, {}, 'multipart/form-data')
    expect(next.schemaType).toBe('string')
    expect(next.children).toEqual([])

    const rules = getJsonFieldEditorRules(next, 'multipart/form-data')
    expect(rules.allowedSchemaTypes).not.toContain('array')
    expect(rules.allowedSchemaTypes).not.toContain('object')
    expect(rules.disableChildren).toBe(true)
  })

  test('array enforces example vs children exclusivity', () => {
    const input: JsonField = { property: 'arr', schemaType: 'array', example: '', description: '', children: [] }
    const withExample = applyJsonFieldPatch(input, { example: 'a,b' }, 'application/json')
    expect(withExample.children).toEqual([])

    const withChildren = applyJsonFieldPatch(input, { children: [{ property: 'x', schemaType: 'string', example: 'y', description: '' }] }, 'application/json')
    expect(withChildren.example).toBe('')
  })
})

