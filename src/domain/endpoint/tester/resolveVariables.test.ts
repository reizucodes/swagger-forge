import { describe, it, expect } from 'vitest'
import { resolveVariables } from './resolveVariables'

describe('resolveVariables', () => {
  it('1. no tokens — returns original string unchanged, unresolvedTokens = []', () => {
    const result = resolveVariables('https://api.example.com/users', {})
    expect(result.resolved).toBe('https://api.example.com/users')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('2. single token, variable defined — replaces token, unresolvedTokens = []', () => {
    const result = resolveVariables('{{BASE_URL}}/users', { BASE_URL: 'https://api.example.com' })
    expect(result.resolved).toBe('https://api.example.com/users')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('3. single token, variable undefined — leaves token, unresolvedTokens = ["VAR_NAME"]', () => {
    const result = resolveVariables('{{USER_ID}}', {})
    expect(result.resolved).toBe('{{USER_ID}}')
    expect(result.unresolvedTokens).toEqual(['USER_ID'])
  })

  it('4. multiple tokens, all defined — replaces all tokens', () => {
    const result = resolveVariables('{{HOST}}/users/{{USER_ID}}', {
      HOST: 'https://api.example.com',
      USER_ID: '42',
    })
    expect(result.resolved).toBe('https://api.example.com/users/42')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('5. multiple tokens, some undefined — replaces defined, leaves undefined, lists only undefined names', () => {
    const result = resolveVariables('{{HOST}}/users/{{USER_ID}}', { HOST: 'https://api.example.com' })
    expect(result.resolved).toBe('https://api.example.com/users/{{USER_ID}}')
    expect(result.unresolvedTokens).toEqual(['USER_ID'])
  })

  it('6. same token appears twice — both occurrences replaced', () => {
    const result = resolveVariables('{{VAR}}-{{VAR}}', { VAR: 'hello' })
    expect(result.resolved).toBe('hello-hello')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('7. empty variable value — token replaced with "", unresolvedTokens = []', () => {
    const result = resolveVariables('https://{{PREFIX}}api.example.com', { PREFIX: '' })
    expect(result.resolved).toBe('https://api.example.com')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('8. token with leading/trailing whitespace in name — trims name before lookup', () => {
    const result = resolveVariables('{{  VAR  }}', { VAR: 'trimmed' })
    expect(result.resolved).toBe('trimmed')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('9. malformed {{no-close — not matched, passed through unchanged', () => {
    const result = resolveVariables('hello {{no-close world', {})
    expect(result.resolved).toBe('hello {{no-close world')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('10. empty token {{}} — left as-is, "" recorded in unresolvedTokens', () => {
    const result = resolveVariables('{{}}', {})
    expect(result.resolved).toBe('{{}}')
    expect(result.unresolvedTokens).toEqual([''])
  })

  it('11. adjacent tokens {{A}}{{B}} — both resolved independently', () => {
    const result = resolveVariables('{{A}}{{B}}', { A: 'foo', B: 'bar' })
    expect(result.resolved).toBe('foobar')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('12. token inside JSON value — resolves correctly', () => {
    const result = resolveVariables('{"key":"{{TOKEN}}"}', { TOKEN: 'my-value' })
    expect(result.resolved).toBe('{"key":"my-value"}')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('13. token in URL path segment — resolves correctly', () => {
    const result = resolveVariables('https://{{HOST}}/users', { HOST: 'api.example.com' })
    expect(result.resolved).toBe('https://api.example.com/users')
    expect(result.unresolvedTokens).toEqual([])
  })

  it('14. nested reference — variable value itself contains {{B}}, not resolved (single-pass)', () => {
    const result = resolveVariables('{{A}}', { A: '{{B}}', B: 'should-not-appear' })
    expect(result.resolved).toBe('{{B}}')
    expect(result.unresolvedTokens).toEqual([])
  })
})
