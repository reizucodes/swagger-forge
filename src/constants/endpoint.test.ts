import { describe, it, expect } from 'vitest'
import {
  EMPTY_ENDPOINT,
  SAMPLE_ENDPOINTS,
} from '@/constants/endpoint'

describe('EMPTY_ENDPOINT', () => {
  it('parameters is an empty array', () => {
    expect(EMPTY_ENDPOINT.parameters).toEqual([])
  })

  it('requestBodyJsonFields is an empty array', () => {
    expect(EMPTY_ENDPOINT.requestBodyJsonFields).toEqual([])
  })

  it('responses has at least one item', () => {
    expect(EMPTY_ENDPOINT.responses).toBeDefined()
    expect(EMPTY_ENDPOINT.responses!.length).toBeGreaterThanOrEqual(1)
  })
})

describe('SAMPLE_ENDPOINTS', () => {
  const allEndpoints = [
    ...Object.values(SAMPLE_ENDPOINTS.json),
    ...Object.values(SAMPLE_ENDPOINTS.formData),
  ]

  it('every parameter has a non-empty string id', () => {
    for (const endpoint of allEndpoints) {
      for (const param of endpoint.parameters ?? []) {
        expect(typeof param.id).toBe('string')
        expect(param.id.length).toBeGreaterThan(0)
      }
    }
  })

  it('every response has a non-empty string id', () => {
    for (const endpoint of allEndpoints) {
      for (const response of endpoint.responses ?? []) {
        expect(typeof response.id).toBe('string')
        expect(response.id.length).toBeGreaterThan(0)
      }
    }
  })

  it('every requestBodyJsonField has a non-empty string id', () => {
    for (const endpoint of allEndpoints) {
      for (const field of endpoint.requestBodyJsonFields ?? []) {
        expect(typeof field.id).toBe('string')
        expect((field.id as string).length).toBeGreaterThan(0)
      }
    }
  })
})
