export interface EnvVariable {
  id: string
  name: string
  value: string
}

export type EnvVariableMap = Record<string, string>

const STORAGE_KEY = 'apispec-forge:env-variables'

export function loadEnvVariables(): EnvVariable[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (v): v is EnvVariable =>
        typeof v === 'object' &&
        v !== null &&
        typeof v.id === 'string' &&
        typeof v.name === 'string' &&
        typeof v.value === 'string'
    )
  } catch {
    return []
  }
}

export function saveEnvVariables(variables: EnvVariable[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(variables))
  } catch {
    // silent fail — localStorage may be unavailable in private browsing
  }
}

export function buildEnvMap(variables: EnvVariable[]): EnvVariableMap {
  const map: EnvVariableMap = {}
  for (const v of variables) {
    if (!v.name || !v.name.trim()) continue
    map[v.name] = v.value
  }
  return map
}
