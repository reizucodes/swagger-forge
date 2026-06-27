import type { EnvVariableMap } from './envVariables'

export interface ResolutionResult {
  resolved: string
  unresolvedTokens: string[]
}

export function resolveVariables(template: string, variables: EnvVariableMap): ResolutionResult {
  const unresolvedTokens: string[] = []
  const TOKEN_RE = /\{\{([^}]*)\}\}/g

  const resolved = template.replace(TOKEN_RE, (_match, rawName: string) => {
    const name = rawName.trim()
    if (Object.prototype.hasOwnProperty.call(variables, name)) {
      return variables[name]
    }
    unresolvedTokens.push(name)
    return _match
  })

  return { resolved, unresolvedTokens }
}
