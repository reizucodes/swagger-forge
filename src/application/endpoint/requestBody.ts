import type { Endpoint } from '@/domain/endpoint/models/Endpoint'
import type { RequestBodyContentType } from '@/domain/endpoint/models/enums'
import { flattenJsonFields } from '@/domain/endpoint/transformers/flattenJsonFields'

export function setRequestBodyContentType(
  endpoint: Endpoint,
  contentType: RequestBodyContentType,
): Endpoint {
  if (contentType === endpoint.requestBodyContentType) return endpoint

  if (contentType === 'multipart/form-data') {
    return {
      ...endpoint,
      requestBodyContentType: contentType,
      requestBodyJsonFields: flattenJsonFields(endpoint.requestBodyJsonFields || []),
    }
  }

  return {
    ...endpoint,
    requestBodyContentType: contentType,
  }
}

