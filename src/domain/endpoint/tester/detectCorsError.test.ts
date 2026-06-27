import { describe, it, expect } from 'vitest'
import { detectCorsError } from './detectCorsError'

describe('detectCorsError', () => {
  it('returns true for TypeError', () => {
    expect(detectCorsError(new TypeError('Failed to fetch'))).toBe(true)
  })

  it('returns false for Error', () => {
    expect(detectCorsError(new Error('Something went wrong'))).toBe(false)
  })

  it('returns false for string', () => {
    expect(detectCorsError('error string')).toBe(false)
  })

  it('returns false for null', () => {
    expect(detectCorsError(null)).toBe(false)
  })
})
