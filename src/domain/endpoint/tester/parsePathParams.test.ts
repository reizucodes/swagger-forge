import { describe, it, expect } from 'vitest'
import { parsePathParams } from './parsePathParams'

describe('parsePathParams', () => {
  it('returns empty array for empty string', () => {
    expect(parsePathParams('')).toEqual([])
  })

  it('returns empty array for path with no params', () => {
    expect(parsePathParams('/users/list')).toEqual([])
  })

  it('returns single param', () => {
    expect(parsePathParams('/users/{id}')).toEqual(['id'])
  })

  it('returns multiple params in order', () => {
    expect(parsePathParams('/users/{id}/posts/{postId}')).toEqual(['id', 'postId'])
  })

  it('deduplicates duplicate param names', () => {
    expect(parsePathParams('/users/{id}/other/{id}')).toEqual(['id'])
  })

  it('handles underscores and digits in param names', () => {
    expect(parsePathParams('/items/{item_id2}/sub/{sub_3}')).toEqual(['item_id2', 'sub_3'])
  })
})
