export type JsonErrorKind = 'duplicateKey' | 'trailingComma' | 'unquotedString'

export interface JsonErrorDef {
  tip: string
  squiggleColor: string
}

export const JSON_ERROR_DEFS: Record<JsonErrorKind, JsonErrorDef> = {
  duplicateKey: {
    tip: 'Duplicate object key',
    squiggleColor: '#f59e0b',
  },
  trailingComma: {
    tip: 'Trailing comma',
    squiggleColor: '#f59e0b',
  },
  unquotedString: {
    tip: 'Unquoted string',
    squiggleColor: '#f87171',
  },
}
