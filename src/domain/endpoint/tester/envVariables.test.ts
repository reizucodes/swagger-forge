import { describe, it, expect, beforeEach, vi } from 'vitest'
import { buildEnvMap, loadEnvVariables, saveEnvVariables } from './envVariables'
import type { EnvVariable } from './envVariables'

// In-memory localStorage mock
function makeLocalStorageMock() {
  let store: Record<string, string> = {}
  return {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => { store[key] = value }),
    removeItem: vi.fn((key: string) => { delete store[key] }),
    clear: vi.fn(() => { store = {} }),
  }
}

describe('buildEnvMap', () => {
  it('1. empty array — returns {}', () => {
    expect(buildEnvMap([])).toEqual({})
  })

  it('2. single variable — returns { NAME: value }', () => {
    const vars: EnvVariable[] = [{ id: '1', name: 'HOST', value: 'https://api.example.com' }]
    expect(buildEnvMap(vars)).toEqual({ HOST: 'https://api.example.com' })
  })

  it('3. multiple distinct names — returns all entries', () => {
    const vars: EnvVariable[] = [
      { id: '1', name: 'HOST', value: 'https://api.example.com' },
      { id: '2', name: 'TOKEN', value: 'abc123' },
    ]
    expect(buildEnvMap(vars)).toEqual({ HOST: 'https://api.example.com', TOKEN: 'abc123' })
  })

  it('4. duplicate names — last one wins', () => {
    const vars: EnvVariable[] = [
      { id: '1', name: 'X', value: 'first' },
      { id: '2', name: 'X', value: 'second' },
    ]
    expect(buildEnvMap(vars)).toEqual({ X: 'second' })
  })

  it('5. empty name — skipped (not present in output map)', () => {
    const vars: EnvVariable[] = [
      { id: '1', name: '', value: 'ignored' },
      { id: '2', name: 'VALID', value: 'kept' },
    ]
    const result = buildEnvMap(vars)
    expect(Object.keys(result)).not.toContain('')
    expect(result).toEqual({ VALID: 'kept' })
  })

  it('6. whitespace-only name — skipped', () => {
    const vars: EnvVariable[] = [
      { id: '1', name: '   ', value: 'ignored' },
    ]
    const result = buildEnvMap(vars)
    expect(Object.keys(result)).toHaveLength(0)
  })

  it('7. empty value — included in map with empty string value', () => {
    const vars: EnvVariable[] = [{ id: '1', name: 'PREFIX', value: '' }]
    expect(buildEnvMap(vars)).toEqual({ PREFIX: '' })
  })
})

describe('loadEnvVariables / saveEnvVariables', () => {
  let lsMock: ReturnType<typeof makeLocalStorageMock>

  beforeEach(() => {
    lsMock = makeLocalStorageMock()
    vi.stubGlobal('localStorage', lsMock)
  })

  it('1. no item in localStorage — returns []', () => {
    expect(loadEnvVariables()).toEqual([])
  })

  it('2. valid JSON array — returns parsed array', () => {
    const vars: EnvVariable[] = [{ id: 'abc', name: 'X', value: 'y' }]
    lsMock.setItem('apispec-forge:env-variables', JSON.stringify(vars))
    expect(loadEnvVariables()).toEqual(vars)
  })

  it('3. invalid JSON — returns []', () => {
    lsMock.setItem('apispec-forge:env-variables', '{invalid json')
    expect(loadEnvVariables()).toEqual([])
  })

  it('4. array with invalid entries mixed in — filters out invalid, returns valid entries only', () => {
    const mixed = [
      { id: 'ok', name: 'VALID', value: 'yes' },
      { id: 123, name: 'BAD', value: 'bad' }, // id is not string
      null,
      'string-entry',
      { name: 'NO_ID', value: 'x' }, // missing id
    ]
    lsMock.setItem('apispec-forge:env-variables', JSON.stringify(mixed))
    const result = loadEnvVariables()
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('VALID')
  })

  it('5. non-array JSON — returns []', () => {
    lsMock.setItem('apispec-forge:env-variables', JSON.stringify({ name: 'X' }))
    expect(loadEnvVariables()).toEqual([])
  })

  it('6. localStorage throws — returns []', () => {
    lsMock.getItem.mockImplementationOnce(() => { throw new Error('storage error') })
    expect(loadEnvVariables()).toEqual([])
  })

  it('7. saveEnvVariables then loadEnvVariables — round-trips correctly', () => {
    const vars: EnvVariable[] = [
      { id: 'a1', name: 'BASE_URL', value: 'https://api.example.com' },
      { id: 'b2', name: 'TOKEN', value: 'sk-live-abc' },
    ]
    saveEnvVariables(vars)
    expect(loadEnvVariables()).toEqual(vars)
  })
})
