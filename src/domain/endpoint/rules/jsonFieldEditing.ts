import type { JsonField } from '@/domain/endpoint/models/JsonField'
import type { RequestBodyContentType, SchemaType } from '@/domain/endpoint/models/enums'

export interface JsonFieldEditorRules {
  allowedSchemaTypes: readonly SchemaType[]
  disableExample: boolean
  disableChildren: boolean
}

function baseSchemaTypes(contentType?: RequestBodyContentType): SchemaType[] {
  const base: SchemaType[] = ['string', 'integer', 'boolean', 'number', 'array', 'object']
  if (contentType === 'multipart/form-data') base.push('file')
  return base
}

export function getJsonFieldEditorRules(
  field: JsonField,
  contentType?: RequestBodyContentType,
): JsonFieldEditorRules {
  const hasChildren = (field.children?.length ?? 0) > 0
  const hasExample = field.example !== undefined && field.example !== null && field.example !== ''

  const isFormData = contentType === 'multipart/form-data'
  const allowedSchemaTypes = isFormData
    ? baseSchemaTypes(contentType).filter((t) => t !== 'array' && t !== 'object')
    : baseSchemaTypes(contentType)

  let disableExample = false
  let disableChildren = false

  if (field.schemaType === 'object') {
    disableExample = true
  }

  if (field.schemaType === 'file' && contentType === 'multipart/form-data') {
    disableExample = true
  }

  if (field.schemaType === 'array') {
    if (hasChildren) disableExample = true
    if (hasExample) disableChildren = true
  }

  if (isFormData) {
    disableChildren = true
    if (field.schemaType === 'file') disableExample = true
  }

  return { allowedSchemaTypes, disableExample, disableChildren }
}

export function applyJsonFieldPatch(
  current: JsonField,
  patch: Partial<JsonField>,
  contentType?: RequestBodyContentType,
): JsonField {
  const next: JsonField = { ...current, ...patch }

  const isFormData = contentType === 'multipart/form-data'

  // Content-type restrictions first: form-data is effectively a flat key/value map.
  if (isFormData) {
    if (next.schemaType === 'array' || next.schemaType === 'object') {
      next.schemaType = 'string'
    }
    next.children = []
  }

  // Keep "file" editable for application/json (current UX expectation) but ensure stable shape.
  if (next.schemaType === 'file' && contentType === 'application/json') {
    if (next.example === undefined || next.example === null) next.example = ''
  }

  // If switching to object: examples are not meaningful.
  if (next.schemaType === 'object') {
    next.example = ''
  }

  // Arrays: enforce "either primitive example OR children shape".
  if (next.schemaType === 'array') {
    const hasChildren = (next.children?.length ?? 0) > 0
    const hasExample = next.example !== undefined && next.example !== null && next.example !== ''

    if (hasChildren) next.example = ''
    if (hasExample) next.children = []
  }

  // Schema type change should reset incompatible state (mirrors previous UI behavior).
  if (patch.schemaType && patch.schemaType !== current.schemaType) {
    if (patch.schemaType === 'object') {
      next.children = next.children ?? []
      next.example = ''
    } else if (patch.schemaType === 'array') {
      next.children = next.children ?? []
      next.example = next.example ?? ''
    } else {
      next.children = []
    }
  }

  return next
}

