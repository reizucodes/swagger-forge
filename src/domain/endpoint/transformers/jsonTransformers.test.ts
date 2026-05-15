import { describe, expect, test } from 'vitest'
import { objectToJsonField } from '@/domain/endpoint/transformers/objectToJsonField'
import { jsonFieldToObject } from '@/domain/endpoint/transformers/jsonFieldToObject'

describe('json field transformers', () => {
  test('round-trips object -> fields -> object (basic)', () => {
    const input = {
      id: 123,
      name: 'Doggie',
      active: true,
      price: 10.5,
      tags: ['cute', 'friendly'],
      category: { id: 1, name: 'Dogs' },
    }

    const fields = objectToJsonField(input)
    const output = jsonFieldToObject(fields)

    expect(output.id).toBe(123)
    expect(output.name).toBe('Doggie')
    expect(output.active).toBe(true)
    expect(output.price).toBe(10.5)
    expect(output.tags).toEqual(['cute', 'friendly'])
    expect(output.category).toEqual({ id: 1, name: 'Dogs' })
  })

  test('skips empty property keys', () => {
    const output = jsonFieldToObject([
      { property: '', schemaType: 'string', example: 'x', children: [] },
      { property: 'ok', schemaType: 'string', example: 'y', children: [] },
    ])
    expect(output).toEqual({ ok: 'y' })
  })
})

