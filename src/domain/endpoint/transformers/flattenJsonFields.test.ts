import { describe, expect, test } from 'vitest'
import { flattenJsonFields } from '@/domain/endpoint/transformers/flattenJsonFields'

describe('flattenJsonFields', () => {
  test('drops children and coerces object/array to string', () => {
    const flattened = flattenJsonFields([
      {
        property: 'obj',
        schemaType: 'object',
        example: '',
        description: 'd',
        children: [{ property: 'x', schemaType: 'string', example: 'y', description: '', children: [] }],
      },
      {
        property: 'arr',
        schemaType: 'array',
        example: 'a,b',
        description: '',
        children: [{ property: 'x', schemaType: 'string', example: 'y', description: '', children: [] }],
      },
    ])

    expect(flattened).toEqual([
      { property: 'obj', schemaType: 'string', example: '', description: 'd', children: [] },
      { property: 'arr', schemaType: 'string', example: 'a,b', description: '', children: [] },
    ])
  })
})

