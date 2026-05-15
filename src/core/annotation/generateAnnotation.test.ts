import { describe, expect, test } from 'vitest'
import { generateAnnotation } from '@/core/annotation/generateAnnotation'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'

describe('generateAnnotation', () => {
  test('generates php-swagger output', () => {
    const endpoint: Endpoint = {
      method: 'get',
      path: '/pets/{id}',
      summary: 'Get pet',
      parameters: [
        { name: 'id', in: 'path', required: true, schemaType: 'integer' },
      ],
      responses: [{ code: '200', description: 'Success' }],
    }

    const out = generateAnnotation(endpoint, 'php-swagger')
    expect(out).toContain('@OA\\Get')
    expect(out).toContain('path="/pets/{id}"')
    expect(out).toContain('@OA\\Parameter')
  })
})

