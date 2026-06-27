import { describe, expect, test } from 'vitest'
import { generateAnnotation } from '@/core/annotation/generateAnnotation'
import { getSpecVersion } from '@/core/annotation/specs'
import type { Endpoint } from '@/domain/endpoint/models/Endpoint'

describe('generateAnnotation', () => {
  test('generates php-swagger output', () => {
    const endpoint: Endpoint = {
      method: 'get',
      path: '/pets/{id}',
      summary: 'Get pet',
      parameters: [
        { id: crypto.randomUUID(), name: 'id', in: 'path', required: true, schemaType: 'integer' },
      ],
      responses: [{ id: crypto.randomUUID(), code: '200', description: 'Success' }],
    }

    const out = generateAnnotation(endpoint, 'php-swagger', getSpecVersion('openapi-3.0.3'))
    expect(out).toContain('@OA\\Get')
    expect(out).toContain('path="/pets/{id}"')
    expect(out).toContain('@OA\\Parameter')
  })

  test('strips {{envVar}} placeholders from path before generating output', () => {
    const endpoint: Endpoint = {
      method: 'get',
      path: '{{fsdev}}/health-status',
      summary: 'Health check',
      responses: [{ id: crypto.randomUUID(), code: '200', description: 'OK' }],
    }

    const out = generateAnnotation(endpoint, 'php-swagger', getSpecVersion('openapi-3.0.3'))
    expect(out).not.toContain('{{fsdev}}')
    expect(out).toContain('path="/health-status"')
  })
})

